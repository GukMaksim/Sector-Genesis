import type { EvolutionDef } from '../types'

export const EVOLUTION_DEFS: EvolutionDef[] = [
  {
    id: 'overcharge_evolution',
    name: 'Overcharge Protocol',
    description: 'Overclock + Targeting Array merge into guaranteed critical hits. Every shot deals double damage at 100% crit chance.',
    icon: '⚡',
    requirements: [
      { upgradeId: 'overclock', requiredLevel: 10 },
      { upgradeId: 'targeting_array', requiredLevel: 8 },
    ],
    removesUpgrades: ['overclock', 'targeting_array'],
    grantsUpgrades: ['crit_overdrive'],
  },
  {
    id: 'fortification_evolution',
    name: 'Fortification Matrix',
    description: 'Combat Shield + Neosteel Plating merge. Gain permanent damage resistance and massive health bonus.',
    icon: '🛡️',
    requirements: [
      { upgradeId: 'combat_shield', requiredLevel: 10 },
      { upgradeId: 'neosteel_plating', requiredLevel: 10 },
    ],
    removesUpgrades: ['combat_shield', 'neosteel_plating'],
    grantsUpgrades: ['fortification_matrix'],
  },
  {
    id: 'berserker_evolution',
    name: 'Berserker Strain',
    description: 'Stim Pack + Tactical Retreat + Adrenaline Rush merge into permanent combat stim. Move faster, shoot faster, lifesteal with every hit.',
    icon: '💉',
    requirements: [
      { upgradeId: 'stim_pack', requiredLevel: 8 },
      { upgradeId: 'tactical_retreat', requiredLevel: 8 },
      { upgradeId: 'adrenaline_rush', requiredLevel: 5 },
    ],
    removesUpgrades: ['stim_pack', 'tactical_retreat', 'adrenaline_rush'],
    grantsUpgrades: ['berserker_strain'],
  },
  {
    id: 'gauss_cannon_evolution',
    name: 'Gauss Cannon',
    description: 'Gauss Mastery + Penetrator Rounds merge. The gauss rifle becomes a devastating rail cannon with massive piercing damage.',
    icon: '🔫',
    requirements: [
      { upgradeId: 'gauss_mastery', requiredLevel: 8 },
      { upgradeId: 'penetrator_rounds', requiredLevel: 5 },
    ],
    removesUpgrades: ['gauss_mastery', 'penetrator_rounds'],
    grantsUpgrades: ['gauss_cannon'],
  },
]
