import * as PIXI from 'pixi.js';
import { Projectile } from '../../entities/Projectile';
import { useGameStore } from '../../stores/gameStore';
import { Enemy } from '../../entities/Enemy';

export interface WeaponInstance {
    id: string;
    level: number;
    update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: (x: number, y: number, xp: number) => void): Projectile[];
}

export class GaussRifle implements WeaponInstance {
    public id = 'gauss_rifle';
    public level = 1;
    private lastFireTime = 0;
    private gameStore = useGameStore();

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container): Projectile[] {
        const cooldown = 500 / (this.gameStore.stats.fireRateMult * (this.level * 0.2 + 0.8));
        const now = Date.now();

        if (now - this.lastFireTime > cooldown) {
            this.lastFireTime = now;
            const target = this.getNearestEnemy(x, y, enemies);
            if (target) {
                return this.fire(x, y, target.container, stage);
            }
        }
        return [];
    }

    private getNearestEnemy(x: number, y: number, enemies: Enemy[]) {
        let nearest = null;
        let minDist = Infinity;
        for (const e of enemies) {
            const d = Math.sqrt(Math.pow(e.container.x - x, 2) + Math.pow(e.container.y - y, 2));
            if (d < minDist) {
                minDist = d;
                nearest = e;
            }
        }
        return nearest;
    }

    private fire(x: number, y: number, target: PIXI.Container, stage: PIXI.Container): Projectile[] {
        const dx = target.x - x;
        const dy = target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const direction = { x: dx / dist, y: dy / dist };
        const damage = 10 * this.gameStore.stats.damageMult * (1 + this.level * 0.1);

        const p = new Projectile(x, y, direction);
        p.damage = damage;
        stage.addChild(p.container);
        return [p];
    }
}

export class OrbitalLaser implements WeaponInstance {
    public id = 'orbital_laser';
    public level = 1;
    private lastFireTime = 0;
    private gameStore = useGameStore();

    public update(x: number, y: number, enemies: Enemy[], stage: PIXI.Container, onEnemyKilled?: (x: number, y: number, xp: number) => void): Projectile[] {
        const cooldown = 3000 / (1 + this.level * 0.2);
        const now = Date.now();

        if (now - this.lastFireTime > cooldown) {
            this.lastFireTime = now;
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            if (target) {
                this.strike(target.container.x, target.container.y, stage, enemies, onEnemyKilled);
            }
        }
        return [];
    }

    private strike(tx: number, ty: number, stage: PIXI.Container, enemies: Enemy[], onEnemyKilled?: (x: number, y: number, xp: number) => void) {
        const laser = new PIXI.Graphics();
        laser.rect(-4, -1000, 8, 1000); // Thicker laser
        laser.fill(0x00f2ff);
        laser.alpha = 1;
        laser.x = tx;
        laser.y = ty;
        stage.addChild(laser);

        const radius = 80 + this.level * 15;
        for (const e of enemies) {
            const d = Math.sqrt(Math.pow(e.container.x - tx, 2) + Math.pow(e.container.y - ty, 2));
            if (d < radius) {
                const ex = e.container.x;
                const ey = e.container.y;
                const exp = e.xpValue;
                
                e.takeDamage(100 * (1 + this.level * 0.5));
                
                if (e.isDestroyed && onEnemyKilled) {
                    onEnemyKilled(ex, ey, exp);
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

    public addOrUpgrade(id: string) {
        const existing = this.equipped.find(w => w.id === id);
        if (existing) {
            existing.level++;
        } else {
            if (id === 'orbital_laser') this.equipped.push(new OrbitalLaser());
        }
    }
}
