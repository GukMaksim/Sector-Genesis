import * as PIXI from 'pixi.js';
import { Enemy } from '../../entities/Enemy';
import { Projectile } from '../../entities/Projectile';
import { useGameStore } from '../../stores/gameStore';
import { useUpgradeStore } from '../../stores/upgradeStore';
import { VisualEffects } from './VisualEffects';
import type { WeaponId } from '../../types/game';

export type EnemyKilledCallback = (enemy: Enemy, x?: number, y?: number) => void;

export interface WeaponInstance {
    id: WeaponId;
    level: number;
    update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: EnemyKilledCallback): Projectile[];
}

type Direction = { x: number; y: number };

const rotateDirection = (direction: Direction, radians: number): Direction => ({
    x: direction.x * Math.cos(radians) - direction.y * Math.sin(radians),
    y: direction.x * Math.sin(radians) + direction.y * Math.cos(radians),
});

abstract class BaseWeapon implements WeaponInstance {
    public abstract id: WeaponId;
    public level = 1;
    protected lastFireTime = 0;
    protected gameStore = useGameStore();
    protected upgradeStore = useUpgradeStore();

    public abstract update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: EnemyKilledCallback): Projectile[];

    /** Returns weapon-specific mod multiplier for a stat (default 1) */
    protected getWeaponModMult(stat: string): number {
        const engine = (window as any).gameEngine;
        if (!engine?.upgradeManager) return 1;
        const mods = engine.upgradeManager.getWeaponMod(this.id);
        let mult = 1;
        for (const m of mods) {
            if (m.stat === stat && m.mode === 'mult') mult *= (1 + m.value * m.level);
        }
        return mult;
    }

    /** Returns weapon-specific mod additive bonus for a stat (default 0) */
    protected getWeaponModAdd(stat: string): number {
        const engine = (window as any).gameEngine;
        if (!engine?.upgradeManager) return 0;
        const mods = engine.upgradeManager.getWeaponMod(this.id);
        let add = 0;
        for (const m of mods) {
            if (m.stat === stat && m.mode === 'add') add += m.value * m.level;
        }
        return add;
    }

    protected getDamage(baseDamage: number) {
        const stats = this.upgradeStore.statMultipliers;
        const crit = Math.random() < stats.criticalChance;
        return baseDamage * stats.damageMult * this.getWeaponModMult('damage') * (crit ? 1.6 : 1);
    }

    protected getProjectileScale() {
        return 1 + this.upgradeStore.statMultipliers.projectileSizeMult;
    }

    protected getProjectileSpeed(baseSpeed: number) {
        return baseSpeed * (1 + this.upgradeStore.statMultipliers.projectileSpeedMult) * this.getWeaponModMult('projectileSpeed');
    }

    protected getProjectileCount() {
        return 1 + this.upgradeStore.statMultipliers.projectileCountBonus + this.getWeaponModAdd('projectileCount');
    }

    protected getNearestEnemy(x: number, y: number, enemies: Enemy[]) {
        let nearest: Enemy | null = null;
        let minDist = Infinity;
        const margin = 50;

        for (const enemy of enemies) {
            if (enemy.isDestroyed) continue;
            if (enemy.container.x < -margin ||
                enemy.container.x > window.innerWidth + margin ||
                enemy.container.y < -margin ||
                enemy.container.y > window.innerHeight + margin) {
                continue;
            }
            const dx = enemy.container.x - x;
            const dy = enemy.container.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    protected getRicochetOptions(): { maxBounces: number; damageFalloff: number; searchRadius: number; bouncesLeft: number } | undefined {
        const behavior = this.upgradeStore.activeBehaviors.find((b: any) => b.behaviorId === 'ricochet');
        if (!behavior) return undefined;
        return {
            maxBounces: behavior.params.maxBounces,
            damageFalloff: behavior.params.damageFalloff,
            searchRadius: behavior.params.searchRadius,
            bouncesLeft: behavior.params.maxBounces,
        };
    }

    /** Direction from (x,y) to (targetX,targetY). */
    protected getDirection(x: number, y: number, targetX: number, targetY: number) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        return { x: dx / dist, y: dy / dist };
    }
}

/* ─── Gauss Rifle ─────────────────────────────────────────── */

