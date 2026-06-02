import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { InputManager } from '../engine/managers/InputManager';
import { useGameStore } from '../stores/gameStore';

type MarineStyle = {
    profile: 'marine' | 'veteran' | 'heavy' | 'psi' | 'command';
    body: number;
    bodyShade: number;
    shoulder: number;
    visor: number;
    metal: number;
    trim: number;
    glow: number;
    backpack: number;
    accent: number;
    rifle: number;
    helmetHighlight: number;
    emblem: number;
};

export class Player extends Entity {
    public baseSpeed: number = 5;
    public maxHealth: number = 100;
    public currentHealth: number = 100;

    private dollContainer: PIXI.Container;
    private shadow: PIXI.Graphics;
    private leftLeg: PIXI.Graphics;
    private rightLeg: PIXI.Graphics;
    private leftArm: PIXI.Graphics;
    private rightArm: PIXI.Graphics;
    private torso: PIXI.Graphics;
    private helmet: PIXI.Graphics;
    private backpack: PIXI.Graphics;
    private weapon: PIXI.Graphics;
    private glow: PIXI.Graphics;
    private chestLight: PIXI.Graphics;
    private statusRing: PIXI.Graphics;
    private baseMaxHealth: number;
    private evolutionHealthBonus = 0;
    private baseScaleX: number = 1.04;
    private baseScaleY: number = 0.92;

    private input: InputManager;
    private gameStore = useGameStore();
    private lastEvolvedStage = -1;
    private currentStyle: MarineStyle;

    constructor() {
        super();
        this.input = InputManager.getInstance();

        this.currentStyle = this.getStyleForStage(0);

        this.dollContainer = new PIXI.Container();
        this.setVisual(this.dollContainer);
        this.dollContainer.skew.set(-0.12, 0);
        this.dollContainer.scale.set(this.baseScaleX, this.baseScaleY);
        this.dollContainer.y = -1;

        this.shadow = new PIXI.Graphics();
        this.leftLeg = new PIXI.Graphics();
        this.rightLeg = new PIXI.Graphics();
        this.leftArm = new PIXI.Graphics();
        this.rightArm = new PIXI.Graphics();
        this.torso = new PIXI.Graphics();
        this.helmet = new PIXI.Graphics();
        this.backpack = new PIXI.Graphics();
        this.weapon = new PIXI.Graphics();
        this.glow = new PIXI.Graphics();
        this.chestLight = new PIXI.Graphics();
        this.statusRing = new PIXI.Graphics();

        this.drawModel(this.currentStyle);

        this.dollContainer.addChild(this.shadow);
        this.dollContainer.addChild(this.leftLeg);
        this.dollContainer.addChild(this.rightLeg);
        this.dollContainer.addChild(this.leftArm);
        this.dollContainer.addChild(this.rightArm);
        this.dollContainer.addChild(this.backpack);
        this.dollContainer.addChild(this.torso);
        this.dollContainer.addChild(this.chestLight);
        this.dollContainer.addChild(this.helmet);
        this.dollContainer.addChild(this.weapon);
        this.dollContainer.addChild(this.glow);
        this.dollContainer.addChild(this.statusRing);

        this.container.x = window.innerWidth / 2;
        this.container.y = window.innerHeight / 2;

        this.baseMaxHealth = this.gameStore.currentStage.statModifiers.health || 100;
        this.syncMaxHealth(true);
    }

