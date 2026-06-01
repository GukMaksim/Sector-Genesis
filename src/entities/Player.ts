import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { InputManager } from '../engine/managers/InputManager';
import { useGameStore } from '../stores/gameStore';

export class Player extends Entity {
    public baseSpeed: number = 5;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    
    private dollContainer: PIXI.Container;
    private body: PIXI.Graphics;
    private backpack: PIXI.Graphics;
    private weapon: PIXI.Graphics;
    private glow: PIXI.Graphics;
    
    private input: InputManager;
    private gameStore = useGameStore();
    private lastEvolvedStage = -1;

    constructor() {
        super();
        this.input = InputManager.getInstance();
        
        this.dollContainer = new PIXI.Container();
        this.setVisual(this.dollContainer);
        
        this.backpack = new PIXI.Graphics();
        this.body = new PIXI.Graphics();
        this.weapon = new PIXI.Graphics();
        this.glow = new PIXI.Graphics();
        
        this.drawMarine();
        
        this.dollContainer.addChild(this.backpack);
        this.dollContainer.addChild(this.body);
        this.dollContainer.addChild(this.weapon);
        this.dollContainer.addChild(this.glow);

        this.container.x = window.innerWidth / 2;
        this.container.y = window.innerHeight / 2;
        
        this.maxHealth = this.gameStore.currentStage.statModifiers.health || 100;
        this.currentHealth = this.maxHealth;
    }

    private drawMarine() {
        const bodyColor = 0x2b5d91; 
        const shoulderColor = 0x3d7cb8;
        const visorColor = 0x00f2ff;
        const metalColor = 0x444444;

        // Shadow
        const shadow = new PIXI.Graphics();
        shadow.ellipse(0, 10, 22, 12);
        shadow.fill({ color: 0x000000, alpha: 0.3 });
        this.dollContainer.addChildAt(shadow, 0);

        // 1. Backpack / Life Support
        this.backpack.clear();
        this.backpack.roundRect(-18, -8, 36, 16, 4);
        this.backpack.fill(0x1a1a1a);
        this.backpack.stroke({ width: 2, color: 0x000000 });
        // Exhaust vents
        this.backpack.circle(-12, -4, 3);
        this.backpack.fill(0x333333);
        this.backpack.circle(12, -4, 3);
        this.backpack.fill(0x333333);

        // 2. Main Body Armor
        this.body.clear();
        this.body.roundRect(-15, -12, 30, 24, 6);
        this.body.fill(bodyColor);
        this.body.stroke({ width: 2, color: 0x112233 });
        
        // Chest plate detail
        this.body.rect(-10, -8, 20, 4);
        this.body.fill(0x1a3a5a);

        // 3. Shoulders (Massive Power Armor feel)
        this.body.circle(-18, -4, 11);
        this.body.fill(shoulderColor);
        this.body.stroke({ width: 2, color: 0x112233 });
        this.body.circle(18, -4, 11);
        this.body.fill(shoulderColor);
        this.body.stroke({ width: 2, color: 0x112233 });

        // 4. Helmet
        this.body.circle(0, -6, 9);
        this.body.fill(bodyColor);
        this.body.stroke({ width: 1.5, color: 0x112233 });
        // Visor with highlight
        this.body.rect(-6, -9, 12, 5); 
        this.body.fill(visorColor);
        this.body.rect(-5, -8, 4, 1); // Highlight
        this.body.fill(0xffffff, 0.5);

        // 5. Gauss Rifle (Detailed)
        this.weapon.clear();
        this.weapon.rect(12, -2, 28, 6); // Barrel
        this.weapon.fill(metalColor);
        this.weapon.rect(10, -5, 14, 12); // Body
        this.weapon.fill(0x222222);
        this.weapon.rect(20, -4, 8, 4); // Rails
        this.weapon.fill(0x333333);
        // Ammo drum
        this.weapon.roundRect(12, 4, 6, 8, 2);
        this.weapon.fill(0x111111);

        // 6. Glows
        this.glow.clear();
        this.glow.circle(-18, -4, 2); // Left shoulder light
        this.glow.fill(visorColor);
        this.glow.circle(18, -4, 2); // Right shoulder light
        this.glow.fill(visorColor);
    }

