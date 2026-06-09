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
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 100,
                projectileCount: 1
            }
        },
        {
            level: 10,
            name: 'Heavy Trooper',
            weaponType: 'DUAL_RIFLES',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 100,
                projectileCount: 1
            }
        },
        {
            level: 15,
            name: 'Siege Commander',
            weaponType: 'EXPLOSIVE_RIFLE',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 100,
                projectileCount: 1
            }
        },
        {
            level: 20,
            name: 'Dominion General',
            weaponType: 'PLASMA_CANNON',
            statModifiers: {
                damage: 1,
                fireRate: 1,
                speed: 1,
                health: 100,
                projectileCount: 1
            }
        }
    ]
};
