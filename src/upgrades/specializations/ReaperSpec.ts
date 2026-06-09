import type { SpecializationDef } from '../types'

export const REAPER_SPEC: SpecializationDef = {
  id: 'reaper',
  name: 'Reaper',
  description: 'Expert in high-speed hit-and-run tactics. Bonus movement speed and close-range damage.',
  requiredLevel: 10,
  nodes: [
    {
      id: 'reaper_speed',
      name: 'Hydraulic Actuators',
      description: 'Permanent movement speed increase.',
      requiredLevel: 10,
      effects: [
        { type: 'stat', stat: 'speedMult', value: 0.2, mode: 'mult' },
      ],
    },
    {
      id: 'reaper_close_quarters',
      name: 'Close Quarters Training',
      description: 'Increased damage when enemies are within 150px.',
      requiredLevel: 12,
      effects: [
        { type: 'stat', stat: 'damageMult', value: 0.25, mode: 'mult' },
      ],
    },
    {
      id: 'reaper_adrenaline',
      name: 'Combat Adrenaline',
      description: 'Each kill increases attack speed by 2% for 5 seconds (stacks 5 times).',
      requiredLevel: 15,
      effects: [
        { type: 'stat', stat: 'fireRateMult', value: 0.15, mode: 'mult' },
      ],
    },
    {
      id: 'reaper_death_blossom',
      name: 'Death Blossom',
      description: 'Fire in all directions when health drops below 25%.',
      requiredLevel: 18,
      effects: [
        { type: 'stat', stat: 'projectileCountBonus', value: 4, mode: 'add' },
      ],
    },
  ],
}
