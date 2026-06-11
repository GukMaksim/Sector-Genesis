import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { useGameStore } from '../stores/gameStore';

const Direction = {
    DOWN: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3
} as const;
type Direction = (typeof Direction)[keyof typeof Direction];

abstract class MarineBase extends Enemy {
    public override isRanged: boolean = true;

    protected animations: Map<Direction, PIXI.AnimatedSprite> = new Map();
    protected currentDirection: Direction = Direction.DOWN;
    protected spriteContainer: PIXI.Container;
    protected shadow: PIXI.Graphics;
    protected spriteScale: number = 0.4;
    protected texturePath: string = '/characters/marine/marine-recruit.png';

    protected lastFireTime: number = 0;
    protected fireCooldown: number = 2000;
    protected projectileSpeed: number = 6;
    protected projectileDamage: number = 5;
    protected projectileColor: number = 0xff6b35;
    protected preferredDistance: number = 300;
    protected projectileSize: number = 1;

    constructor(x: number, y: number) {
        super(x, y);

        this.spriteContainer = new PIXI.Container();
        this.setVisual(this.spriteContainer);

        this.shadow = new PIXI.Graphics();
        this.shadow.ellipse(0, 20, 18, 6);
        this.shadow.fill({ color: 0x000000, alpha: 0.3 });
        this.spriteContainer.addChild(this.shadow);

        this.setupAnimations();
    }

    protected setupAnimations() {
        const texture = PIXI.Assets.get(this.texturePath);
        if (!texture) {
            console.error(`Marine texture not found at ${this.texturePath}!`);
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
            anim.animationSpeed = 0.12;
            anim.scale.set(this.spriteScale);
            anim.visible = false;

            this.animations.set(row as Direction, anim);
            this.spriteContainer.addChild(anim);
        }

        const defaultAnim = this.animations.get(this.currentDirection);
        if (defaultAnim) {
            defaultAnim.visible = true;
            defaultAnim.play();
        }
    }

    protected setDirection(newDirection: Direction) {
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
            newAnim.play();
        }
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, this.getMaxHealth());
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            let newDir = this.currentDirection;
            if (Math.abs(dx) > Math.abs(dy)) {
                newDir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                newDir = dy > 0 ? Direction.DOWN : Direction.UP;
            }
            this.setDirection(newDir);

            if (dist > this.preferredDistance) {
                const moveX = (dx / dist) * this.speed * delta;
                const moveY = (dy / dist) * this.speed * delta;
                this.container.x += moveX;
                this.container.y += moveY;
                this.lastX = this.container.x;
                this.lastY = this.container.y;
            } else if (dist < this.preferredDistance * 0.5) {
                const moveX = -(dx / dist) * this.speed * delta * 0.5;
                const moveY = -(dy / dist) * this.speed * delta * 0.5;
                this.container.x += moveX;
                this.container.y += moveY;
                this.lastX = this.container.x;
                this.lastY = this.container.y;
            }
        }

        this.animationTime += delta * 0.2;
    }

    private getMaxHealth(): number {
        return this.health;
    }

    public fireAtPlayer(playerPos: { x: number, y: number }): Projectile | null {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireCooldown) return null;
        this.lastFireTime = now;

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const direction = { x: dx / dist, y: dy / dist };

        const gameStore = useGameStore();
        const timeMult = 1 + gameStore.time * 0.005;

        return new Projectile(this.container.x, this.container.y, direction, {
            speed: this.projectileSpeed,
            damage: this.projectileDamage * timeMult,
            size: this.projectileSize,
            color: this.projectileColor,
            lifeTime: 4000,
            shape: 'rect',
        });
    }
}

export class MarineRecruit extends MarineBase {
    public health: number = 20;
    public speed: number = 2;
    public damage: number = 5;
    public xpValue: number = 10;
    public override texturePath = '/characters/marine/marine-recruit.png';
    public override fireCooldown = 2000;
    public override projectileSpeed = 6;
    public override projectileDamage = 5;
    public override projectileColor = 0xff6b35;
    public override preferredDistance = 300;
}

export class MarineVeteran extends MarineBase {
    public health: number = 35;
    public speed: number = 2.5;
    public damage: number = 8;
    public xpValue: number = 20;
    public override texturePath = '/characters/marine/marine-veteran.png';
    public override fireCooldown = 120;
    public override projectileSpeed = 7;
    public override projectileDamage = 3;
    public override projectileColor = 0x9dd7ff;
    public override preferredDistance = 280;
    public override spriteScale: number = 0.45;

