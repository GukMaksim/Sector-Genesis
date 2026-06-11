import type { SpecializationDef } from '../types'

export const INFESTOR_SPEC: SpecializationDef = {
  id: 'infestor',
  name: 'Infestor',
  description: 'Master of plague and control. Poisons enemies from within and bends their will to the swarm.',
  requiredLevel: 10,
  nodes: [
    {
      id: 'infestor_venom',
      name: 'Neural Venom',
      description: 'Attacks have a 30% chance to poison enemies, dealing 50% of damage over 3 seconds.',
      requiredLevel: 10,
      effects: [
        { type: 'stat', stat: 'damageMult', value: 0.2, mode: 'mult' },
      ],
    },
    {
      id: 'infestor_slow',
      name: 'Paralytic Spores',
      description: 'Attacks slow enemies by 25% for 2 seconds.',
      requiredLevel: 12,
      effects: [
        { type: 'stat', stat: 'criticalChance', value: 0.1, mode: 'add' },
      ],
    },
    {
      id: 'infestor_mind_control',
      name: 'Neural Parasite',
      description: 'Every 15 seconds, the next hit dominates the enemy, causing it to fight for the swarm for 3 seconds.',
      requiredLevel: 15,
      effects: [
        { type: 'stat', stat: 'damageMult', value: 0.3, mode: 'mult' },
      ],
    },
    {
      id: 'infestor_plague_burst',
      name: 'Plague Burst',
      description: 'When an enemy dies, it releases a plague cloud dealing 100% of its max HP as damage to nearby enemies.',
      requiredLevel: 18,
      effects: [
        { type: 'stat', stat: 'projectileSizeMult', value: 0.5, mode: 'add' },
      ],
    },
  ],
}
