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

export class Zergling extends Enemy {
    public health: number = 20;
    public speed: number = 2;
    public damage: number = 5;
    public xpValue: number = 10;

    private body: PIXI.Graphics;
    private claws: PIXI.Graphics;

    constructor(x: number, y: number) {
        super(x, y);
        this.body = new PIXI.Graphics();
        this.claws = new PIXI.Graphics();
        this.draw();
        
        const enemyContainer = new PIXI.Container();
        enemyContainer.addChild(this.body);
        enemyContainer.addChild(this.claws);
        this.setVisual(enemyContainer);
    }

    private draw() {
        const primaryColor = 0x6b2b91;
        const secondaryColor = 0x4a1a6a;
        const eyeColor = 0xffe600;
        const clawColor = 0xc0c0c0;

        const shadow = new PIXI.Graphics();
        shadow.ellipse(0, 5, 12, 6);
        shadow.fill({ color: 0x000000, alpha: 0.3 });
        (this.visual as PIXI.Container).addChildAt(shadow, 0);

        this.body.clear();
        this.body.ellipse(0, 0, 15, 10);
        this.body.fill(primaryColor);
        this.body.stroke({ width: 2, color: secondaryColor });
        this.body.circle(10, 0, 7);
        this.body.fill(primaryColor);
        this.body.circle(14, -3, 2);
        this.body.fill(eyeColor);
        this.body.circle(14, 3, 2);
        this.body.fill(eyeColor);

        this.claws.clear();
        this.claws.poly([5, -5, 18, -12, 10, -3]);
        this.claws.fill(clawColor);
        this.claws.poly([5, 3, 18, 10, 10, 5]);
        this.claws.fill(clawColor);
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, 20);
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
            this.container.x += (dx / dist) * this.speed * delta;
            this.container.y += (dy / dist) * this.speed * delta;
            this.container.rotation = Math.atan2(dy, dx);
            
            this.animationTime += delta * 0.2;
            this.claws.rotation = Math.sin(this.animationTime) * 0.3;
            this.body.scale.set(1, 1 + Math.sin(this.animationTime * 0.5) * 0.05);
        }
    }
}

export class Mutalisk extends Enemy {
    public health: number = 15;
    public speed: number = 4; // Faster
    public damage: number = 3;
    public xpValue: number = 20;

    private wings: PIXI.Graphics;
    private body: PIXI.Graphics;

    constructor(x: number, y: number) {
        super(x, y);
        this.body = new PIXI.Graphics();
        this.wings = new PIXI.Graphics();
        this.draw();
        
        const enemyContainer = new PIXI.Container();
        enemyContainer.addChild(this.wings);
        enemyContainer.addChild(this.body);
        this.setVisual(enemyContainer);
    }

    private draw() {
        const bodyColor = 0x8a2be2; // Lighter Purple
        const wingColor = 0x4b0082;

        const shadow = new PIXI.Graphics();
        shadow.ellipse(0, 15, 10, 5);
        shadow.fill({ color: 0x000000, alpha: 0.2 });
        (this.visual as PIXI.Container).addChildAt(shadow, 0);

        // Body (Glider shape)
        this.body.clear();
        this.body.poly([15, 0, -10, -5, -5, 0, -10, 5]);
        this.body.fill(bodyColor);
        this.body.stroke({ width: 1, color: 0x000000 });
        
        // Eyes
        this.body.circle(12, -2, 1.5);
        this.body.fill(0xff0000);
        this.body.circle(12, 2, 1.5);
        this.body.fill(0xff0000);

        // Wings
        this.wings.clear();
        this.wings.poly([0, 0, -15, -20, 5, -5]); // Left
        this.wings.poly([0, 0, -15, 20, 5, 5]);   // Right
        this.wings.fill(wingColor);
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, 15);
        
        // Sinuous movement (zigzag)
        this.animationTime += delta * 0.1;
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
            const angle = Math.atan2(dy, dx);
            const sideStep = Math.sin(this.animationTime * 2) * 2; // Zigzag
            
            this.container.x += (Math.cos(angle) * this.speed + Math.cos(angle + Math.PI/2) * sideStep) * delta;
            this.container.y += (Math.sin(angle) * this.speed + Math.sin(angle + Math.PI/2) * sideStep) * delta;
            
            this.container.rotation = angle;
            
            // Flapping wings
            this.wings.scale.y = 0.5 + Math.sin(this.animationTime * 5) * 0.5;
        }
    }
}
