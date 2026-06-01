import * as PIXI from 'pixi.js';
import { Enemy, Zergling, Mutalisk } from '../../entities/Enemy';
import { useGameStore } from '../../stores/gameStore';

export class SpawnerSystem {
    private lastSpawnTime: number = 0;
    private stage: PIXI.Container;
    private gameStore = useGameStore();

    constructor(stage: PIXI.Container) {
        this.stage = stage;
    }

    private get currentSpawnInterval(): number {
        return Math.max(400, 2000 - this.gameStore.time * 5);
    }

    public update(playerPos: { x: number, y: number }): Enemy[] {
        const now = Date.now();
        if (now - this.lastSpawnTime > this.currentSpawnInterval) {
            this.lastSpawnTime = now;
            return [this.spawnEnemy(playerPos)];
        }
        return [];
    }

    private spawnEnemy(playerPos: { x: number, y: number }): Enemy {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
        const x = playerPos.x + Math.cos(angle) * radius;
        const y = playerPos.y + Math.sin(angle) * radius;
        
        let enemy: Enemy;
        
        // Tiered spawning: Mutalisks appear after 30 seconds or Level 3
        if (this.gameStore.time > 30 || this.gameStore.level >= 3) {
            if (Math.random() < 0.3) {
                enemy = new Mutalisk(x, y);
            } else {
                enemy = new Zergling(x, y);
            }
        } else {
            enemy = new Zergling(x, y);
        }
        
        // Scale enemy stats based on time
        enemy.health += this.gameStore.time * 0.2;
        
        this.stage.addChild(enemy.container);
        return enemy;
    }
}
