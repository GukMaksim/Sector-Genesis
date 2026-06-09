import type { UpgradeDef } from '../types'

export const UTILITY_UPGRADES: UpgradeDef[] = [
  {
    id: 'stim_pack',
    name: 'Stim Pack',
    description: 'Tactical stimulant injects on kill streaks. Boosts speed and damage temporarily.',
    icon: '💉',
    rarity: 'uncommon',
    maxLevel: 8,
    tags: ['stim', 'utility'],
    effects: [
      {
        type: 'behavior',
        behaviorId: 'stim_pack',
        params: { triggerOnKills: 10, duration: 3, speedBonus: 0.5, damageBonus: 0.25 },
      },
    ],
  },
  {
    id: 'combat_shield',
    name: 'Combat Shield',
    description: 'Personal shield generator provides additional armor protection.',
    icon: '🛡️',
    rarity: 'common',
    maxLevel: 10,
    tags: ['defense'],
    effects: [
      { type: 'stat', stat: 'armor', value: 1, mode: 'add', perLevel: 1 },
    ],
  },
  {
    id: 'neosteel_plating',
    name: 'Neosteel Plating',
    description: 'Reinforced armor increases maximum health.',
    icon: '❤️',
    rarity: 'common',
    maxLevel: 10,
    tags: ['defense'],
    effects: [
      { type: 'stat', stat: 'maxHealthBonus', value: 0.1, mode: 'mult', perLevel: 0.03 },
    ],
  },
  {
    id: 'field_medic',
    name: 'Field Medic',
    description: 'Regenerative nanites slowly restore health over time.',
    icon: '🩹',
    rarity: 'uncommon',
    maxLevel: 5,
    tags: ['heal'],
    effects: [
      { type: 'stat', stat: 'lifesteal', value: 0.02, mode: 'add', perLevel: 0.02 },
    ],
  },
  {
    id: 'sensor_drone',
    name: 'Sensor Drone',
    description: 'Deployed drones increase pickup radius and XP gain.',
    icon: '📡',
    rarity: 'common',
    maxLevel: 8,
    tags: ['utility', 'xp'],
    effects: [
      { type: 'stat', stat: 'pickupRadius', value: 15, mode: 'add', perLevel: 5 },
      { type: 'stat', stat: 'xpGainMult', value: 0.05, mode: 'mult', perLevel: 0.02 },
    ],
  },
  {
    id: 'tactical_retreat',
    name: 'Tactical Retreat',
    description: 'Move speed enhanced for superior battlefield positioning.',
    icon: '👟',
    rarity: 'common',
    maxLevel: 8,
    tags: ['utility'],
    effects: [
      { type: 'stat', stat: 'speedMult', value: 0.08, mode: 'mult', perLevel: 0.025 },
    ],
  },
  {
    id: 'adrenaline_rush',
    name: 'Adrenaline Rush',
    description: 'Each kill temporarily boosts movement and attack speed.',
    icon: '💨',
    rarity: 'rare',
    maxLevel: 5,
    tags: ['stim', 'utility'],
    effects: [
      { type: 'stat', stat: 'speedMult', value: 0.05, mode: 'mult', perLevel: 0.02 },
      { type: 'stat', stat: 'fireRateMult', value: 0.05, mode: 'mult', perLevel: 0.02 },
    ],
  },
  {
    id: 'shield_capacitor',
    name: 'Shield Capacitor',
    description: 'Increases maximum health and reduces damage taken.',

    icon: '🔋',
    rarity: 'uncommon',
    maxLevel: 6,
    tags: ['defense'],
    effects: [
      { type: 'stat', stat: 'maxHealthBonus', value: 0.08, mode: 'mult', perLevel: 0.04 },
      { type: 'stat', stat: 'armor', value: 1, mode: 'add', perLevel: 1 },
    ],
  },
]
