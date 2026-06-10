import type { UpgradeDef } from '../types'

export const EVOLUTION_UPGRADES: UpgradeDef[] = [
  {
    id: 'crit_overdrive',
    name: 'Crit Overdrive',
    description: 'Every shot is a guaranteed critical hit. Damage is multiplied by 2.5x.',
    icon: '⚡',
    rarity: 'legendary',
    maxLevel: 1,
    tags: ['damage', 'crit'],
    effects: [
      { type: 'stat', stat: 'criticalChance', value: 1.0, mode: 'add' },
      { type: 'stat', stat: 'damageMult', value: 0.5, mode: 'mult' },
    ],
  },
  {
    id: 'fortification_matrix',
    name: 'Fortification Matrix',
    description: 'Integrated armor matrix provides permanent damage reduction. +50% max health, +10 armor.',
    icon: '🛡️',
    rarity: 'legendary',
    maxLevel: 3,
    tags: ['defense'],
    effects: [
      { type: 'stat', stat: 'maxHealthBonus', value: 0.5, mode: 'mult', perLevel: 0.15 },
      { type: 'stat', stat: 'armor', value: 10, mode: 'add', perLevel: 3 },
    ],
  },
  {
    id: 'berserker_strain',
    name: 'Berserker Strain',
    description: 'Permanent combat stim: +40% speed, +40% fire rate, 15% lifesteal.',
    icon: '💉',
    rarity: 'legendary',
    maxLevel: 3,
    tags: ['stim', 'damage', 'utility'],
    effects: [
      { type: 'stat', stat: 'speedMult', value: 0.4, mode: 'mult', perLevel: 0.1 },
      { type: 'stat', stat: 'fireRateMult', value: 0.4, mode: 'mult', perLevel: 0.1 },
      { type: 'stat', stat: 'lifesteal', value: 0.15, mode: 'add', perLevel: 0.05 },
    ],
  },
  {
    id: 'gauss_cannon',
    name: 'Gauss Cannon',
    description: 'Overcharged gauss rifle fires devastating piercing shots. +80% damage, projectiles pierce all enemies.',
    icon: '🔫',
    rarity: 'legendary',
    maxLevel: 3,
    tags: ['damage', 'weapon'],
    effects: [
      { type: 'stat', stat: 'damageMult', value: 0.8, mode: 'mult', perLevel: 0.2 },
      { type: 'weapon_mod', weaponId: 'gauss_rifle', stat: 'pierce', value: 1, mode: 'add' },
    ],
  },
]
