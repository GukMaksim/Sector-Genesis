import * as PIXI from 'pixi.js';
import { Entity } from './Entity';
import { InputManager } from '../engine/managers/InputManager';
import { useGameStore } from '../stores/gameStore';

enum Direction {
    DOWN = 0,
    LEFT = 1,
    RIGHT = 2,
    UP = 3
}

export class Player extends Entity {
    public baseSpeed: number = 5;
    public maxHealth: number = 100;
    public currentHealth: number = 100;

    private animations: Map<Direction, PIXI.AnimatedSprite> = new Map();
    private currentDirection: Direction = Direction.DOWN;
    private spriteContainer: PIXI.Container;
    private shadow: PIXI.Graphics;
    
    private input: InputManager;
    private gameStore = useGameStore();
    private baseMaxHealth: number;
    private evolutionHealthBonus = 0;
    private lastEvolvedStage = -1;
    
    private spriteScale: number = 0.36; // Increased from 0.18 to double the size

    constructor() {
        super();
        this.input = InputManager.getInstance();

        this.spriteContainer = new PIXI.Container();
        this.setVisual(this.spriteContainer);

        // Add a simple shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.ellipse(0, 48, 40, 16); // Adjusted shadow for larger sprite
        this.shadow.fill({ color: 0x000000, alpha: 0.3 });
        this.spriteContainer.addChild(this.shadow);

        this.setupAnimations();

        this.container.x = window.innerWidth / 2;
        this.container.y = window.innerHeight / 2;

        this.baseMaxHealth = this.gameStore.currentStage.statModifiers.health || 100;
        this.syncMaxHealth(true);
    }

    private setupAnimations() {
        // Clear existing animations if any
        this.animations.forEach(anim => anim.destroy());
        this.animations.clear();

        const texturePath = this.getTextureForStage(this.gameStore.currentStageIndex);
        const texture = PIXI.Assets.get(texturePath);
        if (!texture) {
            console.error(`Marine texture not found at ${texturePath}! Ensure it is preloaded in GameEngine.`);
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
        if (defaultAnim) defaultAnim.visible = true;
    }

    private getTextureForStage(stageIndex: number): string {
        switch (stageIndex) {
            case 1: return 'src/assets/characters/marine/marine-veteran.png';
            case 2: return 'src/assets/characters/marine/heavy-trooper.png';
            case 3: return 'src/assets/characters/marine/siege-commander.png';
            case 4: return 'src/assets/characters/marine/dominion-general.png';
            default: return 'src/assets/characters/marine/marine-recruit.png';
        }
    }

    private applyEvolutionVisuals() {
        if (this.gameStore.currentStageIndex === this.lastEvolvedStage) return;
        this.lastEvolvedStage = this.gameStore.currentStageIndex;
        
        // Update max health from new stage config
        this.baseMaxHealth = this.gameStore.currentStage.statModifiers.health || this.baseMaxHealth;

        this.setupAnimations();
        this.syncMaxHealth(true);
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

    public takeDamage(amount: number) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.gameStore.isGameOver = true;
        }
    }

    public get speed(): number {
        return this.baseSpeed * this.gameStore.stats.speedMult * (this.gameStore.currentStage.statModifiers.speed || 1);
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
        }
    }

    private updateAnimation(isMoving: boolean) {
        const anim = this.animations.get(this.currentDirection);
        if (!anim) return;

        if (isMoving) {
            if (!anim.playing) anim.play();
        } else {
            anim.stop();
            anim.currentFrame = 1; // Middle frame is usually the idle pose
        }
    }

    public update(_delta: number, targetPos: { x: number, y: number } | null = null) {
        const move = this.input.movementVector;

        this.syncMaxHealth();
        this.updateHealthBar(this.currentHealth, this.maxHealth);

        if (this.gameStore.currentStageIndex > 0) {
            this.applyEvolutionVisuals();
        }

        // Determine direction
        let newDir = this.currentDirection;
        const isMoving = move.x !== 0 || move.y !== 0;

        if (isMoving) {
            // Movement takes priority for direction
            if (Math.abs(move.x) > Math.abs(move.y)) {
                newDir = move.x > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                newDir = move.y > 0 ? Direction.DOWN : Direction.UP;
            }
        } else if (targetPos) {
            // If standing still, face the nearest enemy
            const dx = targetPos.x - this.container.x;
            const dy = targetPos.y - this.container.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                newDir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                newDir = dy > 0 ? Direction.DOWN : Direction.UP;
            }
        }

        this.setDirection(newDir);
        this.updateAnimation(isMoving);
    }
}
