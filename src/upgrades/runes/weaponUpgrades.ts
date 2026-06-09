import type { UpgradeDef } from '../types'

const weaponUnlock = (id: string, name: string, icon: string, rarity: 'rare' | 'legendary', prereq?: string): UpgradeDef => ({
  id: `req_${id}`,
  name: `Requisition: ${name}`,
  description: `Call in an airdrop of the ${name}. Unlocks this weapon for the rest of the run.`,
  icon,
  rarity,
  maxLevel: 1,
  tags: ['weapon'],
  effects: [],
  grantsWeapon: id,
  prerequisites: prereq ? [{ upgradeId: prereq, minLevel: 1 }] : undefined,
})

export const WEAPON_UPGRADES: UpgradeDef[] = [
  weaponUnlock('minigun', 'Minigun', '🌀', 'rare', 'gauss_mastery'),
  weaponUnlock('rocket_launcher', 'Rocket Launcher', '🚀', 'rare', 'minigun_mastery'),
  weaponUnlock('plasma_cannon', 'Plasma Cannon', '💥', 'legendary', 'rocket_mastery'),
  weaponUnlock('orbital_laser', 'Orbital Laser', '⚡', 'legendary', 'plasma_mastery'),
  {
    id: 'gauss_mastery',
    name: 'Gauss Mastery',
    description: 'Master the standard Gauss Rifle. Increases damage and fire rate.',
    icon: '🔫',
    rarity: 'uncommon',
    maxLevel: 10,
    tags: ['weapon', 'damage'],
    effects: [
      { type: 'weapon_mod', weaponId: 'gauss_rifle', stat: 'damage', value: 0.1, mode: 'mult' },
      { type: 'weapon_mod', weaponId: 'gauss_rifle', stat: 'fireRate', value: 0.08, mode: 'mult' },
    ],
    evolution: {
      combineWith: ['stim_pack'],
      resultId: 'flamethrower_evolution',
    },
  },
  {
    id: 'minigun_mastery',
    name: 'Minigun Mastery',
    description: 'Master the Minigun. Increases burst count and reduces spread.',
    icon: '🔫',
    rarity: 'uncommon',
    maxLevel: 10,
    tags: ['weapon', 'damage'],
    effects: [
      { type: 'weapon_mod', weaponId: 'minigun', stat: 'damage', value: 0.08, mode: 'mult' },
      { type: 'weapon_mod', weaponId: 'minigun', stat: 'projectileCount', value: 1, mode: 'add' },
    ],
  },
  {
    id: 'rocket_mastery',
    name: 'Rocket Mastery',
    description: 'Master the Rocket Launcher. Increases splash radius and damage.',
    icon: '🚀',
    rarity: 'rare',
    maxLevel: 8,
    tags: ['weapon', 'damage'],
    effects: [
      { type: 'weapon_mod', weaponId: 'rocket_launcher', stat: 'damage', value: 0.12, mode: 'mult' },
      { type: 'weapon_mod', weaponId: 'rocket_launcher', stat: 'splashRadius', value: 0.1, mode: 'mult' },
    ],
  },
  {
    id: 'plasma_mastery',
    name: 'Plasma Mastery',
    description: 'Master the Plasma Cannon. Increases projectile size and damage.',
    icon: '🔮',
    rarity: 'rare',
    maxLevel: 8,
    tags: ['weapon', 'damage'],
    effects: [
      { type: 'weapon_mod', weaponId: 'plasma_cannon', stat: 'damage', value: 0.15, mode: 'mult' },
      { type: 'weapon_mod', weaponId: 'plasma_cannon', stat: 'splashRadius', value: 0.12, mode: 'mult' },
    ],
  },
]
