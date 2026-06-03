import * as PIXI from 'pixi.js';
import { Enemy } from '../../entities/Enemy';
import { Projectile } from '../../entities/Projectile';
import { useGameStore } from '../../stores/gameStore';
import type { WeaponId } from '../../types/game';

export interface WeaponInstance {
    id: WeaponId;
    level: number;
    update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: (x: number, y: number, xp: number) => void): Projectile[];
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

    public abstract update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: (x: number, y: number, xp: number) => void): Projectile[];

    protected getDamage(baseDamage: number) {
        const crit = Math.random() < this.gameStore.stats.criticalChance;
        return baseDamage * this.gameStore.stats.damageMult * (crit ? 1.6 : 1);
    }

    protected getProjectileScale() {
        return 1 + this.gameStore.stats.projectileSizeMult;
    }

    protected getProjectileSpeed(baseSpeed: number) {
        return baseSpeed * (1 + this.gameStore.stats.projectileSpeedMult);
    }

    protected getProjectileCount() {
        return 1 + this.gameStore.stats.projectileCountBonus;
    }

    protected getNearestEnemy(x: number, y: number, enemies: Enemy[]) {
        let nearest: Enemy | null = null;
        let minDist = Infinity;
        const margin = 50; // Small margin to allow shooting slightly off-screen enemies if needed, or stick strictly to viewport
        
        for (const enemy of enemies) {
            // Safety check for destroyed enemies
            if (enemy.isDestroyed) continue;

            // Check visibility
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
}

export class GaussRifle extends BaseWeapon {
    public id: WeaponId = 'gauss_rifle';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const cooldown = 500 / (this.gameStore.stats.fireRateMult * (this.level * 0.22 + 0.85));
        const now = Date.now();

        if (now - this.lastFireTime <= cooldown) {
            return [];
        }

        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) {
            return [];
        }

        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);
        const count = this.getProjectileCount();
        const spreadStep = 0.08;
        const centerOffset = (count - 1) / 2;
        const projectiles: Projectile[] = [];

        for (let index = 0; index < count; index++) {
            const spread = (index - centerOffset) * spreadStep;
            const spreadDirection = rotateDirection(direction, spread);
            const damage = this.getDamage(10 * (1 + this.level * 0.12));
            const projectile = new Projectile(x, y, spreadDirection, {
                speed: this.getProjectileSpeed(12),
                damage,
                size: this.getProjectileScale(),
                color: 0xffcf4d,
                lifeTime: 1800,
            });
            stage.addChild(projectile.container);
            projectiles.push(projectile);
        }

        return projectiles;
    }

    private getDirection(x: number, y: number, targetX: number, targetY: number) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        return { x: dx / dist, y: dy / dist };
    }
}

export class Minigun extends BaseWeapon {
    public id: WeaponId = 'minigun';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const cooldown = 70 / this.gameStore.stats.fireRateMult;
        const now = Date.now();

        if (now - this.lastFireTime <= cooldown) {
            return [];
        }

        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) {
            return [];
        }

        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);
        const burstCount = Math.min(3, this.level);
        const projectiles: Projectile[] = [];

        for (let index = 0; index < burstCount; index++) {
            const spread = (Math.random() - 0.5) * 0.1;
            const damage = this.getDamage(4.5 * (1 + this.level * 0.08));
            const projectile = new Projectile(x, y, rotateDirection(direction, spread), {
                speed: this.getProjectileSpeed(15),
                damage,
                size: this.getProjectileScale() * 0.8,
                color: 0x9dd7ff,
                lifeTime: 1200,
            });
            stage.addChild(projectile.container);
            projectiles.push(projectile);
        }

        return projectiles;
    }

    private getDirection(x: number, y: number, targetX: number, targetY: number) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        return { x: dx / dist, y: dy / dist };
    }
}

export class RocketLauncher extends BaseWeapon {
    public id: WeaponId = 'rocket_launcher';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const cooldown = 1200 / this.gameStore.stats.fireRateMult;
        const now = Date.now();

