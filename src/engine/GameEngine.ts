import * as PIXI from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XpGem } from '../entities/XpGem';
import { ResourceNode } from '../entities/ResourceNode';
import { Obstacle, type ObstacleType } from '../entities/Obstacle';
import { BackgroundSystem } from './systems/BackgroundSystem';
import { InputManager } from './managers/InputManager';
import { WeaponSystem } from './systems/WeaponSystem';
import { SpawnerSystem } from './systems/SpawnerSystem';
import { IndicatorSystem } from './systems/IndicatorSystem';
import { VisualEffects } from './systems/VisualEffects';
import { UpgradeManager } from '../upgrades/UpgradeManager';
import { metaManager } from '../upgrades/meta/MetaUpgradeManager';
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
    private obstaclesContainer: PIXI.Container;
    private enemiesContainer: PIXI.Container;
    private projectilesContainer: PIXI.Container;
    private enemyProjectilesContainer: PIXI.Container;
    private effectsContainer: PIXI.Container;

    public enemies: Enemy[] = [];
    public projectiles: Projectile[] = [];
    public enemyProjectiles: Projectile[] = [];
    public xpGems: XpGem[] = [];
    public resourceNodes: ResourceNode[] = [];
    public obstacles: Obstacle[] = [];
    private respawnQueue: { type: 'mineral' | 'gas', time: number }[] = [];
    private stimKillCounter: number = 0;

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
        this.obstaclesContainer = new PIXI.Container();
        this.enemiesContainer = new PIXI.Container();
        this.projectilesContainer = new PIXI.Container();
        this.enemyProjectilesContainer = new PIXI.Container();
        this.effectsContainer = new PIXI.Container();

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

        this.app.stage.addChild(this.obstaclesContainer);
        this.app.stage.addChild(this.nodesContainer);
        this.app.stage.addChild(this.gemsContainer);
        this.app.stage.addChild(this.enemiesContainer);
        this.app.stage.addChild(this.projectilesContainer);
        this.app.stage.addChild(this.effectsContainer);

        VisualEffects.init(this.effectsContainer);

        this.spawner = new SpawnerSystem(this.enemiesContainer);

        this.enemyProjectilesContainer = new PIXI.Container();
        this.app.stage.addChild(this.enemyProjectilesContainer);

        this.gameStore.resetRunState();

        await PIXI.Assets.load([
            '/characters/marine/marine-recruit.png',
            '/characters/marine/marine-veteran.png',
            '/characters/marine/heavy-trooper.png',
            '/characters/marine/siege-commander.png',
            '/characters/marine/dominion-general.png',
            '/characters/monsters/monster1.png',
            '/characters/monsters/monster2.png',
            '/ui/field_minerals.png',
            '/ui/field_gas.png',
            '/obstacles/building.png',
            '/obstacles/wall.png',
            '/obstacles/water.png',
            '/obstacles/trees.png',
            '/obstacles/rocks.png',
        ]);

        this.player = new Player();
        this.app.stage.addChild(this.player.container);

        // Unlock meta-starting weapons
        const startWeapons = metaManager.getStartingWeapons()
        for (const wid of startWeapons) {
            this.gameStore.unlockWeapon(wid as any)
        }

        // Apply meta-upgrade stat bonuses so they take effect from the start
        this.upgradeManager.rebuildStats();

        this.indicatorSystem = new IndicatorSystem(this.app.stage, this.player.container);

        this.spawnInitialResourceNodes();
        this.spawnInitialObstacles();

        // ── Pause on Space ──
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameStore.isGameOver) {
                e.preventDefault();
                if (!this.gameStore.showUpgradeOverlay && !this.gameStore.showSpecializationChoice) {
                    this.gameStore.isPaused = !this.gameStore.isPaused;
                }
            }
        });

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
        let playerVelX = move.x * this.player.speed * delta;
        let playerVelY = move.y * this.player.speed * delta;

        // ── Player obstacle collision (slide along edges) ──
        const playerCollisionR = 22;
        const wouldCollide = (x: number, y: number): boolean => {
            for (const obs of this.obstacles) {
                if (obs.isDestroyed) continue;
                const dx = x - obs.container.x;
                const dy = y - obs.container.y;
                if (Math.sqrt(dx * dx + dy * dy) < playerCollisionR + obs.radius) return true;
            }
            return false;
        };
        const desiredX = this.player.container.x + playerVelX;
        const desiredY = this.player.container.y + playerVelY;
        if (wouldCollide(desiredX, desiredY)) {
            // Try X-axis only
            if (!wouldCollide(desiredX, this.player.container.y)) {
                playerVelY = 0;
            }
            // Try Y-axis only
            else if (!wouldCollide(this.player.container.x, desiredY)) {
                playerVelX = 0;
            }
            // Both blocked
            else {
                playerVelX = 0;
                playerVelY = 0;
            }
        }

        if (this.background) {
            this.background.update({ x: playerVelX, y: playerVelY });
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
            if (p.elapsed >= p.lifeTime) { p.destroy(); return false; }
            const boundsMargin = 40;
            if (p.container.x < -boundsMargin ||
                p.container.x > window.innerWidth + boundsMargin ||
                p.container.y < -boundsMargin ||
                p.container.y > window.innerHeight + boundsMargin) {
                p.destroy();
                return false;
            }

            // ── Projectile vs obstacle collision ──
            for (const obs of this.obstacles) {
                if (obs.isDestroyed || !obs.blocksProjectiles) continue;
                const dx = p.container.x - obs.container.x;
                const dy = p.container.y - obs.container.y;
                if (Math.sqrt(dx * dx + dy * dy) < obs.radius + 6) {
                    VisualEffects.impactEffect(p.container.x, p.container.y, 0x666666);
                    p.destroy();
                    return false;
                }
            }

            return true;
        });

        // ── Enemy projectiles: collide with player and obstacles ──
        this.enemyProjectiles = this.enemyProjectiles.filter(ep => {
            if (ep.isDestroyed) return false;
            ep.update(delta);
            if (ep.elapsed >= ep.lifeTime) { ep.destroy(); return false; }
            // Scroll with world
            ep.container.x -= playerVelX;
            ep.container.y -= playerVelY;
            const boundsMargin = 40;
            if (ep.container.x < -boundsMargin ||
                ep.container.x > window.innerWidth + boundsMargin ||
                ep.container.y < -boundsMargin ||
                ep.container.y > window.innerHeight + boundsMargin) {
                ep.destroy();
                return false;
            }

            for (const obs of this.obstacles) {
                if (obs.isDestroyed || !obs.blocksProjectiles) continue;
                const dx = ep.container.x - obs.container.x;
                const dy = ep.container.y - obs.container.y;
                if (Math.sqrt(dx * dx + dy * dy) < obs.radius + 6) {
                    VisualEffects.impactEffect(ep.container.x, ep.container.y, 0xff6b35);
                    ep.destroy();
                    return false;
                }
            }

            if (this.player) {
                const pdx = this.player.container.x - ep.container.x;
                const pdy = this.player.container.y - ep.container.y;
                if (Math.sqrt(pdx * pdx + pdy * pdy) < 25 + ep.splashRadius) {
                    if (ep.splashRadius > 0) {
                        const armor = this.upgradeStore.statMultipliers.armor || 0;
                        const rawDamage = ep.damage * 0.5;
                        const actualDamage = Math.max(0.1, rawDamage - armor * 0.05);
                        this.player.takeDamage(actualDamage);
                        VisualEffects.explosionEffect(ep.container.x, ep.container.y, ep.splashRadius, 0xff6b35);
                    } else {
                        const armor = this.upgradeStore.statMultipliers.armor || 0;
                        const actualDamage = Math.max(0.1, ep.damage - armor * 0.05);
                        this.player.takeDamage(actualDamage);
                        VisualEffects.impactEffect(ep.container.x, ep.container.y, 0xff6b35);
                    }
                    ep.destroy();
                    return false;
                }
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
            gem.container.visible = true;
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
            node.container.visible = true;
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

        // ── Obstacles: scroll & maintain ──
        this.obstacles = this.obstacles.filter(obs => {
            if (obs.isDestroyed) { obs.destroy(); return false; }
            obs.container.x -= playerVelX;
            obs.container.y -= playerVelY;
            const dx = obs.container.x - this.player!.container.x;
            const dy = obs.container.y - this.player!.container.y;
            // Cull far obstacles
            if (Math.sqrt(dx * dx + dy * dy) > 3500) { obs.destroy(); return false; }
            obs.container.visible = true;
            return true;
        });

        // Spawn new obstacle clusters if running low
        if (this.obstacles.length < 20 && Math.random() < 0.01) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 800 + Math.random() * 500;
            const cx = this.player!.container.x + Math.cos(angle) * radius;
            const cy = this.player!.container.y + Math.sin(angle) * radius;
            this.spawnObstacleCluster(cx, cy);
        }

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDestroyed) {
                enemy.destroy();
                return false;
            }
            enemy.container.x -= playerVelX;
            enemy.container.y -= playerVelY;
            const prevX = enemy.container.x;
            const prevY = enemy.container.y;
            enemy.updateWithPlayer(delta, this.player!.container);

            // ── Enemy vs obstacle collision ──
            for (const obs of this.obstacles) {
                if (obs.isDestroyed) continue;
                const dx = enemy.container.x - obs.container.x;
                const dy = enemy.container.y - obs.container.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 22 + obs.radius) {
                    if (enemy.isFlying) {
                        // Flying: slow down when passing through
                        enemy.container.x = prevX + (enemy.container.x - prevX) * obs.slowFactor;
                        enemy.container.y = prevY + (enemy.container.y - prevY) * obs.slowFactor;
                    } else {
                        // Ground: blocked — revert to previous position
                        enemy.container.x = prevX;
                        enemy.container.y = prevY;
                    }
                    break;
                }
            }

            enemy.lastX = enemy.container.x;
            enemy.lastY = enemy.container.y;
            enemy.container.visible = true;

            // ── Ranged enemy: fire at player ──
            if (enemy.isRanged) {
                const proj = enemy.fireAtPlayer(this.player!.container);
                if (proj) {
                    this.enemyProjectiles.push(proj);
                    this.enemyProjectilesContainer.addChild(proj.container);
                }
            }

            for (const p of this.projectiles) {
                if (p.isDestroyed) continue;

                // ── Splash: cache projectile position before any destroy ──
                const px = p.container.x;
                const py = p.container.y;
                const splashRadius = p.splashRadius;

                const dx = px - enemy.container.x;
                const dy = py - enemy.container.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 25) {
                    // Skip if this piercing projectile already hit this enemy
                    if (p.pierce && p.hitEnemies.has(enemy)) continue;

                    const hitX = enemy.container.x;
                    const hitY = enemy.container.y;

                    if (splashRadius > 0) {
                        // ── Splash (rocket) ──
                        VisualEffects.explosionEffect(px, py, splashRadius, 0xff8c42);

                        for (const splashEnemy of this.enemies) {
                            if (splashEnemy.isDestroyed) continue;
                            const sx = splashEnemy.container.x - px;
                            const sy = splashEnemy.container.y - py;
                            const splashDist = Math.sqrt(sx * sx + sy * sy);
                            if (splashDist <= splashRadius) {
                                const falloff = 1 - Math.min(1, splashDist / splashRadius) * 0.35;
                                const sx2 = splashEnemy.container.x;
                                const sy2 = splashEnemy.container.y;
                                splashEnemy.takeDamage(p.damage * falloff);
                                if (splashEnemy.isDestroyed) {
                                    this.handleEnemyKilled(splashEnemy, sx2, sy2);
                                }
                            }
                        }
                        p.destroy();
                        // If current enemy was killed by splash, remove from filter now
                        if (enemy.isDestroyed) return false;
                        continue;
                    }

                    // ── Direct hit ──
                    if (p.pierce) {
                        // Pierce: damage enemy, track hit, projectile lives on
                        enemy.takeDamage(p.damage);
                        p.hitEnemies.add(enemy);
                        VisualEffects.impactEffect(hitX, hitY, 0x67f8ff);

                        // Chain lightning
                        this.handleChainLightning(hitX, hitY, p.damage, enemy);

                        // Also spawn a trail segment behind the projectile
                        VisualEffects.trailSegment(
                            px - p.direction.x * 10,
                            py - p.direction.y * 10,
                            0x67f8ff,
                            1.5,
                        );

                        if (enemy.isDestroyed) {
                            this.handleEnemyKilled(enemy, hitX, hitY);
                            return false;
                        }
                        // Projectile continues — check next enemy
                        continue;
                    }

                    // ── Normal direct hit (gauss, minigun) ──
                    enemy.takeDamage(p.damage);
                    VisualEffects.impactEffect(hitX, hitY, splashRadius > 0 ? 0xff8c42 : 0xffcf4d);

                    // Chain lightning
                    this.handleChainLightning(hitX, hitY, p.damage, enemy);

                    const directHitKilledEnemy = enemy.isDestroyed;

                    // Ricochet check
                    if (p.ricochet && p.ricochet.bouncesLeft > 0 && !enemy.isDestroyed) {
                        const nextTarget = this.findNearestEnemy(enemy, p.ricochet!.searchRadius);
                        if (nextTarget) {
                            p.ricochet.bouncesLeft--;
                            p.damage *= (1 - p.ricochet.damageFalloff);
                            const dx2 = nextTarget.container.x - px;
                            const dy2 = nextTarget.container.y - py;
                            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                            p.direction = { x: dx2 / dist2, y: dy2 / dist2 };
                            p.container.rotation = Math.atan2(p.direction.y, p.direction.x);
                            continue;
                        }
                    }

                    // Destroy projectile after hit
                    p.destroy();
                    if (enemy.isDestroyed) {
                        if (directHitKilledEnemy) this.handleEnemyKilled(enemy, hitX, hitY);
                        return false;
                    }
                    if (directHitKilledEnemy) {
                        this.handleEnemyKilled(enemy, hitX, hitY);
                        return false;
                    }
                }
            }

            // Skip if killed by splash from another projectile
            if (enemy.isDestroyed) return false;

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

        // Tick visual effects
        VisualEffects.updateAll(delta);

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

        /** Chain lightning: after a hit, arc to nearby enemies */
    private handleChainLightning(hitX: number, hitY: number, damage: number, hitEnemy: Enemy) {
        const behavior = this.upgradeStore.activeBehaviors.find((b: any) => b.behaviorId === 'chain_lightning');
        if (!behavior) return;

        const maxTargets = behavior.params.maxTargets ?? 2;
        const damagePercent = behavior.params.damagePercent ?? 0.5;
        const chainRadius = behavior.params.chainRadius ?? 150;

        let targetsFound = 0;
        for (const target of this.enemies) {
            if (target.isDestroyed || target === hitEnemy) continue;
            const dx = target.container.x - hitX;
            const dy = target.container.y - hitY;
            if (Math.sqrt(dx * dx + dy * dy) <= chainRadius) {
                const chainDmg = damage * damagePercent;
                target.takeDamage(chainDmg);
                VisualEffects.impactEffect(target.container.x, target.container.y, 0x00f2ff);
                targetsFound++;
                if (target.isDestroyed) {
                    this.handleEnemyKilled(target, target.container.x, target.container.y);
                }
                if (targetsFound >= maxTargets) break;
            }
        }
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

        // ── Stim Pack: on kill streak trigger ──
        const stim = this.upgradeStore.activeBehaviors.find((b: any) => b.behaviorId === 'stim_pack');
        if (stim) {
            const threshold = Math.max(1, Math.round(stim.params.triggerOnKills ?? 10));
            this.stimKillCounter++;
            if (this.stimKillCounter >= threshold) {
                this.stimKillCounter = 0;
                const speedBonus = stim.params.speedBonus ?? 0.5;
                const dmgBonus = stim.params.damageBonus ?? 0.25;
                const duration = (stim.params.duration ?? 3) * 1000; // ms

                // Apply bonuses
                this.upgradeStore.statMultipliers.speedMult *= (1 + speedBonus);
                this.upgradeStore.statMultipliers.damageMult *= (1 + dmgBonus);

                // Visual feedback
                if (this.player) {
                    VisualEffects.explosionEffect(
                        this.player.container.x,
                        this.player.container.y,
                        40, 0xff4444,
                    );
                }

                // Revert after duration
                setTimeout(() => {
                    this.upgradeStore.statMultipliers.speedMult /= (1 + speedBonus);
                    this.upgradeStore.statMultipliers.damageMult /= (1 + dmgBonus);
                }, duration);
            }
        }

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

    /* ─── Obstacle spawning ─── */

    private readonly OBSTACLE_TYPES: ObstacleType[] = ['building', 'wall', 'water', 'trees', 'rocks'];

    private spawnInitialObstacles() {
        // Ring of obstacle clusters around starting position
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        for (let ring = 0; ring < 2; ring++) {
            const count = 4 + ring * 2;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                const distance = 600 + ring * 400 + Math.random() * 300;
                const cx = center.x + Math.cos(angle) * distance;
                const cy = center.y + Math.sin(angle) * distance;
                this.spawnObstacleCluster(cx, cy);
            }
        }
    }

    private spawnObstacleCluster(cx: number, cy: number) {
        // Pick a theme for this cluster
        const theme = this.OBSTACLE_TYPES[Math.floor(Math.random() * this.OBSTACLE_TYPES.length)];
        const count = theme === 'water' ? 1 + Math.floor(Math.random() * 2)
            : theme === 'rocks' ? 3 + Math.floor(Math.random() * 3)
            : 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 80;
            const ox = cx + offsetX;
            const oy = cy + offsetY;

            // Don't spawn on top of other obstacles
            let tooClose = false;
            for (const existing of this.obstacles) {
                const dx = ox - existing.container.x;
                const dy = oy - existing.container.y;
                if (Math.sqrt(dx * dx + dy * dy) < existing.radius + 20) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;

            const obs = new Obstacle(ox, oy, theme);
            this.obstacles.push(obs);
            this.obstaclesContainer.addChild(obs.container);
        }
    }
}