    private getStyleForStage(stageIndex: number): MarineStyle {
        switch (stageIndex) {
            case 1:
                return {
                    profile: 'veteran',
                    body: 0x346da6,
                    bodyShade: 0x1e3f61,
                    shoulder: 0x4a8bcd,
                    visor: 0x60f2ff,
                    metal: 0x54606d,
                    trim: 0x1b2c3f,
                    glow: 0x85f7ff,
                    backpack: 0x1e2630,
                    accent: 0xa8d7ff,
                    rifle: 0x5e6872,
                    helmetHighlight: 0xbdefff,
                    emblem: 0xf1f5ff,
                };
            case 2:
                return {
                    profile: 'heavy',
                    body: 0x7e332f,
                    bodyShade: 0x4f1f1d,
                    shoulder: 0xae5149,
                    visor: 0xff9b42,
                    metal: 0x4a4f58,
                    trim: 0x2f1512,
                    glow: 0xffbb66,
                    backpack: 0x20242a,
                    accent: 0xffcf95,
                    rifle: 0x4b4f57,
                    helmetHighlight: 0xffd2aa,
                    emblem: 0xffb27a,
                };
            case 3:
                return {
                    profile: 'psi',
                    body: 0x6a4fb8,
                    bodyShade: 0x342564,
                    shoulder: 0x8a6dff,
                    visor: 0x9af2ff,
                    metal: 0x6a7287,
                    trim: 0x231b46,
                    glow: 0xc7ffff,
                    backpack: 0x1f2030,
                    accent: 0xb7a6ff,
                    rifle: 0x5d6475,
                    helmetHighlight: 0xe7e3ff,
                    emblem: 0xcda9ff,
                };
            case 4:
                return {
                    profile: 'command',
                    body: 0x9f7a23,
                    bodyShade: 0x5d4210,
                    shoulder: 0xe2be68,
                    visor: 0xfff08c,
                    metal: 0x8c7a52,
                    trim: 0x3c2b09,
                    glow: 0xfff5ad,
                    backpack: 0x2d2718,
                    accent: 0xffe18f,
                    rifle: 0x8d7b4a,
                    helmetHighlight: 0xfff2c9,
                    emblem: 0xffd96b,
                };
            default:
                return {
                    profile: 'marine',
                    body: 0x2d5d94,
                    bodyShade: 0x1f3d61,
                    shoulder: 0x4380be,
                    visor: 0x00f2ff,
                    metal: 0x4a4a4a,
                    trim: 0x13223c,
                    glow: 0x86fbff,
                    backpack: 0x1d2430,
                    accent: 0x9de8ff,
                    rifle: 0x444444,
                    helmetHighlight: 0xdffeff,
                    emblem: 0xeafcff,
                };
        }
    }

    private syncMaxHealth(restoreFull = false) {
        const bonusMultiplier = 1 + this.gameStore.stats.maxHealthBonus;
        const desiredMaxHealth = Math.max(1, Math.round((this.baseMaxHealth + this.evolutionHealthBonus) * bonusMultiplier));

        if (desiredMaxHealth !== this.maxHealth) {
            const currentRatio = this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 1;
            this.maxHealth = desiredMaxHealth;
            this.currentHealth = restoreFull
                ? this.maxHealth
                : Math.min(this.maxHealth, Math.max(1, Math.round(this.maxHealth * currentRatio)));
            return;
        }

        if (restoreFull) {
            this.currentHealth = this.maxHealth;
        }
    }

    private drawRoundedLeg(graphics: PIXI.Graphics, x: number, y: number, style: MarineStyle, mirrored = false) {
        graphics.clear();
        graphics.position.set(x, y);
        graphics.scale.set(mirrored ? -1 : 1, 1);
        graphics.roundRect(0, 0, 8, 18, 4);
        graphics.fill(style.bodyShade);
        graphics.stroke({ width: 1.5, color: style.trim });

        graphics.roundRect(1, 2, 6, 14, 3);
        graphics.fill(style.body);
        graphics.rect(2, 7, 3, 5);
        graphics.fill(style.trim);
    }

    private drawArm(graphics: PIXI.Graphics, x: number, y: number, style: MarineStyle, mirrored = false) {
        graphics.clear();
        graphics.position.set(x, y);
        graphics.scale.set(mirrored ? -1 : 1, 1);
        graphics.roundRect(0, 0, 7, 16, 4);
        graphics.fill(style.shoulder);
        graphics.stroke({ width: 1.25, color: style.trim });
        graphics.roundRect(1, 2, 5, 10, 3);
        graphics.fill(style.body);
        graphics.circle(4, 13, 2.5);
        graphics.fill(style.metal);
    }

