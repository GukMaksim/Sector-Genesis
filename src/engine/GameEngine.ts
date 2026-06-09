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
import { UpgradeManager } from '../upgrades/UpgradeManager';
import { useGameStore } from '../stores/gameStore';
import { useUpgradeStore } from '../stores/upgradeStore';

export class GameEngine {
    public app: PIXI.Application;
    private static instance: GameEngine;

    public player?: Player;
    public background?: BackgroundSystem;
    public spawner?: SpawnerSystem;
    public indicatorSystem?: IndicatorSystem;
    public weaponSystem: WeaponSystem;
    public upgradeManager: UpgradeManager;

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
    private upgradeStore = useUpgradeStore();

    private constructor() {
        this.app = new PIXI.Application();
        this.input = InputManager.getInstance();
        this.weaponSystem = new WeaponSystem();
        this.upgradeManager = new UpgradeManager();

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

        this.background = new BackgroundSystem(this.app.stage);

        this.app.stage.addChild(this.nodesContainer);
        this.app.stage.addChild(this.gemsContainer);
        this.app.stage.addChild(this.enemiesContainer);
        this.app.stage.addChild(this.projectilesContainer);

        this.spawner = new SpawnerSystem(this.enemiesContainer);

        await PIXI.Assets.load([
            '/characters/marine/marine-recruit.png',
            '/characters/marine/marine-veteran.png',
            '/characters/marine/heavy-trooper.png',
            '/characters/marine/siege-commander.png',
            '/characters/marine/dominion-general.png',
            '/characters/monsters/monster1.png',
            '/characters/monsters/monster2.png',
            '/ui/field_minerals.png',
            '/ui/field_gas.png'
        ]);

        this.player = new Player();
        this.app.stage.addChild(this.player.container);

        this.indicatorSystem = new IndicatorSystem(this.app.stage, this.player.container);

        this.spawnInitialResourceNodes();

        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });
    }

    private update(delta: number) {
        if (!this.player || this.gameStore.isGameOver || this.gameStore.isPaused) return;

        this.gameStore.time += (this.app.ticker.deltaMS / 1000);

        let nearestEnemy: Enemy | null = null;
        let minDist = Infinity;
        const margin = 50;
        for (const e of this.enemies) {
            if (e.isDestroyed) continue;
            if (e.container.x < -margin ||
                e.container.x > window.innerWidth + margin ||
                e.container.y < -margin ||
                e.container.y > window.innerHeight + margin) continue;
            const d = Math.sqrt(Math.pow(e.container.x - this.player.container.x, 2) + Math.pow(e.container.y - this.player.container.y, 2));
            if (d < minDist) { minDist = d; nearestEnemy = e; }
        }
        this.player.update(delta, nearestEnemy ? nearestEnemy.container : null);

        const move = this.input.movementVector;
        const playerVelX = move.x * this.player.speed * delta;
        const playerVelY = move.y * this.player.speed * delta;

        if (this.background) {
            this.background.update(
                { x: playerVelX, y: playerVelY },
                this.gameStore.baseStats.discoveryRadius
            );
        }

        const newEnemies = this.spawner?.update(this.player.container) || [];
        this.enemies.push(...newEnemies);

        const newProjectiles = this.weaponSystem.update(
            this.player.container.x,
            this.player.container.y,
            this.enemies,
            this.projectilesContainer,
            (enemy: Enemy, x?: number, y?: number) => this.handleEnemyKilled(enemy, x, y)
        );
        this.projectiles.push(...newProjectiles);

        this.projectiles = this.projectiles.filter(p => {
            if (p.isDestroyed) return false;
            p.update(delta);
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

        this.xpGems = this.xpGems.filter(gem => {
            const collected = gem.updateWithPlayer(delta, this.player!.container, 120 + this.gameStore.baseStats.pickupRadius);
            if (collected) {
                this.gameStore.addXp(gem.value);
                gem.destroy();
                return false;
            }
            gem.container.x -= playerVelX;
            gem.container.y -= playerVelY;
            if (this.background) {
                gem.container.visible = this.background.isAreaDiscovered(gem.container.x, gem.container.y);
            }
            return true;
        });

        this.resourceNodes = this.resourceNodes.filter(node => {
            if (node.isDestroyed) {
                this.respawnQueue.push({ type: node.nodeType, time: Date.now() + 60000 });
                node.destroy();
                return false;
            }
            node.container.x -= playerVelX;
            node.container.y -= playerVelY;
            node.updateWithPlayer(delta, this.player!.container, this.app.ticker.deltaMS);
            if (this.background) {
                node.container.visible = this.background.isAreaDiscovered(node.container.x, node.container.y);
            }
            const dx = node.container.x - this.player!.container.x;
            const dy = node.container.y - this.player!.container.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 3000) { node.destroy(); return false; }
            return true;
        });

        const now = Date.now();
        this.respawnQueue = this.respawnQueue.filter(item => {
            if (now >= item.time) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 600 + Math.random() * 400;
                const cx = this.player!.container.x + Math.cos(angle) * radius;
                const cy = this.player!.container.y + Math.sin(angle) * radius;
                if (item.type === 'mineral') {
                    const node = new ResourceNode(cx, cy, 'mineral');
                    this.resourceNodes.push(node);
                    this.nodesContainer.addChild(node.container);
                } else {
                    const node = new ResourceNode(cx, cy, 'gas');
                    this.resourceNodes.push(node);
                    this.nodesContainer.addChild(node.container);
                }
                return false;
            }
            return true;
        });

        if (this.resourceNodes.length < 15 && Math.random() < 0.005) {
            const moveVec = this.input.movementVector;
            let spawnAngle = Math.random() * Math.PI * 2;
            if (moveVec.x !== 0 || moveVec.y !== 0) {
                const baseAngle = Math.atan2(moveVec.y, moveVec.x);
                spawnAngle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.5;
            }
            const sRadius = Math.max(window.innerWidth, window.innerHeight) * 1.2;
            const cx = this.player!.container.x + Math.cos(spawnAngle) * sRadius;
            const cy = this.player!.container.y + Math.sin(spawnAngle) * sRadius;
            if (Math.random() < 0.7) {
                this.spawnMineralCluster(cx, cy);
            } else {
                this.spawnGasCluster(cx, cy);
            }
        }

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDestroyed) {
                enemy.destroy();
                return false;
            }
            enemy.container.x -= playerVelX;
            enemy.container.y -= playerVelY;
            enemy.updateWithPlayer(delta, this.player!.container);
            enemy.lastX = enemy.container.x;
            enemy.lastY = enemy.container.y;
            if (this.background) {
                enemy.container.visible = this.background.isAreaDiscovered(enemy.container.x, enemy.container.y);
            }

            for (const p of this.projectiles) {
                if (p.isDestroyed) continue;
                const dx = p.container.x - enemy.container.x;
                const dy = p.container.y - enemy.container.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 25) {
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
                                const sx2 = splashEnemy.container.x;
                                const sy2 = splashEnemy.container.y;
                                splashEnemy.takeDamage(p.damage * falloff);
                                if (splashEnemy.isDestroyed) {
                                    this.handleEnemyKilled(splashEnemy, sx2, sy2);
                                }
                            }
                        }
                    } else {
                        enemy.takeDamage(p.damage);
                        directHitKilledEnemy = enemy.isDestroyed;
                    }

                    if (p.ricochet && p.ricochet.bouncesLeft > 0 && !enemy.isDestroyed) {
                        const nextTarget = this.findNearestEnemy(enemy, p.ricochet!.searchRadius);
                        if (nextTarget) {
                            p.ricochet.bouncesLeft--;
                            p.damage *= (1 - p.ricochet.damageFalloff);
                            const dx2 = nextTarget.container.x - p.container.x;
                            const dy2 = nextTarget.container.y - p.container.y;
                            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                            p.direction = { x: dx2 / dist2, y: dy2 / dist2 };
                            p.container.rotation = Math.atan2(p.direction.y, p.direction.x);
                            continue;
                        }
                    }

                    p.destroy();
                    if (enemy.isDestroyed) {
                        if (directHitKilledEnemy) this.handleEnemyKilled(enemy, deathX, deathY);
                        return false;
                    }
                    if (directHitKilledEnemy) {
                        this.handleEnemyKilled(enemy, deathX, deathY);
                        return false;
                    }
                }
            }

            const pdx = this.player!.container.x - enemy.container.x;
            const pdy = this.player!.container.y - enemy.container.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < 30) {
                const armor = this.upgradeStore.statMultipliers.armor || this.gameStore.baseStats.armor || 0;
                const rawDamage = enemy.damage * delta * 0.1;
                const actualDamage = Math.max(0.1, rawDamage - armor * 0.05);
                this.player!.takeDamage(actualDamage);
            }
            return true;
        });

        if (this.indicatorSystem) {
            this.indicatorSystem.update(this.resourceNodes);
        }
    }

    private findNearestEnemy(from: Enemy, radius: number): Enemy | null {
        let nearest: Enemy | null = null;
        let minDist = radius;
        for (const enemy of this.enemies) {
            if (enemy.isDestroyed || enemy === from) continue;
            const dx = enemy.container.x - from.container.x;
            const dy = enemy.container.y - from.container.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    public get stage() {
        return this.app.stage;
    }

    public get renderer() {
        return this.app.renderer;
    }

    private handleEnemyKilled(enemy: Enemy, cachedX?: number, cachedY?: number) {
        const x = cachedX ?? enemy.lastX ?? 0;
        const y = cachedY ?? enemy.lastY ?? 0;
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

        const lifesteal = this.upgradeStore.statMultipliers.lifesteal || this.gameStore.baseStats.lifesteal || 0;
        if (lifesteal > 0 && this.player) {
            this.player.currentHealth = Math.min(this.player.maxHealth, this.player.currentHealth + lifesteal * 2);
        }
    }

    private spawnInitialResourceNodes() {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + Math.random();
            const distance = 800 + Math.random() * 400;
            const cx = center.x + Math.cos(angle) * distance;
            const cy = center.y + Math.sin(angle) * distance;
            this.spawnMineralCluster(cx, cy);
        }
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
