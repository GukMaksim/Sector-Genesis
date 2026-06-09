import type { UpgradeEffectBehavior, ActiveBehavior } from '../types'

export function createBehaviorInstance(
  effect: UpgradeEffectBehavior,
  level: number,
): ActiveBehavior {
  const scaledParams: Record<string, number> = {}
  for (const [key, value] of Object.entries(effect.params)) {
    scaledParams[key] = value * level
  }
  return {
    behaviorId: effect.behaviorId,
    params: scaledParams,
    level,
  }
}

export function getBehaviorDescription(effect: UpgradeEffectBehavior, level: number): string {
  const labels: Record<string, string> = {
    ricochet: `Ricochet: ${effect.params.maxBounces * level} bounces, ${Math.round((1 - effect.params.damageFalloff) * 100 * level)}% damage`,
    stim_pack: `Stim Pack: +${effect.params.speedBonus * level * 100}% speed for ${effect.params.duration * level}s every ${effect.params.triggerOnKills} kills`,
    chain_lightning: `Chain Lightning: hits ${effect.params.maxTargets * level} targets`,
  }
  return labels[effect.behaviorId] ?? `${effect.behaviorId} Lv${level}`
}
