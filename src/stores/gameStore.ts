import { defineStore } from 'pinia';
import { HUMAN_CONFIG } from '../config/human.config';
import type {
    EvolutionStage,
    RaceType,
    WeaponId,
} from '../types/game';

export interface GameStats {
    damageMult: number;
    fireRateMult: number;
    speedMult: number;
    projectileCountBonus: number;
    armor: number;
    lifesteal: number;
    criticalChance: number;
    pickupRadius: number;
    xpGainMult: number;
    maxHealthBonus: number;
    projectileSizeMult: number;
    projectileSpeedMult: number;
    visionRadius: number;
    discoveryRadius: number;
}

const DEFAULT_STATS: GameStats = {
    damageMult: 1,
    fireRateMult: 1,
    speedMult: 1,
    projectileCountBonus: 0,
    armor: 0,
    lifesteal: 0,
    criticalChance: 0,
    pickupRadius: 0,
    xpGainMult: 1,
    maxHealthBonus: 0,
    projectileSizeMult: 0,
    projectileSpeedMult: 0,
    visionRadius: 400,
    discoveryRadius: 450,
};

export const useGameStore = defineStore('game', {
    state: () => ({
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        race: 'HUMANS' as RaceType,
        currentStageIndex: 0,
        kills: 0,
        time: 0,
        credits: 0,
        minerals: 0,
        gas: 0,
        activeWeaponId: 'gauss_rifle' as WeaponId,
        isGameOver: false,
        isPaused: false,
        showUpgradeOverlay: false,
        showSpecializationChoice: false,
        unlockedWeapons: ['gauss_rifle'] as WeaponId[],
        baseStats: { ...DEFAULT_STATS },
    }),
    getters: {
        currentStage(): EvolutionStage {
            return HUMAN_CONFIG.stages[this.currentStageIndex];
        },
        xpPercentage(): number {
            return (this.xp / this.nextLevelXp) * 100;
        },
    },
    actions: {
        addXp(amount: number) {
            this.xp += amount * this.baseStats.xpGainMult;
            while (this.xp >= this.nextLevelXp) {
                this.levelUp();
                if (this.showUpgradeOverlay) break;
            }
        },
        levelUp() {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.2);

            const nextStage = HUMAN_CONFIG.stages[this.currentStageIndex + 1];
            if (nextStage && this.level >= nextStage.level) {
                this.currentStageIndex++;
            }

            this.showUpgradeOverlay = true;
            this.isPaused = true;
        },
        closeUpgradeOverlay() {
            this.showUpgradeOverlay = false;
            this.isPaused = false;
        },
        unlockWeapon(weaponId: WeaponId) {
            if (!this.unlockedWeapons.includes(weaponId)) {
                this.unlockedWeapons.push(weaponId);
            }
            const engine = (window as any).gameEngine;
            engine?.weaponSystem.addOrUpgrade(weaponId);
        },
        setActiveWeapon(weaponId: WeaponId) {
            if (this.unlockedWeapons.includes(weaponId) && weaponId !== 'orbital_laser') {
                this.activeWeaponId = weaponId;
            }
        },
        addMinerals(amount: number) {
            this.minerals += amount;
        },
        addGas(amount: number) {
            this.gas += amount;
        },
        addCredits(amount: number) {
            this.credits += amount;
        },
        heal(amount: number) {
            const engine = (window as any).gameEngine;
            if (!engine?.player) return;
            engine.player.currentHealth = Math.min(engine.player.maxHealth, engine.player.currentHealth + amount);
        },
        endRun() {
            this.addCredits(Math.max(1, Math.floor(this.kills * 0.5 + this.level * 5 + this.time * 0.1)));
            this.isGameOver = true;
        },
        resetRunState() {
            this.level = 1;
            this.xp = 0;
            this.nextLevelXp = 100;
            this.currentStageIndex = 0;
            this.kills = 0;
            this.time = 0;
            this.credits = 0;
            this.minerals = 0;
            this.gas = 0;
            this.activeWeaponId = 'gauss_rifle';
            this.isGameOver = false;
            this.isPaused = false;
            this.showUpgradeOverlay = false;
            this.showSpecializationChoice = false;
            this.unlockedWeapons = ['gauss_rifle'];
            this.baseStats = { ...DEFAULT_STATS };
        },
    },
});
