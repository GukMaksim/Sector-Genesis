import type { SpecializationDef } from '../types'

export const GHOST_SPEC: SpecializationDef = {
  id: 'ghost',
  name: 'Ghost',
  description: 'Covert operative specializing in critical damage and tactical strikes.',
  requiredLevel: 10,
  nodes: [
    {
      id: 'ghost_crit_mastery',
      name: 'Crit Mastery',
      description: 'Massive critical damage and chance increase.',
      requiredLevel: 10,
      effects: [
        { type: 'stat', stat: 'criticalChance', value: 0.1, mode: 'add' },
      ],
    },
    {
      id: 'ghost_cloak',
      name: 'Personal Cloak',
      description: 'After not attacking for 2 seconds, become invisible. Next attack deals 300% damage.',
      requiredLevel: 12,
      effects: [
        { type: 'stat', stat: 'damageMult', value: 0.2, mode: 'mult' },
      ],
    },
    {
      id: 'ghost_sniper',
      name: 'Sniper Protocol',
      description: 'Projectiles travel faster and deal extra damage to distant enemies.',
      requiredLevel: 15,
      effects: [
        { type: 'stat', stat: 'projectileSpeedMult', value: 0.5, mode: 'mult' },
        { type: 'stat', stat: 'damageMult', value: 0.15, mode: 'mult' },
      ],
    },
    {
      id: 'ghost_lock_on',
      name: 'Lock-On',
      description: 'Attacks automatically target the weakest enemy on screen.',
      requiredLevel: 18,
      effects: [
        { type: 'stat', stat: 'criticalChance', value: 0.15, mode: 'add' },
      ],
    },
  ],
}