    private applyEvolutionVisuals() {
        if (this.gameStore.currentStageIndex === this.lastEvolvedStage) return;
        this.lastEvolvedStage = this.gameStore.currentStageIndex;

        // Visual evolution: Marauder (Heavy, Red armor, massive dual cannons)
        const bodyColor = 0x912b2b; 
        const shoulderColor = 0xb83d3d;
        const glowColor = 0xff6600;

        this.backpack.clear();
        // Massive Jump Pack
        this.backpack.roundRect(-25, -10, 50, 20, 6);
        this.backpack.fill(0x222222);
        this.backpack.rect(-20, -12, 10, 24); // Engine 1
        this.backpack.fill(0x111111);
        this.backpack.rect(10, -12, 10, 24); // Engine 2
        this.backpack.fill(0x111111);

        this.body.clear();
        this.body.roundRect(-22, -18, 44, 36, 10); // Massive frame
        this.body.fill(bodyColor);
        this.body.stroke({ width: 3, color: 0x4a1111 });

        // Reinforced Shoulders
        this.body.circle(-24, -4, 15);
        this.body.fill(shoulderColor);
        this.body.stroke({ width: 2, color: 0x4a1111 });
        this.body.circle(24, -4, 15);
        this.body.fill(shoulderColor);
        this.body.stroke({ width: 2, color: 0x4a1111 });

        // Heavy Helmet
        this.body.circle(0, -8, 11);
        this.body.fill(bodyColor);
        this.body.stroke({ width: 2, color: 0x4a1111 });
        this.body.rect(-7, -11, 14, 6); 
        this.body.fill(glowColor);

        this.weapon.clear();
        // Massive Dual Grenade Launchers
        this.weapon.rect(18, -16, 25, 10); // Upper gun
        this.weapon.fill(0x333333);
        this.weapon.rect(38, -15, 6, 8); // Muzzle
        this.weapon.fill(0x111111);
        
        this.weapon.rect(18, 6, 25, 10); // Lower gun
        this.weapon.fill(0x333333);
        this.weapon.rect(38, 7, 6, 8); // Muzzle
        this.weapon.fill(0x111111);

        this.glow.clear();
        this.glow.rect(20, -14, 10, 2); // Upper weapon glow
        this.glow.fill(glowColor);
        this.glow.rect(20, 8, 10, 2); // Lower weapon glow
        this.glow.fill(glowColor);
        
        // Update stats for evolution
        this.maxHealth += 100;
        this.currentHealth = this.maxHealth;
    }

    public takeDamage(amount: number) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.gameStore.isGameOver = true;
        }
    }

    public get speed(): number {
        return this.baseSpeed * this.gameStore.stats.speedMult * (this.gameStore.currentStage.statModifiers.speed || 1);
    }

    public update(delta: number, targetPos: { x: number, y: number } | null = null) {
        const move = this.input.movementVector;
        
        this.updateHealthBar(this.currentHealth, this.maxHealth);

        if (this.gameStore.currentStageIndex > 0) {
            this.applyEvolutionVisuals();
        }

        // 1. Handle Body Rotation (faces movement)
        if (move.x !== 0 || move.y !== 0) {
            const moveRotation = Math.atan2(move.y, move.x);
            this.body.rotation = moveRotation;
            this.backpack.rotation = moveRotation;
            
            // Walking animation
            const bobTime = Date.now() * 0.015;
            const bobbing = Math.sin(bobTime) * 2;
            this.body.y = bobbing;
            this.backpack.y = bobbing * 0.8;
            this.glow.alpha = 0.7 + Math.sin(bobTime * 2) * 0.3;
        } else {
            // Idle
            const breathingTime = Date.now() * 0.003;
            const breathing = Math.sin(breathingTime) * 0.04;
            this.body.scale.set(1, 1 + breathing);
            this.backpack.scale.set(1, 1 + breathing * 0.5);
            this.glow.alpha = 0.5 + Math.sin(breathingTime) * 0.2;
        }

        // 2. Handle Weapon Aiming (faces target)
        if (targetPos) {
            const dx = targetPos.x - this.container.x;
            const dy = targetPos.y - this.container.y;
            const aimRotation = Math.atan2(dy, dx);
            
            this.weapon.rotation = aimRotation;
            this.glow.rotation = aimRotation; // Glow usually follows weapon/aim
        } else if (move.x !== 0 || move.y !== 0) {
            // Default aim to movement if no target
            const moveRotation = Math.atan2(move.y, move.x);
            this.weapon.rotation = moveRotation;
            this.glow.rotation = moveRotation;
        }
    }
}
