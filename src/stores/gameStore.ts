import { defineStore } from 'pinia';
import type { RaceType, EvolutionStage } from '../types/game';
import { HUMAN_CONFIG } from '../config/human.config';

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    stat: string;
    value: number;
}

export const useGameStore = defineStore('game', {
    state: () => ({
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        race: 'HUMANS' as RaceType,
        currentStageIndex: 0,
        kills: 0,
        time: 0, // In seconds
        credits: 0,
        isGameOver: false,
        isPaused: false,
        showUpgradeOverlay: false,
        availableUpgrades: [] as Upgrade[],
        stats: {
            damageMult: 1,
            fireRateMult: 1,
            speedMult: 1,
            projectileCountBonus: 0,
        }
    }),
    getters: {
        currentStage(): EvolutionStage {
            const config = HUMAN_CONFIG;
            return config.stages[this.currentStageIndex];
        },
        xpPercentage(): number {
            return (this.xp / this.nextLevelXp) * 100;
        }
    },
    actions: {
        addXp(amount: number) {
            this.xp += amount;
            if (this.xp >= this.nextLevelXp) {
                this.levelUp();
            }
        },
        levelUp() {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.2);
            
            // Evolution
            const config = HUMAN_CONFIG;
            const nextStage = config.stages[this.currentStageIndex + 1];
            if (nextStage && this.level >= nextStage.level) {
                this.currentStageIndex++;
            }

            // Generate upgrades
            this.generateUpgrades();
            this.isPaused = true;
            this.showUpgradeOverlay = true;
        },
        generateUpgrades() {
            const pool: Upgrade[] = [
                { id: 'dmg', name: 'Nano-Sharpening', description: 'Damage +15%', stat: 'damageMult', value: 0.15 },
                { id: 'spd', name: 'Servo Boost', description: 'Speed +10%', stat: 'speedMult', value: 0.1 },
                { id: 'fir', name: 'Overclocked Coils', description: 'Fire Rate +20%', stat: 'fireRateMult', value: 0.2 },
                { id: 'orbital_laser', name: 'Orbital Strike', description: 'Unlock or upgrade Orbital Laser support', stat: 'weapon', value: 1 },
                { id: 'arm', name: 'Heavy Plating', description: 'Reduce incoming damage', stat: 'armor', value: 2 },
                { id: 'lst', name: 'Bio-Leech', description: 'Heal on enemy kill', stat: 'lifesteal', value: 1 },
            ];
            
            this.availableUpgrades = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
        },
        applyUpgrade(upgrade: Upgrade) {
            const engine = (window as any).gameEngine;
            
            if (upgrade.stat === 'weapon') {
                engine?.weaponSystem.addOrUpgrade(upgrade.id);
            } else if (upgrade.stat === 'projectileCountBonus') {
                this.stats.projectileCountBonus += upgrade.value;
            } else {
                if (!(this.stats as any)[upgrade.stat]) {
                    (this.stats as any)[upgrade.stat] = 0;
                }
                (this.stats as any)[upgrade.stat] += upgrade.value;
            }
            
            this.showUpgradeOverlay = false;
            this.isPaused = false;
        }
    }
});
