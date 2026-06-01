import * as PIXI from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XpGem } from '../entities/XpGem';
import { BackgroundSystem } from './systems/BackgroundSystem';
import { InputManager } from './managers/InputManager';
import { WeaponSystem } from './systems/WeaponSystem';
import { SpawnerSystem } from './systems/SpawnerSystem';
import { useGameStore } from '../stores/gameStore';

export class GameEngine {
    public app: PIXI.Application;
    private static instance: GameEngine;
    
    public player?: Player;
    public background?: BackgroundSystem;
    public spawner?: SpawnerSystem;
    public weaponSystem: WeaponSystem;
    
    public enemies: Enemy[] = [];
    public projectiles: Projectile[] = [];
    public xpGems: XpGem[] = [];
    
    private input: InputManager;
    private gameStore = useGameStore();

    private constructor() {
        this.app = new PIXI.Application();
        this.input = InputManager.getInstance();
        this.weaponSystem = new WeaponSystem();
        (window as any).gameEngine = this;
    }

    public static async getInstance(): Promise<GameEngine> {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }
        return GameEngine.instance;
    }

    public async init(options: Partial<PIXI.ApplicationOptions>) {
        await this.app.init(options);
        
        const container = document.getElementById('game-container');
        if (container) {
            container.appendChild(this.app.canvas);
        } else {
            document.body.appendChild(this.app.canvas);
        }

        // Initialize systems
        this.background = new BackgroundSystem(this.app.stage);
        this.spawner = new SpawnerSystem(this.app.stage);

        // Initialize entities
        this.player = new Player();
        this.app.stage.addChild(this.player.container);

        // Main game loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });
    }

    private update(delta: number) {
        if (!this.player || this.gameStore.isGameOver || this.gameStore.isPaused) return;

        this.gameStore.time += (this.app.ticker.deltaMS / 1000);

        // Keep player at center
        this.player.container.x = this.app.renderer.width / 2;
        this.player.container.y = this.app.renderer.height / 2;

        // 1. Update Player (Aiming at nearest enemy)
        let nearestEnemy = null;
        let minDist = Infinity;
        for (const e of this.enemies) {
            const d = Math.sqrt(Math.pow(e.container.x - this.player.container.x, 2) + Math.pow(e.container.y - this.player.container.y, 2));
            if (d < minDist) {
                minDist = d;
                nearestEnemy = e;
            }
        }
        this.player.update(delta, nearestEnemy ? nearestEnemy.container : null);
        
        // 2. Update Background & Get Velocity
        const move = this.input.movementVector;
        const playerVelX = move.x * this.player.speed * delta;
        const playerVelY = move.y * this.player.speed * delta;
        
        if (this.background) {
            this.background.update({ x: playerVelX, y: playerVelY });
        }

        // 3. Spawning
        const newEnemies = this.spawner?.update(this.player.container) || [];
        this.enemies.push(...newEnemies);

        // 4. Weapons (Multi-weapon system)
        const newProjectiles = this.weaponSystem.update(
            this.player.container.x, 
            this.player.container.y, 
            this.enemies, 
            this.app.stage,
            (x, y, xp) => {
                // Drop XP Gem for AOE kills
                const gem = new XpGem(x, y, xp);
                this.xpGems.push(gem);
                this.app.stage.addChild(gem.container);
                this.gameStore.kills++;
            }
        );
        this.projectiles.push(...newProjectiles);


        // 5. Update Projectiles
        this.projectiles = this.projectiles.filter(p => {
            if (p.isDestroyed) return false;
            p.update(delta);
            return true;
        });

        // 6. Update XP Gems
        this.xpGems = this.xpGems.filter(gem => {
            const collected = gem.updateWithPlayer(delta, this.player!.container, 120); 
            if (collected) {
                this.gameStore.addXp(gem.value);
                gem.destroy();
                return false;
            }
            gem.container.x -= playerVelX;
            gem.container.y -= playerVelY;
            return true;
        });

        // 7. Update Enemies & Collision
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDestroyed) return false;
            
            enemy.container.x -= playerVelX;
            enemy.container.y -= playerVelY;
            
            enemy.updateWithPlayer(delta, this.player!.container);

            // Collision with projectiles
            for (const p of this.projectiles) {
                if (p.isDestroyed) continue;
                const dx = p.container.x - enemy.container.x;
                const dy = p.container.y - enemy.container.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 25) {
                    const deadX = enemy.container.x;
                    const deadY = enemy.container.y;
                    
                    enemy.takeDamage(p.damage);
                    p.destroy();
                    
                    if (enemy.isDestroyed) {
                        const gem = new XpGem(deadX, deadY, enemy.xpValue);
                        this.xpGems.push(gem);
                        this.app.stage.addChild(gem.container);
                        this.gameStore.kills++;
                        return false;
                    }
                }
            }

            // Collision with player
            const pdx = this.player!.container.x - enemy.container.x;
            const pdy = this.player!.container.y - enemy.container.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < 30) {
                // Apply armor reduction
                const armor = this.gameStore.stats.armor || 0;
                const rawDamage = enemy.damage * delta * 0.1;
                const actualDamage = Math.max(0.1, rawDamage - armor * 0.05);
                this.player!.takeDamage(actualDamage);
            }

            return true;
        });
    }

    public get stage() {
        return this.app.stage;
    }

    public get renderer() {
        return this.app.renderer;
    }
}
