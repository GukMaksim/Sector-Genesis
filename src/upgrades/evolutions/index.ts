import type { EvolutionDef } from '../types'

export const EVOLUTION_DEFS: EvolutionDef[] = [
  {
    id: 'flamethrower_evolution',
    name: 'Pyromancer Assault',
    description: 'Gauss Mastery + Stim Pack mastery merge into a devastating Flamethrower. Continuous flame stream that ignites enemies.',
    icon: '🔥',
    requirements: [
      { upgradeId: 'gauss_mastery', requiredLevel: 10 },
      { upgradeId: 'stim_pack', requiredLevel: 10 },
    ],
    removesUpgrades: ['gauss_mastery', 'stim_pack'],
    grantsUpgrades: ['inferno_stream'],
    grantsWeapon: 'flamethrower',
  },
  {
    id: 'overcharge_evolution',
    name: 'Overcharge Protocol',
    description: 'Overclock + Targeting Array merge. Every shot is a critical hit with double damage.',
    icon: '⚡',
    requirements: [
      { upgradeId: 'overclock', requiredLevel: 10 },
      { upgradeId: 'targeting_array', requiredLevel: 8 },
    ],
    removesUpgrades: ['overclock', 'targeting_array'],
    grantsUpgrades: ['crit_overdrive'],
  },
]