        if (now - this.lastFireTime <= cooldown) {
            return [];
        }

        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) {
            return [];
        }

        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);
        const projectile = new Projectile(x, y, direction, {
            speed: this.getProjectileSpeed(8),
            damage: this.getDamage(24 * (1 + this.level * 0.16)),
            size: this.getProjectileScale() * 1.3,
            color: 0xff8c42,
            lifeTime: 2500,
            splashRadius: 72 + this.level * 12,
        });
        stage.addChild(projectile.container);
        return [projectile];
    }

    private getDirection(x: number, y: number, targetX: number, targetY: number) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        return { x: dx / dist, y: dy / dist };
    }
}

export class PlasmaCannon extends BaseWeapon {
    public id: WeaponId = 'plasma_cannon';

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const cooldown = 1600 / this.gameStore.stats.fireRateMult;
        const now = Date.now();

        if (now - this.lastFireTime <= cooldown) {
            return [];
        }

        const target = this.getNearestEnemy(x, y, enemies);
        if (!target) {
            return [];
        }

        this.lastFireTime = now;
        const direction = this.getDirection(x, y, target.container.x, target.container.y);
        const projectile = new Projectile(x, y, direction, {
            speed: this.getProjectileSpeed(10),
            damage: this.getDamage(34 * (1 + this.level * 0.2)),
            size: this.getProjectileScale() * 1.5,
            color: 0x67f8ff,
            lifeTime: 2200,
            splashRadius: 36 + this.level * 6,
        });
        stage.addChild(projectile.container);
        return [projectile];
    }

    private getDirection(x: number, y: number, targetX: number, targetY: number) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        return { x: dx / dist, y: dy / dist };
    }
}

export class OrbitalLaser extends BaseWeapon {
    public id: WeaponId = 'orbital_laser';

    public update(_x: number, _y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: (x: number, y: number, xp: number) => void): Projectile[] {
        const cooldown = 3000 / (1 + this.level * 0.2);
        const now = Date.now();

        if (now - this.lastFireTime <= cooldown) {
            return [];
        }

        this.lastFireTime = now;
        const visibleEnemies = enemies.filter(enemy => 
            !enemy.isDestroyed &&
            enemy.container.x >= -50 && 
            enemy.container.x <= window.innerWidth + 50 && 
            enemy.container.y >= -50 && 
            enemy.container.y <= window.innerHeight + 50
        );
        
        const target = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)];
        if (!target) {
            return [];
        }

        this.strike(target.container.x, target.container.y, stage, enemies, onEnemyKilled);
        return [];
    }

    private strike(tx: number, ty: number, stage: PIXI.Container, enemies: Enemy[], onEnemyKilled?: (x: number, y: number, xp: number) => void) {
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
                const enemyX = enemy.container.x;
                const enemyY = enemy.container.y;
                const exp = enemy.xpValue;

                enemy.takeDamage(100 * (1 + this.level * 0.5));

                if (enemy.isDestroyed && onEnemyKilled) {
                    onEnemyKilled(enemyX, enemyY, exp);
                }
            }
        }

        let life = 1.0;
        const ticker = (tickerObj: PIXI.Ticker) => {
            life -= tickerObj.deltaTime * 0.05;
            laser.alpha = life;
            laser.scale.x = life;
            if (life <= 0) {
                stage.removeChild(laser);
                laser.destroy();
                PIXI.Ticker.shared.remove(ticker);
            }
        };

        PIXI.Ticker.shared.add(ticker);
    }
}

export class WeaponSystem {
    public equipped: WeaponInstance[] = [];

    constructor() {
        this.equipped.push(new GaussRifle());
    }

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: (x: number, y: number, xp: number) => void): Projectile[] {
        const allProjectiles: Projectile[] = [];
        for (const weapon of this.equipped) {
            const newProjectiles = weapon.update(x, y, enemies, stage, onEnemyKilled);
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
