import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export interface ProjectileOptions {
    speed?: number;
    damage?: number;
    size?: number;
    color?: number;
    lifeTime?: number;
    splashRadius?: number;
}

export class Projectile extends Entity {
    public speed: number = 10;
    public damage: number = 10;
    public splashRadius: number = 0;
    public direction: { x: number, y: number };
    public lifeTime: number = 2000; // ms

    constructor(x: number, y: number, direction: { x: number, y: number }, options: ProjectileOptions = {}) {
        super();
        this.direction = direction;
        this.speed = options.speed ?? this.speed;
        this.damage = options.damage ?? this.damage;
        this.lifeTime = options.lifeTime ?? this.lifeTime;
        this.splashRadius = options.splashRadius ?? 0;
        
        const graphics = new PIXI.Graphics();
        const size = options.size ?? 1;
        const halfWidth = 5 * size;
        const halfHeight = 2 * size;
        graphics.rect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
        graphics.fill(options.color ?? 0xffff00);
        
        this.setVisual(graphics);
        this.container.x = x;
        this.container.y = y;
        
        // Rotate towards direction
        this.container.rotation = Math.atan2(direction.y, direction.x);

        setTimeout(() => this.destroy(), this.lifeTime);
    }

    public update(delta: number) {
        this.container.x += this.direction.x * this.speed * delta;
        this.container.y += this.direction.y * this.speed * delta;
    }
}
