export type RaceType = 'HUMANS' | 'PSIONICS' | 'BIOFORMS';
export type WeaponId = 'gauss_rifle' | 'minigun' | 'rocket_launcher' | 'plasma_cannon' | 'orbital_laser';
export type SkillBranchId = 'command' | 'arsenal' | 'engineering' | 'mobility';
export type StatKey =
    | 'damageMult'
    | 'fireRateMult'
    | 'speedMult'
    | 'projectileCountBonus'
    | 'armor'
    | 'lifesteal'
    | 'criticalChance'
    | 'pickupRadius'
    | 'xpGainMult'
    | 'maxHealthBonus'
    | 'projectileSizeMult'
    | 'projectileSpeedMult';

export interface EvolutionStage {
    level: number;
    name: string;
    weaponType: string;
    statModifiers: {
        damage?: number;
        fireRate?: number;
        speed?: number;
        health?: number;
        projectileCount?: number;
    };
    visualAsset?: string; // Placeholder for now
}

export interface RaceConfig {
    type: RaceType;
    stages: EvolutionStage[];
}

export interface SkillEffectStat {
    type: 'stat';
    stat: StatKey;
    value: number;
    mode?: 'add' | 'mult';
}

export interface SkillEffectWeaponUnlock {
    type: 'weapon_unlock';
    weaponId: WeaponId;
}

export interface SkillEffectWeaponRank {
    type: 'weapon_rank';
    weaponId: WeaponId;
    value: number;
}

export interface SkillEffectHealthBurst {
    type: 'health_burst';
    value: number;
}

export type SkillEffect =
    | SkillEffectStat
    | SkillEffectWeaponUnlock
    | SkillEffectWeaponRank
    | SkillEffectHealthBurst;

export interface SkillTreeNodeConfig {
    id: string;
    branch: SkillBranchId;
    name: string;
    description: string;
    cost: number;
    mineralCost: number;
    gasCost: number;
    maxRank: number;
    prerequisites?: string[];
    effects: SkillEffect[];
    tag?: string;
}

export interface SkillTreeBranchConfig {
    id: SkillBranchId;
    name: string;
    title: string;
    accent: string;
    nodes: SkillTreeNodeConfig[];
}

export interface SkillTreeNodeState extends SkillTreeNodeConfig {
    rank: number;
    unlocked: boolean;
    available: boolean;
    locked: boolean;
}

export interface SkillTreeBranchState extends SkillTreeBranchConfig {
    nodes: SkillTreeNodeState[];
}