    private drawHelmet(graphics: PIXI.Graphics, style: MarineStyle) {
        graphics.clear();
        const isHeavy = style.profile === 'heavy';
        const isPsi = style.profile === 'psi';
        const isCommand = style.profile === 'command';

        graphics.roundRect(
            isHeavy ? -13 : -11,
            isHeavy ? -18 : -16,
            isHeavy ? 26 : 22,
            isHeavy ? 20 : 18,
            isCommand ? 9 : 8
        );
        graphics.fill(style.bodyShade);
        graphics.stroke({ width: 1.5, color: style.trim });

        graphics.roundRect(
            isHeavy ? -12 : -10,
            isHeavy ? -17 : -15,
            isHeavy ? 24 : 20,
            isHeavy ? 18 : 16,
            isCommand ? 8 : 7
        );
        graphics.fill(style.body);

        graphics.roundRect(
            isHeavy ? -8 : -7,
            -11,
            isHeavy ? 16 : 14,
            isPsi ? 4 : 5,
            3
        );
        graphics.fill(style.visor);

        graphics.rect(isHeavy ? -8 : -6, -10, isHeavy ? 5 : 4, 1);
        graphics.fill(style.helmetHighlight);

        graphics.circle(isHeavy ? -14 : -12, -8, 2);
        graphics.fill(style.metal);
        graphics.circle(isHeavy ? 14 : 12, -8, 2);
        graphics.fill(style.metal);

        graphics.circle(0, -15, 2);
        graphics.fill(style.emblem);

        if (isPsi) {
            graphics.roundRect(-2, -21, 4, 7, 2);
            graphics.fill(style.glow);
            graphics.circle(0, -23, 3);
            graphics.fill({ color: style.glow, alpha: 0.25 });
        }

        if (isCommand) {
            graphics.roundRect(-14, -20, 28, 4, 2);
            graphics.fill(style.accent);
            graphics.circle(-15, -18, 2);
            graphics.fill(style.glow);
            graphics.circle(15, -18, 2);
            graphics.fill(style.glow);
        }
    }

    private drawTorso(graphics: PIXI.Graphics, style: MarineStyle) {
        graphics.clear();
        const isHeavy = style.profile === 'heavy' || style.profile === 'command';
        const isPsi = style.profile === 'psi';
        const chestWidth = isHeavy ? 38 : isPsi ? 28 : 32;
        const chestHeight = isHeavy ? 26 : 24;
        graphics.roundRect(-chestWidth / 2, -9, chestWidth, chestHeight, isHeavy ? 10 : 8);
        graphics.fill(style.bodyShade);
        graphics.stroke({ width: 2, color: style.trim });

        graphics.roundRect(-(chestWidth - 2) / 2, -8, chestWidth - 2, chestHeight - 2, isHeavy ? 9 : 7);
        graphics.fill(style.body);

        graphics.roundRect(isPsi ? -11 : -12, -3, isPsi ? 22 : 24, isHeavy ? 12 : 10, 5);
        graphics.fill(style.bodyShade);

        graphics.roundRect(isHeavy ? -13 : -10, -1, isHeavy ? 26 : 20, 5, 3);
        graphics.fill(style.accent);

        graphics.circle(0, 0, isHeavy ? 6 : 4.5);
        graphics.fill(style.trim);

        if (isPsi) {
            graphics.roundRect(-15, -4, 4, 12, 2);
            graphics.fill(style.glow);
            graphics.roundRect(11, -4, 4, 12, 2);
            graphics.fill(style.glow);
        }

        if (style.profile === 'command') {
            graphics.roundRect(-17, -5, 34, 3, 1.5);
            graphics.fill(style.glow);
        }
    }

