import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { useGameStore } from '../stores/gameStore';

export type NodeType = 'mineral' | 'gas';

export class ResourceNode extends Entity {
    public nodeType: NodeType;
    public harvestRange: number = 80;
    public harvestRate: number; // per second
    
    private gameStore = useGameStore();
    private glowFilter: PIXI.Graphics;
    private timer = 0;
    
    constructor(x: number, y: number, nodeType: NodeType) {
        super();
        this.container.x = x;
        this.container.y = y;
        this.nodeType = nodeType;
        this.harvestRate = nodeType === 'mineral' ? 18 : 8;

        const graphics = new PIXI.Graphics();
        this.glowFilter = new PIXI.Graphics();
        this.container.addChild(this.glowFilter);

        if (nodeType === 'mineral') {
            // Draw mineral crystal cluster (Terran blue crystals)
            // Main crystal
            graphics.poly([-12, 10, 0, -25, 12, 10, 0, 15]);
            graphics.fill(0x00f2ff);
            graphics.stroke({ width: 2, color: 0xffffff });

            // Side crystals
            graphics.poly([-22, 15, -12, -10, -5, 15]);
            graphics.fill(0x00aeff);
            graphics.stroke({ width: 1.5, color: 0x9be8ff });

            graphics.poly([5, 15, 15, -5, 22, 15]);
            graphics.fill(0x00aeff);
            graphics.stroke({ width: 1.5, color: 0x9be8ff });
            
            // Draw glow
            this.glowFilter.circle(0, 0, 30);
            this.glowFilter.fill({ color: 0x00f2ff, alpha: 0.15 });
        } else {
            // Draw Vespene Gas Geyser (Green dome / vent)
            // Geyser base
            graphics.ellipse(0, 10, 25, 12);
            graphics.fill(0x2a2f3a);
            graphics.stroke({ width: 2.5, color: 0x111318 });

            // Vent opening
            graphics.ellipse(0, 4, 15, 6);
            graphics.fill(0x1a8c3d);
            graphics.stroke({ width: 2, color: 0x5bfb88 });

            // Small green details
            graphics.circle(-10, 12, 4);
            graphics.fill(0x5bfb88);
            graphics.circle(10, 8, 3);
            graphics.fill(0x5bfb88);

            // Draw glow
            this.glowFilter.circle(0, 0, 35);
            this.glowFilter.fill({ color: 0x5bfb88, alpha: 0.12 });
        }

        this.setVisual(graphics);
        
        // Hide health bar since resource nodes are invulnerable
        this.healthBar.visible = false;
    }

    public update(delta: number) {
        // Unused directly as we update in engine with player reference
    }

    public updateWithPlayer(delta: number, playerPos: { x: number; y: number }, deltaMs: number) {
        if (this.isDestroyed) return;

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.timer += delta * 0.05;
        
        if (dist <= this.harvestRange) {
            // Animate intense mining glow
            this.glowFilter.alpha = 0.5 + Math.sin(this.timer * 3) * 0.4;
            
            // Calculate resources harvested in this frame
            const dtSeconds = deltaMs / 1000;
            const amount = this.harvestRate * dtSeconds;
            
            if (this.nodeType === 'mineral') {
                this.gameStore.addMinerals(amount);
            } else {
                this.gameStore.addGas(amount);
            }

            // Draw a mining beam/spark occasionally
            if (Math.random() < 0.1) {
                this.createSpark(dx, dy);
            }
        } else {
            // Default ambient glow pulse
            this.glowFilter.alpha = 0.3 + Math.sin(this.timer) * 0.1;
        }
    }

    private createSpark(dx: number, dy: number) {
        // Draw a tiny spark flying towards player direction
        const spark = new PIXI.Graphics();
        const size = 2 + Math.random() * 3;
        spark.circle(0, 0, size);
        spark.fill(this.nodeType === 'mineral' ? 0x00f2ff : 0x5bfb88);
        spark.x = (Math.random() - 0.5) * 20;
        spark.y = (Math.random() - 0.5) * 10;
        this.container.addChild(spark);

        let age = 0;
        const ticker = (t: PIXI.Ticker) => {
            age += t.deltaTime * 0.08;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                spark.x += (dx / dist) * t.deltaTime * 3;
                spark.y += (dy / dist) * t.deltaTime * 3;
            }
            spark.alpha = 1 - age;
            if (age >= 1) {
                this.container.removeChild(spark);
                spark.destroy();
                PIXI.Ticker.shared.remove(ticker);
            }
        };
        PIXI.Ticker.shared.add(ticker);
    }
}
