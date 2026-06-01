import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export class Projectile extends Entity {
    public speed: number = 10;
    public damage: number = 10;
    public direction: { x: number, y: number };
    public lifeTime: number = 2000; // ms

    constructor(x: number, y: number, direction: { x: number, y: number }) {
        super();
        this.direction = direction;
        
        const graphics = new PIXI.Graphics();
        graphics.rect(-5, -2, 10, 4);
        graphics.fill(0xffff00);
        
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
