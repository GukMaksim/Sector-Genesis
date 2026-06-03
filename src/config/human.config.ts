import type { RaceConfig } from '../types/game';

export const HUMAN_CONFIG: RaceConfig = {
    type: 'HUMANS',
    stages: [
        {
            level: 1,
            name: 'Marine Recruit',
            weaponType: 'RIFLE',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 100,
                projectileCount: 1
            }
        },
        {
            level: 5,
            name: 'Marine Veteran',
            weaponType: 'RIFLE',
            statModifiers: {
                damage: 1.2,
                fireRate: 1.5,
                speed: 1.1,
                health: 150,
                projectileCount: 1
            }
        },
        {
            level: 10,
            name: 'Heavy Trooper',
            weaponType: 'DUAL_RIFLES',
            statModifiers: {
                damage: 1.5,
                fireRate: 2,
                speed: 0.9,
                health: 250,
                projectileCount: 2
            }
        },
        {
            level: 15,
            name: 'Siege Commander',
            weaponType: 'EXPLOSIVE_RIFLE',
            statModifiers: {
                damage: 2.5,
                fireRate: 1.2,
                speed: 0.8,
                health: 400,
                projectileCount: 1
            }
        },
        {
            level: 20,
            name: 'Dominion General',
            weaponType: 'PLASMA_CANNON',
            statModifiers: {
                damage: 5,
                fireRate: 3,
                speed: 1.2,
                health: 1000,
                projectileCount: 3
            }
        }
    ]
};
