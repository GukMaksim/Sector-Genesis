import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export class XpGem extends Entity {
    public value: number;
    private isCollected: boolean = false;
    private speed: number = 0;
    private maxSpeed: number = 15;
    private acceleration: number = 0.5;

    constructor(x: number, y: number, value: number) {
        super();
        this.value = value;
        
        const graphics = new PIXI.Graphics();
        graphics.poly([0, -6, 4, 0, 0, 6, -4, 0]); // Diamond shape
        graphics.fill(0x00f2ff); // Cyan glow
        graphics.stroke({ width: 1, color: 0xffffff });
        
        this.setVisual(graphics);
        this.container.x = x;
        this.container.y = y;
    }

    public update() {}

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }, pickupRange: number) {
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (this.isCollected || dist < pickupRange) {
            this.isCollected = true;
            this.speed = Math.min(this.speed + this.acceleration * delta, this.maxSpeed);
            
            this.container.x += (dx / dist) * this.speed * delta;
            this.container.y += (dy / dist) * this.speed * delta;

            if (dist < 10) {
                return true; // Should be removed and XP added
            }
        }
        return false;
    }
}
