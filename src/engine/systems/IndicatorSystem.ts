import * as PIXI from 'pixi.js';
import { ResourceNode } from '../../entities/ResourceNode';

export class IndicatorSystem {
    private container: PIXI.Container;
    private mineralArrow: PIXI.Graphics;
    private gasArrow: PIXI.Graphics;
    private playerContainer: PIXI.Container;

    constructor(stage: PIXI.Container, playerContainer: PIXI.Container) {
        this.container = new PIXI.Container();
        stage.addChild(this.container);
        this.playerContainer = playerContainer;

        this.mineralArrow = this.createArrow(0x00f2ff);
        this.gasArrow = this.createArrow(0x5bfb88);

        this.container.addChild(this.mineralArrow);
        this.container.addChild(this.gasArrow);
    }

    private createArrow(color: number): PIXI.Graphics {
        const arrow = new PIXI.Graphics();
        // Draw a sleek arrow pointing UP (0 radians)
        arrow.poly([
            0, -10,  // Tip
            5, 0,    // Right base
            2, 0,    // Right inner
            2, 8,    // Right bottom
            -2, 8,   // Left bottom
            -2, 0,   // Left inner
            -5, 0    // Left base
        ]);
        arrow.fill(color);
        arrow.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
        arrow.alpha = 0; // Hidden by default
        return arrow;
    }

    public update(resourceNodes: ResourceNode[]) {
        const playerX = this.playerContainer.x;
        const playerY = this.playerContainer.y;

        let nearestMineral: ResourceNode | null = null;
        let minMineralDist = Infinity;

        let nearestGas: ResourceNode | null = null;
        let minGasDist = Infinity;

        for (const node of resourceNodes) {
            if (node.isDestroyed || node.remainingResources <= 0) continue;

            const dx = node.container.x - playerX;
            const dy = node.container.y - playerY;
            const distSq = dx * dx + dy * dy;

            if (node.nodeType === 'mineral') {
                if (distSq < minMineralDist) {
                    minMineralDist = distSq;
                    nearestMineral = node;
                }
            } else {
                if (distSq < minGasDist) {
                    minGasDist = distSq;
                    nearestGas = node;
                }
            }
        }

        this.updateArrow(this.mineralArrow, nearestMineral, playerX, playerY);
        this.updateArrow(this.gasArrow, nearestGas, playerX, playerY);
    }

    private updateArrow(arrow: PIXI.Graphics, target: ResourceNode | null, px: number, py: number) {
        if (!target) {
            arrow.alpha = 0;
            return;
        }

        const dx = target.container.x - px;
        const dy = target.container.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Hide arrow if node is on screen or very close
        const margin = 100;
        if (dist < 400) {
            arrow.alpha = Math.max(0, (dist - 150) / 250) * 0.6;
        } else {
            arrow.alpha = 0.8;
        }

        if (arrow.alpha > 0) {
            const angle = Math.atan2(dy, dx);
            const radius = 60; // Distance from player center
            
            arrow.x = px + Math.cos(angle) * radius;
            arrow.y = py + Math.sin(angle) * radius;
            arrow.rotation = angle + Math.PI / 2; // Adjust because arrow is drawn pointing up
            
            // Pulse animation
            const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
            arrow.scale.set(pulse);
        }
    }
}
