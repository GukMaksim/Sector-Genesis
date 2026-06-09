import type { UpgradeDef } from '../types'

export const DAMAGE_UPGRADES: UpgradeDef[] = [
  {
    id: 'heavy_barrels',
    name: 'Heavy Barrels',
    description: 'Reinforced weapon barrels increase projectile damage.',
    icon: '⚡',
    rarity: 'common',
    maxLevel: 10,
    tags: ['damage'],
    effects: [
      { type: 'stat', stat: 'damageMult', value: 0.08, mode: 'mult', perLevel: 0.02 },
    ],
  },
  {
    id: 'overclock',
    name: 'Overclock',
    description: 'Push the weapon firing mechanism beyond safe limits.',
    icon: '🔥',
    rarity: 'common',
    maxLevel: 10,
    tags: ['fire-rate'],
    effects: [
      { type: 'stat', stat: 'fireRateMult', value: 0.1, mode: 'mult', perLevel: 0.03 },
    ],
  },
  {
    id: 'targeting_array',
    name: 'Targeting Array',
    description: 'Advanced targeting computers increase critical hit chance.',
    icon: '🎯',
    rarity: 'uncommon',
    maxLevel: 8,
    tags: ['crit'],
    effects: [
      { type: 'stat', stat: 'criticalChance', value: 0.03, mode: 'add', perLevel: 0.02 },
    ],
  },
  {
    id: 'ricochet_rounds',
    name: 'Ricochet Rounds',
    description: 'Bullets bounce to additional targets after the first hit.',
    icon: '🔄',
    rarity: 'rare',
    maxLevel: 5,
    tags: ['ricochet'],
    effects: [
      {
        type: 'behavior',
        behaviorId: 'ricochet',
        params: { maxBounces: 1, damageFalloff: 0.3, searchRadius: 200 },
      },
    ],
    conflicts: ['chain_lightning'],
  },
  {
    id: 'explosive_impact',
    name: 'Explosive Impact',
    description: 'Projectiles explode on impact, dealing area damage.',
    icon: '💥',
    rarity: 'rare',
    maxLevel: 5,
    tags: ['damage'],
    effects: [
      { type: 'stat', stat: 'damageMult', value: 0.15, mode: 'mult', perLevel: 0.05 },
    ],
  },
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Electrical discharge arcs between nearby enemies.',
    icon: '⚡',
    rarity: 'legendary',
    maxLevel: 5,
    tags: ['damage'],
    effects: [
      {
        type: 'behavior',
        behaviorId: 'chain_lightning',
        params: { maxTargets: 2, damagePercent: 0.5, chainRadius: 150 },
      },
    ],
    conflicts: ['ricochet_rounds'],
  },
  {
    id: 'fragmentation',
    name: 'Fragmentation Rounds',
    description: 'Projectiles split into smaller fragments on hit.',
    icon: '💫',
    rarity: 'legendary',
    maxLevel: 3,
    tags: ['damage', 'weapon'],
    effects: [
      { type: 'stat', stat: 'projectileCountBonus', value: 1, mode: 'add', perLevel: 1 },
      { type: 'stat', stat: 'damageMult', value: -0.15, mode: 'mult' },
    ],
  },
  {
    id: 'penetrator_rounds',
    name: 'Penetrator Rounds',
    description: 'Bullets pierce through enemies, hitting multiple targets.',
    icon: '🔱',
    rarity: 'uncommon',
    maxLevel: 5,
    tags: ['damage'],
    effects: [
      { type: 'stat', stat: 'damageMult', value: 0.12, mode: 'mult', perLevel: 0.04 },
    ],
  },
]
