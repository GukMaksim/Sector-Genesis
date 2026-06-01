export type RaceType = 'HUMANS' | 'PSIONICS' | 'BIOFORMS';

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
