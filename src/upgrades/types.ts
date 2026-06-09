export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export type BehaviorId = 'ricochet' | 'stim_pack' | 'chain_lightning'

export type UpgradeTag =
  | 'damage'
  | 'fire-rate'
  | 'crit'
  | 'ricochet'
  | 'stim'
  | 'defense'
  | 'heal'
  | 'utility'
  | 'xp'
  | 'weapon'

export interface UpgradeEffectStat {
  type: 'stat'
  stat: string
  value: number
  mode: 'add' | 'mult'
  perLevel?: number
  condition?: string
}

export interface UpgradeEffectBehavior {
  type: 'behavior'
  behaviorId: BehaviorId
  params: Record<string, number>
}

export interface UpgradeEffectWeaponMod {
  type: 'weapon_mod'
  weaponId: string
  stat: string
  value: number
  mode: 'add' | 'mult'
}

export type UpgradeEffect = UpgradeEffectStat | UpgradeEffectBehavior | UpgradeEffectWeaponMod

export interface UpgradeDef {
  id: string
  name: string
  description: string
  icon: string
  rarity: Rarity
  maxLevel: number
  tags: UpgradeTag[]
  effects: UpgradeEffect[]
  weight?: number
  prerequisites?: { upgradeId: string; minLevel: number }[]
  conflicts?: string[]
  grantsWeapon?: string
  evolution?: {
    combineWith: string[]
    resultId: string
  }
}

export interface UpgradeInstance {
  defId: string
  level: number
}

export interface EvolutionDef {
  id: string
  name: string
  description: string
  icon: string
  requirements: { upgradeId: string; requiredLevel: number }[]
  removesUpgrades: string[]
  grantsUpgrades: string[]
  grantsWeapon?: string
}

export interface MetaUpgradeDef {
  id: string
  name: string
  description: string
  category: 'economy' | 'combat' | 'utility' | 'unlock'
  maxLevel: number
  baseCost: number
  costMultiplier: number
  currency: 'credits' | 'minerals' | 'gas'
  effect: UpgradeEffect
}

export interface SpecializationNode {
  id: string
  name: string
  description: string
  requiredLevel: number
  effects: UpgradeEffect[]
  children?: string[]
}

export interface SpecializationDef {
  id: string
  name: string
  description: string
  requiredLevel: number
  nodes: SpecializationNode[]
}

export interface ComputedStats {
  damageMult: number
  fireRateMult: number
  speedMult: number
  projectileCountBonus: number
  armor: number
  lifesteal: number
  criticalChance: number
  pickupRadius: number
  xpGainMult: number
  maxHealthBonus: number
  projectileSizeMult: number
  projectileSpeedMult: number
  visionRadius: number
  discoveryRadius: number
}

export const DEFAULT_COMPUTED_STATS: ComputedStats = {
  damageMult: 1,
  fireRateMult: 1,
  speedMult: 1,
  projectileCountBonus: 0,
  armor: 0,
  lifesteal: 0,
  criticalChance: 0,
  pickupRadius: 0,
  xpGainMult: 1,
  maxHealthBonus: 0,
  projectileSizeMult: 0,
  projectileSpeedMult: 0,
  visionRadius: 400,
  discoveryRadius: 450,
}

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 55,
  uncommon: 28,
  rare: 13,
  legendary: 4,
}

export interface ActiveBehavior {
  behaviorId: string
  params: Record<string, number>
  level: number
}

export interface WeaponMod {
  weaponId: string
  stat: string
  value: number
  mode: 'add' | 'mult'
  level: number
}

export interface UpgradeContext {
  level: number
  activeUpgrades: Map<string, UpgradeInstance>
  specializationId: string | null
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9d9d9d',
  uncommon: '#1eff00',
  rare: '#0070dd',
  legendary: '#a335ee',
}