export class GaussRifle extends BaseWeapon {
    public id: WeaponId = 'gauss_rifle';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const stats = this.upgradeStore.statMultipliers;
        const cooldown = 500 / (stats.fireRateMult * (this.level * 0.22 + 0.85));
        const now = Date.now();
        if (now - this.lastFireTime <= cooldown) return [];
        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) return [];
        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);
        const count = this.getProjectileCount();
        const spreadStep = 0.08;
        const centerOffset = (count - 1) / 2;
        const projectiles: Projectile[] = [];
        const ricochet = this.getRicochetOptions();

        // Muzzle flash
        VisualEffects.muzzleFlash(x, y, Math.atan2(direction.y, direction.x), 0xffcf4d);

        for (let index = 0; index < count; index++) {
            const spread = (index - centerOffset) * spreadStep;
            const spreadDirection = rotateDirection(direction, spread);
            const damage = this.getDamage(14 * (1 + this.level * 0.15));
            const hasPierce = this.getWeaponModAdd('pierce') > 0;
            const projectile = new Projectile(x, y, spreadDirection, {
                speed: this.getProjectileSpeed(12),
                damage,
                size: this.getProjectileScale(),
                color: 0xffcf4d,
                lifeTime: 1800,
                ricochet,
                pierce: hasPierce,
            });
            stage.addChild(projectile.container);
            projectiles.push(projectile);
        }
        return projectiles;
    }
}

/* ─── Minigun ────────────────────────────────────────────── */

export class Minigun extends BaseWeapon {
    public id: WeaponId = 'minigun';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const stats = this.upgradeStore.statMultipliers;
        const cooldown = 70 / stats.fireRateMult;
        const now = Date.now();
        if (now - this.lastFireTime <= cooldown) return [];
        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) return [];
        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);
        const burstCount = Math.min(3, this.level);
        const projectiles: Projectile[] = [];
        const ricochet = this.getRicochetOptions();

        // Muzzle flash (small)
        VisualEffects.muzzleFlash(x, y, Math.atan2(direction.y, direction.x), 0x9dd7ff);

        for (let index = 0; index < burstCount; index++) {
            const spread = (Math.random() - 0.5) * 0.1;
            const damage = this.getDamage(2.5 * (1 + this.level * 0.1));
            const projectile = new Projectile(x, y, rotateDirection(direction, spread), {
                speed: this.getProjectileSpeed(15),
                damage,
                size: this.getProjectileScale() * 0.8,
                color: 0x9dd7ff,
                lifeTime: 1200,
                ricochet,
            });
            stage.addChild(projectile.container);
            projectiles.push(projectile);
        }
        return projectiles;
    }
}

/* ─── Rocket Launcher ────────────────────────────────────── */

export class RocketLauncher extends BaseWeapon {
    public id: WeaponId = 'rocket_launcher';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const stats = this.upgradeStore.statMultipliers;
        const cooldown = 1200 / stats.fireRateMult;
        const now = Date.now();
        if (now - this.lastFireTime <= cooldown) return [];
        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) return [];
        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);

        // Muzzle flash
        VisualEffects.muzzleFlash(x, y, Math.atan2(direction.y, direction.x), 0xff8c42);

        const projectile = new Projectile(x, y, direction, {
            speed: this.getProjectileSpeed(8),
            damage: this.getDamage(32 * (1 + this.level * 0.18)),
            size: this.getProjectileScale() * 1.3,
            color: 0xff8c42,
            lifeTime: 2500,
            splashRadius: 80 + this.level * 12,
        });
        stage.addChild(projectile.container);
        return [projectile];
    }
}

/* ─── Plasma Cannon ──────────────────────────────────────── */

export class PlasmaCannon extends BaseWeapon {
    public id: WeaponId = 'plasma_cannon';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const stats = this.upgradeStore.statMultipliers;
        const cooldown = 1600 / stats.fireRateMult;
        const now = Date.now();
        if (now - this.lastFireTime <= cooldown) return [];
        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) return [];
        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);

        // Muzzle flash
        VisualEffects.muzzleFlash(x, y, Math.atan2(direction.y, direction.x), 0x67f8ff);

        const projectile = new Projectile(x, y, direction, {
            speed: this.getProjectileSpeed(10),
            damage: this.getDamage(38 * (1 + this.level * 0.22)),
            size: this.getProjectileScale() * 1.5,
            color: 0x67f8ff,
            lifeTime: 2200,
            pierce: true, // flies through all enemies in its path
            shape: 'circle',
        });
        stage.addChild(projectile.container);
        return [projectile];
    }
}

