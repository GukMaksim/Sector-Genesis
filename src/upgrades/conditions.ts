import type { UpgradeDef, UpgradeInstance, Rarity } from './types'
import { RARITY_WEIGHTS } from './types'

export interface UpgradeContext {
  level: number
  activeUpgrades: Map<string, UpgradeInstance>
  specializationId: string | null
}

export function pickRarity(): Rarity {
  const roll = Math.random() * 100
  let cumulative = 0
  const entries = Object.entries(RARITY_WEIGHTS) as [Rarity, number][]
  for (const [rarity, weight] of entries) {
    cumulative += weight
    if (roll < cumulative) return rarity
  }
  return 'common'
}

export function meetsPrerequisites(
  upgrade: UpgradeDef,
  context: UpgradeContext,
): boolean {
  if (!upgrade.prerequisites) return true
  for (const prereq of upgrade.prerequisites) {
    const instance = context.activeUpgrades.get(prereq.upgradeId)
    if (!instance || instance.level < prereq.minLevel) return false
  }
  return true
}

export function hasConflicts(
  upgrade: UpgradeDef,
  context: UpgradeContext,
): boolean {
  if (!upgrade.conflicts) return false
  for (const conflictId of upgrade.conflicts) {
    if (context.activeUpgrades.has(conflictId)) return true
  }
  return false
}

export function isAtMaxLevel(
  upgrade: UpgradeDef,
  context: UpgradeContext,
): boolean {
  const instance = context.activeUpgrades.get(upgrade.id)
  if (instance && instance.level >= upgrade.maxLevel) return true
  return false
}

export function getUpgradeLevel(
  upgrade: UpgradeDef,
  context: UpgradeContext,
): number {
  return context.activeUpgrades.get(upgrade.id)?.level ?? 0
}

export function filterAvailableUpgrades(
  pool: UpgradeDef[],
  context: UpgradeContext,
): UpgradeDef[] {
  return pool.filter((u) => {
    if (isAtMaxLevel(u, context)) return false
    if (!meetsPrerequisites(u, context)) return false
    if (hasConflicts(u, context)) return false
    return true
  })
}

export function rollUpgrades(
  pool: UpgradeDef[],
  context: UpgradeContext,
  count: number,
): UpgradeDef[] {
  const available = filterAvailableUpgrades(pool, context)
  if (available.length === 0) return []

  const chosen: UpgradeDef[] = []
  const usedIds = new Set<string>()

  for (let i = 0; i < count && chosen.length < count; i++) {
    const remaining = available.filter((u) => !usedIds.has(u.id))
    if (remaining.length === 0) break

    const totalWeight = remaining.reduce((sum, u) => {
      const rarityWeight = RARITY_WEIGHTS[u.rarity]
      const level = getUpgradeLevel(u, context)
      return sum + rarityWeight * (1 + level * 0.1)
    }, 0)

    let roll = Math.random() * totalWeight
    for (const upgrade of remaining) {
      const rarityWeight = RARITY_WEIGHTS[upgrade.rarity]
      const weight = rarityWeight * (1 + getUpgradeLevel(upgrade, context) * 0.1)
      roll -= weight
      if (roll <= 0) {
        chosen.push(upgrade)
        usedIds.add(upgrade.id)
        break
      }
    }
  }

  return chosen
}