    private drawBackpack(graphics: PIXI.Graphics, style: MarineStyle) {
        graphics.clear();
        const isPsi = style.profile === 'psi';
        const isCommand = style.profile === 'command';
        const packWidth = isCommand ? 24 : isPsi ? 18 : 22;
        const packHeight = isCommand ? 24 : 20;
        graphics.roundRect(-packWidth / 2, -9, packWidth, packHeight, 5);
        graphics.fill(style.backpack);
        graphics.stroke({ width: 1.5, color: style.trim });

        graphics.roundRect(isCommand ? -9 : -8, -7, 6, isCommand ? 18 : 16, 3);
        graphics.fill(style.rifle);
        graphics.roundRect(isCommand ? 3 : 2, -7, 6, isCommand ? 18 : 16, 3);
        graphics.fill(style.rifle);

        graphics.circle(isCommand ? -7 : -6, -7, 2);
        graphics.fill(style.glow);
        graphics.circle(isCommand ? 7 : 6, -7, 2);
        graphics.fill(style.glow);

        if (isPsi) {
            graphics.roundRect(-11, -4, 4, 14, 2);
            graphics.fill(style.glow);
            graphics.roundRect(7, -4, 4, 14, 2);
            graphics.fill(style.glow);
        }

        if (isCommand) {
            graphics.roundRect(-14, -14, 28, 4, 2);
            graphics.fill(style.accent);
            graphics.roundRect(-11, 7, 22, 2, 1);
            graphics.fill(style.glow);
        }
    }

    private drawWeapon(graphics: PIXI.Graphics, style: MarineStyle) {
        graphics.clear();
        const isHeavy = style.profile === 'heavy' || style.profile === 'command';
        const isPsi = style.profile === 'psi';
        graphics.roundRect(7, -4, isPsi ? 18 : isHeavy ? 34 : 28, isPsi ? 6 : 7, 3);
        graphics.fill(style.rifle);
        graphics.stroke({ width: 1, color: style.trim });

        graphics.roundRect(17, -7, isPsi ? 5 : isHeavy ? 13 : 11, isPsi ? 16 : 12, 3);
        graphics.fill(style.metal);
        graphics.rect(isPsi ? 20 : isHeavy ? 29 : 27, -2, isPsi ? 2 : 9, 2);
        graphics.fill(style.bodyShade);

        graphics.roundRect(11, 1, isPsi ? 12 : 10, isPsi ? 3 : 7, 2);
        graphics.fill(style.trim);

        graphics.roundRect(isPsi ? 12 : 19, isPsi ? -6 : 2, isPsi ? 10 : 6, isPsi ? 18 : 4, 1);
        graphics.fill(style.glow);

        if (isPsi) {
            graphics.circle(18, 2, 3);
            graphics.fill(style.accent);
            graphics.roundRect(10, -6, 4, 20, 2);
            graphics.fill({ color: style.glow, alpha: 0.32 });
        } else {
            graphics.circle(isHeavy ? 39 : 34, -0.5, 1.5);
            graphics.fill(style.accent);
        }
    }

