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

        // Preload assets
        await PIXI.Assets.load([
            '/characters/marine/marine-recruit.png',
            '/characters/marine/marine-veteran.png',
            '/characters/marine/heavy-trooper.png',
            '/characters/marine/siege-commander.png',
            '/characters/marine/dominion-general.png',
            '/characters/monsters/monster1.png',
            '/characters/monsters/monster2.png'
        ]);

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

        // 1. Update Player (Aiming at nearest visible enemy)
        let nearestEnemy = null;
        let minDist = Infinity;
        const margin = 50;

        for (const e of this.enemies) {
            // Safety check
            if (e.isDestroyed) continue;

            // Check visibility
            if (e.container.x < -margin || 
                e.container.x > window.innerWidth + margin || 
                e.container.y < -margin || 
                e.container.y > window.innerHeight + margin) {
                continue;
            }

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
            (enemy: Enemy) => this.handleEnemyKilled(enemy)
        );
        this.projectiles.push(...newProjectiles);


        // 5. Update Projectiles
        this.projectiles = this.projectiles.filter(p => {
            if (p.isDestroyed) return false;
            p.update(delta);

            // Destroy if out of bounds
            const boundsMargin = 40;
            if (p.container.x < -boundsMargin || 
                p.container.x > window.innerWidth + boundsMargin || 
                p.container.y < -boundsMargin || 
                p.container.y > window.innerHeight + boundsMargin) {
                p.destroy();
                return false;
            }

            return true;
        });

        // 6. Update XP Gems
        this.xpGems = this.xpGems.filter(gem => {
            const collected = gem.updateWithPlayer(delta, this.player!.container, 120 + this.gameStore.stats.pickupRadius); 
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
                    // Capture position before taking damage/potential destruction
                    const deathX = enemy.container.x;
                    const deathY = enemy.container.y;

                    let directHitKilledEnemy = false;

                    if (p.splashRadius > 0) {
                        for (const splashEnemy of this.enemies) {
                            if (splashEnemy.isDestroyed) continue;
                            const sx = splashEnemy.container.x - p.container.x;
                            const sy = splashEnemy.container.y - p.container.y;
                            const splashDist = Math.sqrt(sx * sx + sy * sy);
                            if (splashDist <= p.splashRadius) {
                                const falloff = 1 - Math.min(1, splashDist / p.splashRadius) * 0.35;
                                splashEnemy.takeDamage(p.damage * falloff);
                                if (splashEnemy.isDestroyed) {
                                    this.handleEnemyKilled(splashEnemy, splashEnemy.container?.x ?? 0, splashEnemy.container?.y ?? 0);
                                }
                            }
                        }
                    } else {
                        enemy.takeDamage(p.damage);
                        directHitKilledEnemy = enemy.isDestroyed;
                    }
                    p.destroy();
                    
                    if (enemy.isDestroyed) {
                        if (directHitKilledEnemy) {
                            this.handleEnemyKilled(enemy, deathX, deathY);
                        }
                        return false;
                    }

                    if (directHitKilledEnemy) {
                        this.handleEnemyKilled(enemy, deathX, deathY);
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

    private handleEnemyKilled(enemy: Enemy, cachedX?: number, cachedY?: number) {
        // Safe access: If cached coordinates are provided, use them; 
        // otherwise, try to safely access enemy.container.
        const x = cachedX ?? enemy.container?.x ?? 0;
        const y = cachedY ?? enemy.container?.y ?? 0;
        const xp = enemy.xpValue;
        const isBoss = enemy.isBoss;

        if (isBoss) {
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 50;
                const gemX = x + Math.cos(angle) * dist;
                const gemY = y + Math.sin(angle) * dist;
                const gem = new XpGem(gemX, gemY, Math.floor(xp / 50));
                this.xpGems.push(gem);
                this.app.stage.addChild(gem.container);
            }
        } else {
            const gem = new XpGem(x, y, xp);
            this.xpGems.push(gem);
            this.app.stage.addChild(gem.container);
        }
        
        this.gameStore.kills++;

        const lifesteal = this.gameStore.stats.lifesteal;
        if (lifesteal > 0 && this.player) {
            this.player.currentHealth = Math.min(this.player.maxHealth, this.player.currentHealth + lifesteal * 2);
        }
    }
}