    private burstCount: number = 0;
    private readonly BURST_SIZE = 3;
    private burstDelay: number = 80;

    public fireAtPlayer(playerPos: { x: number; y: number }): Projectile | null {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireCooldown) return null;

        this.burstCount++;
        if (this.burstCount >= this.BURST_SIZE) {
            this.lastFireTime = now;
            this.burstCount = 0;
        } else {
            this.lastFireTime = now - this.fireCooldown + this.burstDelay;
        }

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const direction = { x: dx / dist, y: dy / dist };
        const spread = (Math.random() - 0.5) * 0.08;
        const spreadDir = {
            x: direction.x * Math.cos(spread) - direction.y * Math.sin(spread),
            y: direction.x * Math.sin(spread) + direction.y * Math.cos(spread),
        };

        const gameStore = useGameStore();
        const timeMult = 1 + gameStore.time * 0.005;

        return new Projectile(this.container.x, this.container.y, spreadDir, {
            speed: this.projectileSpeed,
            damage: this.projectileDamage * timeMult,
            size: 0.8,
            color: this.projectileColor,
            lifeTime: 3000,
            shape: 'rect',
        });
    }
}

export class HeavyTrooper extends MarineBase {
    public health: number = 60;
    public speed: number = 1.5;
    public damage: number = 15;
    public xpValue: number = 40;
    public override texturePath = '/characters/marine/heavy-trooper.png';
    public override fireCooldown = 2500;
    public override projectileSpeed = 5;
    public override projectileDamage = 12;
    public override projectileColor = 0xff8c42;
    public override preferredDistance = 400;
    public override spriteScale: number = 0.5;
    public override projectileSize: number = 1.3;

    public fireAtPlayer(playerPos: { x: number; y: number }): Projectile | null {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireCooldown) return null;
        this.lastFireTime = now;

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const direction = { x: dx / dist, y: dy / dist };

        const gameStore = useGameStore();
        const timeMult = 1 + gameStore.time * 0.005;

        return new Projectile(this.container.x, this.container.y, direction, {
            speed: this.projectileSpeed,
            damage: this.projectileDamage * timeMult,
            size: this.projectileSize,
            color: this.projectileColor,
            lifeTime: 5000,
            shape: 'circle',
            splashRadius: 60,
        });
    }
}

export class SiegeCommander extends MarineBase {
    public health: number = 100;
    public speed: number = 1.2;
    public damage: number = 20;
    public xpValue: number = 60;
    public override texturePath = '/characters/marine/siege-commander.png';
    public override fireCooldown = 2800;
    public override projectileSpeed = 6;
    public override projectileDamage = 18;
    public override projectileColor = 0x67f8ff;
    public override preferredDistance = 450;
    public override spriteScale: number = 0.55;
    public override projectileSize: number = 1.5;

    public fireAtPlayer(playerPos: { x: number; y: number }): Projectile | null {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireCooldown) return null;
        this.lastFireTime = now;

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const direction = { x: dx / dist, y: dy / dist };

        const gameStore = useGameStore();
        const timeMult = 1 + gameStore.time * 0.005;

        return new Projectile(this.container.x, this.container.y, direction, {
            speed: this.projectileSpeed,
            damage: this.projectileDamage * timeMult,
            size: this.projectileSize,
            color: this.projectileColor,
            lifeTime: 5000,
            shape: 'circle',
            pierce: true,
            splashRadius: 100,
        });
    }
}

export class DominionGeneral extends MarineBase {
    public health: number = 300;
    public speed: number = 2;
    public damage: number = 30;
    public xpValue: number = 150;
    public override texturePath = '/characters/marine/dominion-general.png';
    public override fireCooldown = 1500;
    public override projectileSpeed: number = 8;
    public override projectileDamage = 15;
    public override projectileColor = 0x00f2ff;
    public override preferredDistance = 350;
    public override spriteScale: number = 0.7;
    public override projectileSize: number = 1.2;
    public override isBoss: boolean = true;

    public fireAtPlayer(playerPos: { x: number; y: number }): Projectile | null {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireCooldown) return null;
        this.lastFireTime = now;

        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const direction = { x: dx / dist, y: dy / dist };

        const gameStore = useGameStore();
        const timeMult = 1 + gameStore.time * 0.005;

        return new Projectile(this.container.x, this.container.y, direction, {
            speed: this.projectileSpeed,
            damage: this.projectileDamage * timeMult,
            size: this.projectileSize,
            color: this.projectileColor,
            lifeTime: 4000,
            shape: 'rect',
        });
    }
}
