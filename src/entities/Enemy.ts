import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export abstract class Enemy extends Entity {
    public abstract health: number;
    public abstract speed: number;
    public abstract damage: number;
    public abstract xpValue: number;

    protected animationTime: number = Math.random() * 100;

    constructor(x: number, y: number) {
        super();
        this.container.x = x;
        this.container.y = y;
    }

    public update() {}

    public abstract updateWithPlayer(delta: number, playerPos: { x: number, y: number }): void;

    public takeDamage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}

const Direction = {
    DOWN: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3
} as const;
type Direction = (typeof Direction)[keyof typeof Direction];

export class Zergling extends Enemy {
    public health: number = 20;
    public speed: number = 2;
    public damage: number = 5;
    public xpValue: number = 10;

    private animations: Map<Direction, PIXI.AnimatedSprite> = new Map();
    private currentDirection: Direction = Direction.DOWN;
    private spriteContainer: PIXI.Container;
    private shadow: PIXI.Graphics;
    
    private spriteScale: number = 0.4;

    constructor(x: number, y: number) {
        super(x, y);

        this.spriteContainer = new PIXI.Container();
        this.setVisual(this.spriteContainer);

        // Add a simple shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.ellipse(0, 16, 18, 6);
        this.shadow.fill({ color: 0x000000, alpha: 0.3 });
        this.spriteContainer.addChild(this.shadow);

        this.setupAnimations();
    }

    private setupAnimations() {
        const texture = PIXI.Assets.get('/characters/monsters/monster1.png');
        if (!texture) {
            console.error('Monster texture not found!');
            return;
        }

        const frameWidth = texture.width / 3;
        const frameHeight = texture.height / 4;

        for (let row = 0; row < 4; row++) {
            const frames: PIXI.Texture[] = [];
            for (let col = 0; col < 3; col++) {
                const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                frames.push(new PIXI.Texture({ source: texture.source, frame: rect }));
            }

            const anim = new PIXI.AnimatedSprite(frames);
            anim.anchor.set(0.5, 0.5);
            anim.animationSpeed = 0.12;
            anim.scale.set(this.spriteScale);
            anim.visible = false;
            
            this.animations.set(row as Direction, anim);
            this.spriteContainer.addChild(anim);
        }

        // Set default animation
        const defaultAnim = this.animations.get(this.currentDirection);
        if (defaultAnim) {
            defaultAnim.visible = true;
            defaultAnim.play();
        }
    }

    private setDirection(newDirection: Direction) {
        if (this.currentDirection === newDirection) return;

        const prevAnim = this.animations.get(this.currentDirection);
        if (prevAnim) {
            prevAnim.visible = false;
            prevAnim.stop();
        }
        
        this.currentDirection = newDirection;
        const newAnim = this.animations.get(this.currentDirection);
        if (newAnim) {
            newAnim.visible = true;
            newAnim.play();
        }
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, 20);
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            const moveX = (dx / dist) * this.speed * delta;
            const moveY = (dy / dist) * this.speed * delta;
            
            this.container.x += moveX;
            this.container.y += moveY;
            
            // Determine direction
            let newDir = this.currentDirection;
            if (Math.abs(dx) > Math.abs(dy)) {
                newDir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                newDir = dy > 0 ? Direction.DOWN : Direction.UP;
            }
            this.setDirection(newDir);

            this.animationTime += delta * 0.2;
        }
    }
}

export class Mutalisk extends Enemy {
    public health: number = 15;
    public speed: number = 4;
    public damage: number = 3;
    public xpValue: number = 20;

    private animations: Map<Direction, PIXI.AnimatedSprite> = new Map();
    private currentDirection: Direction = Direction.DOWN;
    private spriteContainer: PIXI.Container;
    private shadow: PIXI.Graphics;
    
    private spriteScale: number = 0.4;

    constructor(x: number, y: number) {
        super(x, y);

        this.spriteContainer = new PIXI.Container();
        this.setVisual(this.spriteContainer);

        // Add a simple shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.ellipse(0, 20, 22, 7);
        this.shadow.fill({ color: 0x000000, alpha: 0.25 });
        this.spriteContainer.addChild(this.shadow);

        this.setupAnimations();
    }

    private setupAnimations() {
        const texture = PIXI.Assets.get('/characters/monsters/monster2.png');
        if (!texture) {
            console.error('Monster 2 texture not found!');
            return;
        }

        const frameWidth = texture.width / 3;
        const frameHeight = texture.height / 4;

        for (let row = 0; row < 4; row++) {
            const frames: PIXI.Texture[] = [];
            for (let col = 0; col < 3; col++) {
                const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                frames.push(new PIXI.Texture({ source: texture.source, frame: rect }));
            }

            const anim = new PIXI.AnimatedSprite(frames);
            anim.anchor.set(0.5, 0.5);
            anim.animationSpeed = 0.15;
            anim.scale.set(this.spriteScale);
            anim.visible = false;
            
            this.animations.set(row as Direction, anim);
            this.spriteContainer.addChild(anim);
        }

        // Set default animation
        const defaultAnim = this.animations.get(this.currentDirection);
        if (defaultAnim) {
            defaultAnim.visible = true;
            defaultAnim.play();
        }
    }

    private setDirection(newDirection: Direction) {
        if (this.currentDirection === newDirection) return;

        const prevAnim = this.animations.get(this.currentDirection);
        if (prevAnim) {
            prevAnim.visible = false;
            prevAnim.stop();
        }
        
        this.currentDirection = newDirection;
        const newAnim = this.animations.get(this.currentDirection);
        if (newAnim) {
            newAnim.visible = true;
            newAnim.play();
        }
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, 15);

        this.animationTime += delta * 0.1;
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            const angle = Math.atan2(dy, dx);
            // Keep the side-step movement but use directions for visual
            const sideStep = Math.sin(this.animationTime * 2) * 2.5;

            const moveX = (Math.cos(angle) * this.speed + Math.cos(angle + Math.PI / 2) * sideStep) * delta;
            const moveY = (Math.sin(angle) * this.speed + Math.sin(angle + Math.PI / 2) * sideStep) * delta;

            this.container.x += moveX;
            this.container.y += moveY;

            // Determine direction based on actual movement or target
            let newDir = this.currentDirection;
            if (Math.abs(dx) > Math.abs(dy)) {
                newDir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                newDir = dy > 0 ? Direction.DOWN : Direction.UP;
            }
            this.setDirection(newDir);
        }
    }
}
