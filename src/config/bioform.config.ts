import type { RaceConfig } from '../types/game';

export const BIOFORM_CONFIG: RaceConfig = {
    type: 'BIOFORMS',
    stages: [
        {
            level: 1,
            name: 'Zerg Larva',
            weaponType: 'CLAW',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 120,
                projectileCount: 1
            }
        },
        {
            level: 5,
            name: 'Zergling',
            weaponType: 'CLAW',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 120,
                projectileCount: 1
            }
        },
        {
            level: 10,
            name: 'Hydralisk',
            weaponType: 'CLAW',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 120,
                projectileCount: 1
            }
        },
        {
            level: 15,
            name: 'Ultralisk',
            weaponType: 'CLAW',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 120,
                projectileCount: 1
            }
        },
        {
            level: 20,
            name: 'Brood Lord',
            weaponType: 'CLAW',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 120,
                projectileCount: 1
            }
        }
    ]
};
