import { defineStore } from 'pinia';
import { HUMAN_CONFIG } from '../config/human.config';
import { SKILL_TREE_CONFIG } from '../config/skillTree.config';
import type {
    EvolutionStage,
    RaceType,
    SkillEffect,
    SkillTreeBranchState,
    SkillTreeNodeConfig,
    StatKey,
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

const flattenSkillTree = () => SKILL_TREE_CONFIG.flatMap((branch) => branch.nodes);

const isNodeUnlockable = (
    unlockedSkillNodes: Record<string, number>,
    minerals: number,
    gas: number,
    node: SkillTreeNodeConfig,
) => {
    const rank = unlockedSkillNodes[node.id] ?? 0;
    const prerequisitesMet = node.prerequisites?.every((prerequisite) => (unlockedSkillNodes[prerequisite] ?? 0) > 0) ?? true;
    return minerals >= node.mineralCost && gas >= node.gasCost && rank < node.maxRank && prerequisitesMet;
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
        skillPoints: 0,
        minerals: 0,
        gas: 0,
        activeWeaponId: 'gauss_rifle' as WeaponId,
        isGameOver: false,
        isPaused: false,
        showUpgradeOverlay: false,
        unlockedSkillNodes: {} as Record<string, number>,
        unlockedWeapons: ['gauss_rifle'] as WeaponId[],
        stats: { ...DEFAULT_STATS },
    }),
    getters: {
        currentStage(): EvolutionStage {
            return HUMAN_CONFIG.stages[this.currentStageIndex];
        },
        xpPercentage(): number {
            return (this.xp / this.nextLevelXp) * 100;
        },
        skillTreeBranches(): SkillTreeBranchState[] {
            return SKILL_TREE_CONFIG.map((branch) => ({
                ...branch,
                nodes: branch.nodes.map((node) => {
                    const rank = this.unlockedSkillNodes[node.id] ?? 0;
                    const prerequisitesMet = node.prerequisites?.every((prerequisite) => (this.unlockedSkillNodes[prerequisite] ?? 0) > 0) ?? true;
                    const locked = !prerequisitesMet;
                    const available = prerequisitesMet && rank < node.maxRank && this.minerals >= node.mineralCost && this.gas >= node.gasCost;

                    return {
                        ...node,
                        rank,
                        unlocked: rank > 0,
                        available,
                        locked,
                    };
                }),
            }));
        },
        equippedWeaponNames(): string[] {
            return this.unlockedWeapons.map((weaponId) => {
                switch (weaponId) {
                    case 'gauss_rifle':
                        return 'Gauss Rifle';
                    case 'minigun':
                        return 'Minigun';
                    case 'rocket_launcher':
                        return 'Rocket Launcher';
                    case 'plasma_cannon':
                        return 'Plasma Cannon';
                    case 'orbital_laser':
                        return 'Orbital Laser';
                    default:
                        return weaponId;
                }
            });
        },
        availableSkillNodes(): SkillTreeNodeConfig[] {
            return flattenSkillTree().filter((node) => isNodeUnlockable(this.unlockedSkillNodes, this.minerals, this.gas, node));
        },
    },
    actions: {
        addXp(amount: number) {
            this.xp += amount * this.stats.xpGainMult;
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
        },
        closeUpgradeOverlay() {
            this.showUpgradeOverlay = false;
            this.isPaused = false;
        },
        canUnlockNode(node: SkillTreeNodeConfig) {
            return isNodeUnlockable(this.unlockedSkillNodes, this.minerals, this.gas, node);
        },
        unlockSkillNode(nodeId: string) {
            const node = flattenSkillTree().find((candidate) => candidate.id === nodeId);
            if (!node || !this.canUnlockNode(node)) {
                return false;
            }

            this.minerals -= node.mineralCost;
            this.gas -= node.gasCost;
            this.unlockedSkillNodes[node.id] = (this.unlockedSkillNodes[node.id] ?? 0) + 1;

            for (const effect of node.effects) {
                this.applySkillEffect(effect);
            }

            return true;
        },
        applySkillEffect(effect: SkillEffect) {
            switch (effect.type) {
                case 'stat':
                    this.applyStatEffect(effect.stat, effect.value, effect.mode ?? 'add');
                    break;
                case 'weapon_unlock':
                    this.unlockWeapon(effect.weaponId);
                    break;
                case 'weapon_rank':
                    this.upgradeWeapon(effect.weaponId, effect.value);
                    break;
                case 'health_burst':
                    this.heal(effect.value);
                    break;
            }
        },
        applyStatEffect(stat: StatKey, value: number, mode: 'add' | 'mult') {
            if (mode === 'mult') {
                const current = this.stats[stat];
                this.stats[stat] = stat === 'xpGainMult' ? current + value : current + value;
                return;
            }

            this.stats[stat] += value;
        },
        unlockWeapon(weaponId: WeaponId) {
            if (!this.unlockedWeapons.includes(weaponId)) {
                this.unlockedWeapons.push(weaponId);
            }

            const engine = (window as any).gameEngine;
            engine?.weaponSystem.addOrUpgrade(weaponId);
        },
        upgradeWeapon(weaponId: WeaponId, value: number) {
            const engine = (window as any).gameEngine;
            for (let index = 0; index < value; index++) {
                engine?.weaponSystem.addOrUpgrade(weaponId);
            }
            if (!this.unlockedWeapons.includes(weaponId)) {
                this.unlockedWeapons.push(weaponId);
            }
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
        heal(amount: number) {
            const engine = (window as any).gameEngine;
            if (!engine?.player) {
                return;
            }

            engine.player.currentHealth = Math.min(engine.player.maxHealth, engine.player.currentHealth + amount);
        },
        resetRunState() {
            this.level = 1;
            this.xp = 0;
            this.nextLevelXp = 100;
            this.currentStageIndex = 0;
            this.kills = 0;
            this.time = 0;
            this.credits = 0;
            this.skillPoints = 0;
            this.minerals = 0;
            this.gas = 0;
            this.activeWeaponId = 'gauss_rifle';
            this.isGameOver = false;
            this.isPaused = false;
            this.showUpgradeOverlay = false;
            this.unlockedSkillNodes = {};
            this.unlockedWeapons = ['gauss_rifle'];
            this.stats = { ...DEFAULT_STATS };
        },
    },
});
