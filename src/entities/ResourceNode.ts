import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { useGameStore } from '../stores/gameStore';

export type NodeType = 'mineral' | 'gas';

export class ResourceNode extends Entity {
    public nodeType: NodeType;
    public harvestRange: number = 80;
    public harvestRate: number; // per second
    public remainingResources: number;
    public maxResources: number;
    
    private gameStore = useGameStore();
    private glowFilter: PIXI.Graphics;
    private amountText: PIXI.Text;
    private timer = 0;
    
    constructor(x: number, y: number, nodeType: NodeType) {
        super();
        this.container.x = x;
        this.container.y = y;
        this.nodeType = nodeType;
        this.harvestRate = nodeType === 'mineral' ? 4 : 4;
        
        // Initial resource capacity
        this.maxResources = nodeType === 'mineral' ? 25 : 25;
        this.remainingResources = this.maxResources;

        const sprite = new PIXI.Sprite(PIXI.Assets.get(nodeType === 'mineral' ? '/ui/field_minerals.png' : '/ui/field_gas.png'));
        this.glowFilter = new PIXI.Graphics();
        this.container.addChild(this.glowFilter);
        this.container.addChild(sprite);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.5); // Adjust scale as needed

        // Add resource amount label
        this.amountText = new PIXI.Text({
            text: Math.floor(this.remainingResources).toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: nodeType === 'mineral' ? 0x00f2ff : 0x5bfb88,
                align: 'center',
                stroke: { color: 0x000000, width: 3 }
            }
        });
        this.amountText.anchor.set(0.5);
        this.amountText.y = -50; // Position above the sprite
        this.container.addChild(this.amountText);

        // Draw glow
        this.glowFilter.circle(0, 0, nodeType === 'mineral' ? 30 : 35);
        this.glowFilter.fill({ color: nodeType === 'mineral' ? 0x00f2ff : 0x5bfb88, alpha: 0.15 });

        this.setVisual(sprite);
        
        // Hide health bar since resource nodes are invulnerable
        this.healthBar.visible = false;
    }

    public update() {
        // Unused directly as we update in engine with player reference
    }

    public updateWithPlayer(delta: number, playerPos: { x: number; y: number }, deltaMs: number) {
        if (this.isDestroyed) return;

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.timer += delta * 0.05;
        
        if (dist <= this.harvestRange && this.remainingResources > 0) {
            // Animate intense mining glow
            this.glowFilter.alpha = 0.5 + Math.sin(this.timer * 3) * 0.4;
            
            // Calculate resources harvested in this frame
            const dtSeconds = deltaMs / 1000;
            let amount = this.harvestRate * dtSeconds;
            
            // Clamp to remaining resources
            amount = Math.min(amount, this.remainingResources);
            this.remainingResources -= amount;
            
            if (this.nodeType === 'mineral') {
                this.gameStore.addMinerals(amount);
            } else {
                this.gameStore.addGas(amount);
            }

            // Update amount label
            this.amountText.text = Math.floor(this.remainingResources).toString();

            // Visual feedback: shrink slightly as resources deplete
            const scale = 0.4 + (this.remainingResources / this.maxResources) * 0.6;
            this.container.scale.set(scale);

            // Draw a mining beam/spark occasionally
            if (Math.random() < 0.1) {
                this.createSpark(dx, dy);
            }

            if (this.remainingResources <= 0) {
                this.isDestroyed = true;
                this.container.visible = false;
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
            if (this.isDestroyed || spark.destroyed) {
                PIXI.Ticker.shared.remove(ticker);
                return;
            }
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