    private drawModel(style: MarineStyle) {
        this.shadow.clear();
        this.shadow.ellipse(1, 16, style.profile === 'command' ? 24 : style.profile === 'heavy' ? 23 : 21, 8.5);
        this.shadow.fill({ color: 0x000000, alpha: 0.34 });

        this.drawRoundedLeg(this.leftLeg, -12, style.profile === 'heavy' ? 8 : 7, style);
        this.drawRoundedLeg(this.rightLeg, 4, style.profile === 'heavy' ? 6 : 5, style, true);

        this.drawArm(this.leftArm, -19, -4, style);
        this.drawArm(this.rightArm, 12, -2, style, true);

        this.drawBackpack(this.backpack, style);
        this.backpack.position.set(-1, -1);
        this.drawTorso(this.torso, style);
        this.torso.position.set(0, -1);
        this.drawHelmet(this.helmet, style);
        this.helmet.position.set(-1, -1);
        this.drawWeapon(this.weapon, style);
        this.weapon.position.set(2, 1);

        this.glow.clear();
        this.glow.circle(1, -1, style.profile === 'command' ? 20 : style.profile === 'psi' ? 19 : 16);
        this.glow.fill({ color: style.glow, alpha: 0.08 });
        this.glow.circle(1, -1, style.profile === 'psi' ? 10 : 8);
        this.glow.fill({ color: style.glow, alpha: 0.16 });
        if (style.profile === 'psi') {
            this.glow.roundRect(-18, -16, 36, 4, 2);
            this.glow.fill({ color: style.glow, alpha: 0.18 });
        }
        if (style.profile === 'command') {
            this.glow.roundRect(-20, -19, 40, 5, 2);
            this.glow.fill({ color: style.accent, alpha: 0.18 });
        }

        this.chestLight.clear();
        if (style.profile === 'psi') {
            this.chestLight.roundRect(-7, -10, 14, 5, 2);
            this.chestLight.fill({ color: style.glow, alpha: 0.72 });
            this.chestLight.roundRect(-3, -15, 6, 4, 2);
            this.chestLight.fill({ color: style.accent, alpha: 0.52 });
        } else if (style.profile === 'command') {
            this.chestLight.roundRect(-6, -11, 12, 6, 2);
            this.chestLight.fill({ color: style.glow, alpha: 0.82 });
            this.chestLight.roundRect(-10, -8, 20, 2, 1);
            this.chestLight.fill({ color: style.accent, alpha: 0.48 });
        } else if (style.profile === 'heavy') {
            this.chestLight.roundRect(-5, -4, 10, 4, 1.5);
            this.chestLight.fill({ color: style.glow, alpha: 0.88 });
        } else {
            this.chestLight.roundRect(-4, -2, 8, 3, 1.5);
            this.chestLight.fill({ color: style.glow, alpha: 0.9 });
        }

        this.statusRing.clear();
        this.statusRing.circle(1, 0, 21);
        this.statusRing.stroke({ width: 1, color: style.accent, alpha: 0.18 });
        this.statusRing.circle(1, 0, 24);
        this.statusRing.stroke({ width: 1, color: style.visor, alpha: 0.06 });
    }

    private applyEvolutionVisuals() {
        if (this.gameStore.currentStageIndex === this.lastEvolvedStage) return;
        this.lastEvolvedStage = this.gameStore.currentStageIndex;
        this.baseMaxHealth = this.gameStore.currentStage.statModifiers.health || this.baseMaxHealth;
        this.evolutionHealthBonus += 100;

        const style = this.getStyleForStage(this.gameStore.currentStageIndex);
        this.currentStyle = style;
        this.drawModel(style);

        this.syncMaxHealth(true);
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

    public update(_delta: number, targetPos: { x: number, y: number } | null = null) {
        const move = this.input.movementVector;

        this.syncMaxHealth();
        this.updateHealthBar(this.currentHealth, this.maxHealth);

        if (this.gameStore.currentStageIndex > 0) {
            this.applyEvolutionVisuals();
        }

        if (move.x !== 0 || move.y !== 0) {
            const moveRotation = Math.atan2(move.y, move.x);
            this.dollContainer.rotation = moveRotation;
            this.dollContainer.y = 0;
            this.dollContainer.scale.set(this.baseScaleX, this.baseScaleY);

            const bobTime = Date.now() * 0.015;
            const bobbing = Math.sin(bobTime) * 1.2;
            this.dollContainer.y = bobbing;
            this.glow.alpha = 0.9 + Math.sin(bobTime * 2) * 0.08;
        } else {
            const breathingTime = Date.now() * 0.003;
            const breathing = Math.sin(breathingTime) * 0.03;
            this.dollContainer.y = 0;
            this.dollContainer.rotation = 0;
            this.dollContainer.scale.set(this.baseScaleX, this.baseScaleY + breathing);
            this.glow.alpha = 0.65 + Math.sin(breathingTime) * 0.08;
        }

        if (targetPos) {
            const dx = targetPos.x - this.container.x;
            const dy = targetPos.y - this.container.y;
            const aimRotation = Math.atan2(dy, dx);
            this.weapon.rotation = aimRotation;
            this.leftArm.rotation = aimRotation * 0.15;
            this.rightArm.rotation = aimRotation * 0.85;
        } else if (move.x !== 0 || move.y !== 0) {
            const moveRotation = Math.atan2(move.y, move.x);
            this.weapon.rotation = moveRotation;
            this.leftArm.rotation = moveRotation * 0.15;
            this.rightArm.rotation = moveRotation * 0.85;
        }
    }
}
