import type { UpgradeDef } from '../types'

export const BIOFORM_UPGRADES: UpgradeDef[] = [
  {
    id: 'bio_regen',
    name: 'Rapid Regeneration',
    description: 'Bioform tissues knit at incredible speed, restoring health over time.',
    icon: '❤️‍🩹',
    rarity: 'uncommon',
    maxLevel: 5,
    tags: ['heal', 'defense'],
    effects: [
      { type: 'stat', stat: 'lifesteal', value: 2, mode: 'add', perLevel: 0.5 },
    ],
  },
  {
    id: 'bio_acid',
    name: 'Acidic Saliva',
    description: 'Attacks corrode enemy armor, dealing bonus damage over time.',
    icon: '🧪',
    rarity: 'uncommon',
    maxLevel: 5,
    tags: ['damage'],
    effects: [
      { type: 'stat', stat: 'damageMult', value: 0.1, mode: 'mult', perLevel: 0.04 },
    ],
  },
  {
    id: 'bio_spore',
    name: 'Spore Burst',
    description: 'Defeated enemies release a cloud of caustic spores, damaging nearby foes.',
    icon: '☁️',
    rarity: 'rare',
    maxLevel: 3,
    tags: ['damage'],
    effects: [
      { type: 'stat', stat: 'damageMult', value: 0.05, mode: 'mult', perLevel: 0.05 },
    ],
  },
  {
    id: 'bio_carapace',
    name: 'Chitin Carapace',
    description: 'Thick organic armor plating reduces incoming damage and increases vitality.',
    icon: '🛡️',
    rarity: 'common',
    maxLevel: 10,
    tags: ['defense'],
    effects: [
      { type: 'stat', stat: 'armor', value: 2, mode: 'add', perLevel: 1 },
      { type: 'stat', stat: 'maxHealthBonus', value: 10, mode: 'add', perLevel: 5 },
    ],
  },
  {
    id: 'bio_swarm',
    name: 'Swarm Frenzy',
    description: 'The swarm grows stronger with numbers — bonus speed and damage per nearby enemy.',
    icon: '🐜',
    rarity: 'rare',
    maxLevel: 3,
    tags: ['damage', 'utility'],
    effects: [
      { type: 'stat', stat: 'speedMult', value: 0.08, mode: 'mult', perLevel: 0.04 },
      { type: 'stat', stat: 'damageMult', value: 0.08, mode: 'mult', perLevel: 0.04 },
    ],
  },
]
