import type { UpgradeEffectStat, ComputedStats } from '../types'

export function applyStatEffect(
  effect: UpgradeEffectStat,
  level: number,
  stats: ComputedStats,
): void {
  const key = effect.stat as keyof ComputedStats
  if (!(key in stats)) return

  const totalValue = effect.value + (effect.perLevel ?? 0) * (level - 1)

  if (effect.mode === 'mult') {
    const current = stats[key] as number
    ;(stats as unknown as Record<string, number>)[key] = current * (1 + totalValue)
  } else {
    ;(stats as unknown as Record<string, number>)[key] += totalValue
  }
}

export function getStatEffectDescription(effect: UpgradeEffectStat, level: number): string {
  const totalValue = effect.value + (effect.perLevel ?? 0) * (level - 1)
  const isPercent = ['damageMult', 'fireRateMult', 'speedMult', 'xpGainMult', 'maxHealthBonus', 'projectileSizeMult', 'projectileSpeedMult', 'criticalChance', 'lifesteal'].includes(effect.stat)
  const prefix = effect.mode === 'mult' ? '+' : '+'
  const suffix = isPercent ? '%' : ''

  if (isPercent) {
    return `${prefix}${Math.round(totalValue * 100)}${suffix} ${effect.stat.replace(/([A-Z])/g, ' $1').toUpperCase()}`
  }
  return `${prefix}${totalValue} ${effect.stat.replace(/([A-Z])/g, ' $1').toUpperCase()}`
}
