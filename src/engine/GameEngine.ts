import * as PIXI from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XpGem } from '../entities/XpGem';
import { ResourceNode } from '../entities/ResourceNode';
import { BackgroundSystem } from './systems/BackgroundSystem';
import { InputManager } from './managers/InputManager';
import { WeaponSystem } from './systems/WeaponSystem';
import { SpawnerSystem } from './systems/SpawnerSystem';
import { IndicatorSystem } from './systems/IndicatorSystem';
import { useGameStore } from '../stores/gameStore';

export class GameEngine {
    public app: PIXI.Application;
    private static instance: GameEngine;
    
    public player?: Player;
    public background?: BackgroundSystem;
    public spawner?: SpawnerSystem;
    public indicatorSystem?: IndicatorSystem;
    public weaponSystem: WeaponSystem;
    
    // Containers for layered rendering
    private nodesContainer: PIXI.Container;
    private gemsContainer: PIXI.Container;
    private enemiesContainer: PIXI.Container;
    private projectilesContainer: PIXI.Container;
    
    public enemies: Enemy[] = [];
    public projectiles: Projectile[] = [];
    public xpGems: XpGem[] = [];
    public resourceNodes: ResourceNode[] = [];
    private respawnQueue: { type: 'mineral' | 'gas', time: number }[] = [];
    
    private input: InputManager;
    private gameStore = useGameStore();

    private constructor() {
        this.app = new PIXI.Application();
        this.input = InputManager.getInstance();
        this.weaponSystem = new WeaponSystem();
        
        this.nodesContainer = new PIXI.Container();
        this.gemsContainer = new PIXI.Container();
        this.enemiesContainer = new PIXI.Container();
        this.projectilesContainer = new PIXI.Container();
        
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
        
        // Setup containers
        this.app.stage.addChild(this.nodesContainer);
        this.app.stage.addChild(this.gemsContainer);
        this.app.stage.addChild(this.enemiesContainer);
        this.app.stage.addChild(this.projectilesContainer);

        this.spawner = new SpawnerSystem(this.enemiesContainer);

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

        // Initialize indicator system for resource nodes
        this.indicatorSystem = new IndicatorSystem(this.app.stage, this.player.container);

        // Spawn initial resource nodes
        this.spawnInitialResourceNodes();

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

            // Check visibility (Screen bounds)
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
            this.background.update(
                { x: playerVelX, y: playerVelY }, 
                this.gameStore.stats.discoveryRadius
            );
        }

        // 3. Spawning
        const newEnemies = this.spawner?.update(this.player.container) || [];
        this.enemies.push(...newEnemies);

