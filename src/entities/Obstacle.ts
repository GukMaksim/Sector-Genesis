import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export type ObstacleType = 'building' | 'wall' | 'water' | 'trees' | 'rocks';

const OBSTACLE_CONFIG: Record<ObstacleType, { radius: number; slowFactor: number }> = {
    building: { radius: 45, slowFactor: 0.3 },
    wall:     { radius: 22, slowFactor: 0.35 },
    water:    { radius: 40, slowFactor: 0.5 },
    trees:    { radius: 28, slowFactor: 0.4 },
    rocks:    { radius: 20, slowFactor: 0.45 },
};

const TEXTURE_PATH: Record<ObstacleType, string> = {
    building: '/obstacles/building.png',
    wall:     '/obstacles/wall.png',
    water:    '/obstacles/water.png',
    trees:    '/obstacles/trees.png',
    rocks:    '/obstacles/rocks.png',
};

export class Obstacle extends Entity {
    public obstacleType: ObstacleType;
    public radius: number;
    public slowFactor: number;
    public blocksProjectiles: boolean = true;

    private spriteContainer: PIXI.Container;
    private shadow: PIXI.Graphics;

    constructor(x: number, y: number, type: ObstacleType) {
        super();

        this.container.x = x;
        this.container.y = y;
        this.obstacleType = type;
        this.radius = OBSTACLE_CONFIG[type].radius;
        this.slowFactor = OBSTACLE_CONFIG[type].slowFactor;

        this.spriteContainer = new PIXI.Container();
        this.setVisual(this.spriteContainer);
        this.healthBar.visible = false;

        // Shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.ellipse(0, this.radius * 0.6, this.radius * 0.9, this.radius * 0.35);
        this.shadow.fill({ color: 0x000000, alpha: 0.25 });
        this.spriteContainer.addChild(this.shadow);

        this.buildVisual();
    }

    private buildVisual() {
        const texture = PIXI.Assets.get(TEXTURE_PATH[this.obstacleType]);
        if (!texture) {
            console.error(`Obstacle texture not found: ${TEXTURE_PATH[this.obstacleType]}`);
            return;
        }

        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.5);

        // Scale so the sprite fits roughly within its collision radius × 2
        const scaleX = (this.radius * 2) / texture.width;
        const scaleY = (this.radius * 2) / texture.height;
        sprite.scale.set(Math.max(scaleX, scaleY) * 0.9);

        this.spriteContainer.addChild(sprite);

        // Water gets a shimmer overlay
        if (this.obstacleType === 'water') {
            this.addWaterShimmer();
        }
    }

    private addWaterShimmer() {
        const shimmer = new PIXI.Graphics();
        shimmer.ellipse(-6, -4, 12, 6);
        shimmer.fill({ color: 0xffffff, alpha: 0.25 });
        shimmer.ellipse(8, 3, 8, 4);
        shimmer.fill({ color: 0xffffff, alpha: 0.15 });
        this.spriteContainer.addChild(shimmer);

        let t = Math.random() * 100;
        const animate = () => {
            if (this.isDestroyed) return;
            t += 0.04;
            shimmer.alpha = 0.2 + Math.sin(t) * 0.12;
            requestAnimationFrame(animate);
        };
        animate();
    }

    public update() {
        // handled via rAF shimmer for water
    }
}