/* ─── Orbital Laser ──────────────────────────────────────── */

export class OrbitalLaser extends BaseWeapon {
    public id: WeaponId = 'orbital_laser';

    public update(_x: number, _y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: EnemyKilledCallback): Projectile[] {
        const cooldown = 3000 / (1 + this.level * 0.2);
        const now = Date.now();
        if (now - this.lastFireTime <= cooldown) return [];
        this.lastFireTime = now;
        const visibleEnemies = enemies.filter(enemy =>
            !enemy.isDestroyed &&
            enemy.container.x >= -50 &&
            enemy.container.x <= window.innerWidth + 50 &&
            enemy.container.y >= -50 &&
            enemy.container.y <= window.innerHeight + 50
        );
        const target = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)];
        if (!target) return [];
        this.strike(target.container.x, target.container.y, stage, enemies, onEnemyKilled);
        return [];
    }

    private strike(tx: number, ty: number, stage: PIXI.Container, enemies: Enemy[], onEnemyKilled?: EnemyKilledCallback) {
        // Visual warning flash
        VisualEffects.explosionEffect(tx, ty, 60, 0x00f2ff);

        const laser = new PIXI.Graphics();
        laser.rect(-4, -1000, 8, 1000);
        laser.fill(0x00f2ff);
        laser.alpha = 1;
        laser.x = tx;
        laser.y = ty;
        stage.addChild(laser);

        const radius = 80 + this.level * 15;
        for (const enemy of enemies) {
            if (enemy.isDestroyed) continue;
            const dx = enemy.container.x - tx;
            const dy = enemy.container.y - ty;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
                const ex = enemy.container.x;
                const ey = enemy.container.y;
                enemy.takeDamage(100 * (1 + this.level * 0.5));
                if (enemy.isDestroyed && onEnemyKilled) {
                    onEnemyKilled(enemy, ex, ey);
                }
            }
        }

        // Impact sparks at strike center
        VisualEffects.impactEffect(tx, ty, 0x00f2ff);

        let life = 1.0;
        const ticker = (tickerObj: PIXI.Ticker) => {
            if (laser.destroyed) {
                PIXI.Ticker.shared.remove(ticker);
                return;
            }
            life -= tickerObj.deltaTime * 0.05;
            laser.alpha = life;
            laser.scale.x = life;
            if (life <= 0) {
                if (stage && !stage.destroyed) {
                    stage.removeChild(laser);
                }
                laser.destroy();
                PIXI.Ticker.shared.remove(ticker);
            }
        };
        PIXI.Ticker.shared.add(ticker);
    }
}

/* ─── WeaponSystem ───────────────────────────────────────── */

export class WeaponSystem {
    public equipped: WeaponInstance[] = [];

    constructor() {
        this.equipped.push(new GaussRifle());
    }

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: EnemyKilledCallback): Projectile[] {
        const allProjectiles: Projectile[] = [];
        const activeId = useGameStore().activeWeaponId;
        const activeWeapon = this.equipped.find((weapon) => weapon.id === activeId);
        if (activeWeapon && activeId !== 'orbital_laser') {
            const newProjectiles = activeWeapon.update(x, y, enemies, stage, onEnemyKilled);
            allProjectiles.push(...newProjectiles);
        }
        const orbitalLaser = this.equipped.find((weapon) => weapon.id === 'orbital_laser');
        if (orbitalLaser) {
            const newProjectiles = orbitalLaser.update(x, y, enemies, stage, onEnemyKilled);
            allProjectiles.push(...newProjectiles);
        }
        return allProjectiles;
    }

    public addOrUpgrade(id: WeaponId) {
        const existing = this.equipped.find((weapon) => weapon.id === id);
        if (existing) {
            existing.level++;
            return;
        }
        switch (id) {
            case 'gauss_rifle':
                this.equipped.push(new GaussRifle());
                break;
            case 'minigun':
                this.equipped.push(new Minigun());
                break;
            case 'rocket_launcher':
                this.equipped.push(new RocketLauncher());
                break;
            case 'plasma_cannon':
                this.equipped.push(new PlasmaCannon());
                break;
            case 'orbital_laser':
                this.equipped.push(new OrbitalLaser());
                break;
        }
    }
}