        // 4. Weapons (Multi-weapon system)
        const newProjectiles = this.weaponSystem.update(
            this.player.container.x, 
            this.player.container.y, 
            this.enemies, 
            this.projectilesContainer,
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

            // Set visibility based on discovery
            if (this.background) {
                gem.container.visible = this.background.isAreaDiscovered(gem.container.x, gem.container.y);
            }
            
            return true;
        });

        // 6b. Update Resource Nodes
        this.resourceNodes = this.resourceNodes.filter(node => {
            if (node.isDestroyed) {
                // Add to respawn queue
                this.respawnQueue.push({ type: node.nodeType, time: Date.now() + 60000 });
                node.destroy();
                return false;
            }

            node.container.x -= playerVelX;
            node.container.y -= playerVelY;
            node.updateWithPlayer(delta, this.player!.container, this.app.ticker.deltaMS);

            // Set visibility based on discovery
            if (this.background) {
                node.container.visible = this.background.isAreaDiscovered(node.container.x, node.container.y);
            }

            const dx = node.container.x - this.player!.container.x;
            const dy = node.container.y - this.player!.container.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Cull if extremely far away (e.g. > 3000px)
            if (dist > 3000) {
                // Also add to respawn queue if culled to keep total count stable
                this.respawnQueue.push({ type: node.nodeType, time: Date.now() + 60000 });
                node.destroy();
                return false;
            }
            return true;
        });

        // 6c. Handle Respawns
        const now = Date.now();
        this.respawnQueue = this.respawnQueue.filter(item => {
            if (now >= item.time) {
                // Respawn in a random direction around player
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.max(window.innerWidth, window.innerHeight) * 1.5;
                const cx = this.player!.container.x + Math.cos(angle) * radius;
                const cy = this.player!.container.y + Math.sin(angle) * radius;

                if (item.type === 'mineral') {
                    this.spawnMineralCluster(cx, cy);
                } else {
                    this.spawnGasCluster(cx, cy);
                }
                return false;
            }
            return true;
        });

        // Spawn new cluster dynamically
        if (this.resourceNodes.length < 15 && Math.random() < 0.005) {
            const move = this.input.movementVector;
            let spawnAngle = Math.random() * Math.PI * 2;
            if (move.x !== 0 || move.y !== 0) {
                const baseAngle = Math.atan2(move.y, move.x);
                spawnAngle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.5;
            }
            const radius = Math.max(window.innerWidth, window.innerHeight) * 1.2;
            const cx = this.player!.container.x + Math.cos(spawnAngle) * radius;
            const cy = this.player!.container.y + Math.sin(spawnAngle) * radius;
            
            // Randomly decide between mineral or gas cluster
            if (Math.random() < 0.7) {
                this.spawnMineralCluster(cx, cy);
            } else {
                this.spawnGasCluster(cx, cy);
            }
        }

        // 7. Update Enemies & Collision
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDestroyed) {
                enemy.destroy();
                return false;
            }
            
            enemy.container.x -= playerVelX;
            enemy.container.y -= playerVelY;
            
            enemy.updateWithPlayer(delta, this.player!.container);

            // Set visibility based on discovery
            if (this.background) {
                enemy.container.visible = this.background.isAreaDiscovered(enemy.container.x, enemy.container.y);
            }

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
                                const splashEnemyX = splashEnemy.container.x;
                                const splashEnemyY = splashEnemy.container.y;
                                const falloff = 1 - Math.min(1, splashDist / p.splashRadius) * 0.35;
                                splashEnemy.takeDamage(p.damage * falloff);
                                if (splashEnemy.isDestroyed) {
                                    this.handleEnemyKilled(splashEnemy, splashEnemyX, splashEnemyY);
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

        // 8. Update Indicators (Arrows)
        if (this.indicatorSystem) {
            this.indicatorSystem.update(this.resourceNodes);
        }
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
                this.gemsContainer.addChild(gem.container);
            }
        } else {
            const gem = new XpGem(x, y, xp);
            this.xpGems.push(gem);
            this.gemsContainer.addChild(gem.container);
        }
        
        this.gameStore.kills++;

        const lifesteal = this.gameStore.stats.lifesteal;
        if (lifesteal > 0 && this.player) {
            this.player.currentHealth = Math.min(this.player.maxHealth, this.player.currentHealth + lifesteal * 2);
        }
    }

    private spawnInitialResourceNodes() {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        // Spawn separate clusters at different angles around center
        // Minerals
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + Math.random();
            const distance = 800 + Math.random() * 400;
            const cx = center.x + Math.cos(angle) * distance;
            const cy = center.y + Math.sin(angle) * distance;
            this.spawnMineralCluster(cx, cy);
        }

        // Gas
        for (let i = 0; i < 2; i++) {
            const angle = (i / 2) * Math.PI * 2 + Math.PI / 2 + Math.random();
            const distance = 1000 + Math.random() * 500;
            const cx = center.x + Math.cos(angle) * distance;
            const cy = center.y + Math.sin(angle) * distance;
            this.spawnGasCluster(cx, cy);
        }
    }

    public spawnMineralCluster(clusterX: number, clusterY: number) {
        const numMinerals = 4 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numMinerals; j++) {
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            const node = new ResourceNode(clusterX + offsetX, clusterY + offsetY, 'mineral');
            this.resourceNodes.push(node);
            this.nodesContainer.addChild(node.container);
        }
    }

    public spawnGasCluster(clusterX: number, clusterY: number) {
        const numGas = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < numGas; j++) {
            const offsetX = (Math.random() - 0.5) * 150;
            const offsetY = (Math.random() - 0.5) * 150;
            const node = new ResourceNode(clusterX + offsetX, clusterY + offsetY, 'gas');
            this.resourceNodes.push(node);
            this.nodesContainer.addChild(node.container);
        }
    }
}
