import * as PIXI from 'pixi.js';

export abstract class Entity {
    public container: PIXI.Container;
    public visual: PIXI.Container; 
    public isDestroyed: boolean = false;
    
    protected healthBar: PIXI.Graphics;

    constructor() {
        this.container = new PIXI.Container();
        this.visual = new PIXI.Graphics();
        this.container.addChild(this.visual);
        
        this.healthBar = new PIXI.Graphics();
        this.container.addChild(this.healthBar);
    }

    public setVisual(visual: PIXI.Container) {
        this.container.removeChild(this.visual);
        this.visual = visual;
        this.container.addChildAt(this.visual, 0);
    }

    protected updateHealthBar(current: number, max: number, width: number = 40) {
        this.healthBar.clear();
        if (current >= max) return; // Hide if full

        const percent = Math.max(0, current / max);
        const height = 4;
        const yOffset = -30;

        // Background
        this.healthBar.rect(-width / 2, yOffset, width, height);
        this.healthBar.fill(0x333333);
        
        // Fill
        this.healthBar.rect(-width / 2, yOffset, width * percent, height);
        this.healthBar.fill(percent > 0.3 ? 0x00ff00 : 0xff0000);
    }

    public abstract update(delta: number): void;

    public destroy() {
        this.isDestroyed = true;
        this.container.destroy({ children: true });
    }
}
