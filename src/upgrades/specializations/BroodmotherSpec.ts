import type { SpecializationDef } from '../types'

export const BROODMOTHER_SPEC: SpecializationDef = {
  id: 'broodmother',
  name: 'Broodmother',
  description: 'A massive tank that leads the swarm. Regenerates rapidly and shields nearby allies with living biomass.',
  requiredLevel: 10,
  nodes: [
    {
      id: 'broodmother_bulk',
      name: 'Hardened Carapace',
      description: 'Permanent health increase and damage resistance.',
      requiredLevel: 10,
      effects: [
        { type: 'stat', stat: 'maxHealthBonus', value: 40, mode: 'add' },
        { type: 'stat', stat: 'armor', value: 5, mode: 'add' },
      ],
    },
    {
      id: 'broodmother_regen_aura',
      name: 'Regeneration Aura',
      description: 'Restore 1% max health per second. Nearby allies recover half as much.',
      requiredLevel: 12,
      effects: [
        { type: 'stat', stat: 'lifesteal', value: 3, mode: 'add' },
      ],
    },
    {
      id: 'broodmother_biomass_shield',
      name: 'Biomass Shield',
      description: 'Every 10 seconds, gain a shield that absorbs 30% of incoming damage for 3 seconds.',
      requiredLevel: 15,
      effects: [
        { type: 'stat', stat: 'armor', value: 8, mode: 'add' },
      ],
    },
    {
      id: 'broodmother_swarm_heart',
      name: 'Swarm Heart',
      description: 'Each kill permanently increases max health by 1 (caps at 50).',
      requiredLevel: 18,
      effects: [
        { type: 'stat', stat: 'maxHealthBonus', value: 50, mode: 'add' },
      ],
    },
  ],
}
