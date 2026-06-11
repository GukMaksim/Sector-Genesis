import * as PIXI from 'pixi.js';
import { Enemy, Zergling, Mutalisk, BossZergling, BossMutalisk } from '../../entities/Enemy';
import { MarineRecruit, MarineVeteran, HeavyTrooper, SiegeCommander, DominionGeneral } from '../../entities/RangedEnemy';
import { useGameStore } from '../../stores/gameStore';

export class SpawnerSystem {
    private lastSpawnTime: number = 0;
    private stage: PIXI.Container;
    private gameStore = useGameStore();

    private hasSpawned5MinBoss: boolean = false;
    private hasSpawned10MinBoss: boolean = false;

    constructor(stage: PIXI.Container) {
        this.stage = stage;
    }

    private get currentSpawnInterval(): number {
        return Math.max(400, 2000 - this.gameStore.time * 5);
    }

    public update(playerPos: { x: number, y: number }): Enemy[] {
        const enemiesToSpawn: Enemy[] = [];

        if (this.gameStore.time >= 300 && !this.hasSpawned5MinBoss) {
            this.hasSpawned5MinBoss = true;
            enemiesToSpawn.push(this.spawnBoss(playerPos, this.gameStore.race === 'BIOFORMS' ? 'heavy' : 'zergling'));
        }
        if (this.gameStore.time >= 600 && !this.hasSpawned10MinBoss) {
            this.hasSpawned10MinBoss = true;
            enemiesToSpawn.push(this.spawnBoss(playerPos, this.gameStore.race === 'BIOFORMS' ? 'general' : 'mutalisk'));
        }

        const now = Date.now();
        if (now - this.lastSpawnTime > this.currentSpawnInterval) {
            this.lastSpawnTime = now;
            enemiesToSpawn.push(this.spawnEnemy(playerPos));
        }

        return enemiesToSpawn;
    }

    private spawnBoss(playerPos: { x: number, y: number }, type: 'zergling' | 'mutalisk' | 'heavy' | 'general'): Enemy {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
        const x = playerPos.x + Math.cos(angle) * radius;
        const y = playerPos.y + Math.sin(angle) * radius;

        let boss: Enemy;
        switch (type) {
            case 'heavy':
                boss = new HeavyTrooper(x, y);
                break;
            case 'general':
                boss = new DominionGeneral(x, y);
                break;
            case 'zergling':
                boss = new BossZergling(x, y);
                break;
            default:
                boss = new BossMutalisk(x, y);
        }

        this.stage.addChild(boss.container);
        return boss;
    }

    private spawnEnemy(playerPos: { x: number, y: number }): Enemy {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
        const x = playerPos.x + Math.cos(angle) * radius;
        const y = playerPos.y + Math.sin(angle) * radius;

        let enemy: Enemy;

        if (this.gameStore.race === 'BIOFORMS') {
            enemy = this.spawnMarineEnemy(x, y);
        } else {
            if (this.gameStore.time > 30 || this.gameStore.level >= 3) {
                if (Math.random() < 0.3) {
                    enemy = new Mutalisk(x, y);
                } else {
                    enemy = new Zergling(x, y);
                }
            } else {
                enemy = new Zergling(x, y);
            }
        }

        enemy.health += this.gameStore.time * 0.2;

        this.stage.addChild(enemy.container);
        return enemy;
    }

    private spawnMarineEnemy(x: number, y: number): Enemy {
        const time = this.gameStore.time;
        const r = Math.random();

        if (time < 30) {
            return new MarineRecruit(x, y);
        } else if (time < 120) {
            if (r < 0.7) return new MarineRecruit(x, y);
            return new MarineVeteran(x, y);
        } else if (time < 300) {
            if (r < 0.4) return new MarineRecruit(x, y);
            if (r < 0.75) return new MarineVeteran(x, y);
            return new HeavyTrooper(x, y);
        } else {
            if (r < 0.2) return new MarineRecruit(x, y);
            if (r < 0.5) return new MarineVeteran(x, y);
            if (r < 0.8) return new HeavyTrooper(x, y);
            return new SiegeCommander(x, y);
        }
    }
}
