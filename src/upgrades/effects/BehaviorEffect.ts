import type { UpgradeEffectBehavior, ActiveBehavior } from '../types'

/**
 * Scaling mode for each behavior param key:
 *  - multiply: value * level   (for counts — maxBounces, maxTargets)
 *  - divide:   value / level   (for thresholds — triggerOnKills)
 *  - flat:     unchanged       (for percentages, radii, durations)
 */
type ScaleMode = 'multiply' | 'divide' | 'flat'

const BEHAVIOR_PARAM_SCALING: Record<string, Record<string, ScaleMode>> = {
  ricochet: {
    maxBounces: 'multiply',
    damageFalloff: 'flat',
    searchRadius: 'multiply',
  },
  stim_pack: {
    triggerOnKills: 'divide',
    duration: 'multiply',
    speedBonus: 'multiply',
    damageBonus: 'multiply',
  },
  chain_lightning: {
    maxTargets: 'multiply',
    damagePercent: 'flat',
    chainRadius: 'multiply',
  },
}

export function createBehaviorInstance(
  effect: UpgradeEffectBehavior,
  level: number,
): ActiveBehavior {
  const scaling = BEHAVIOR_PARAM_SCALING[effect.behaviorId] ?? {}
  const scaledParams: Record<string, number> = {}

  for (const [key, value] of Object.entries(effect.params)) {
    const mode = scaling[key] ?? 'multiply' // default: multiply for backward compat
    switch (mode) {
      case 'divide':
        scaledParams[key] = value / level
        break
      case 'flat':
        scaledParams[key] = value
        break
      case 'multiply':
      default:
        scaledParams[key] = value * level
        break
    }
  }

  return {
    behaviorId: effect.behaviorId,
    params: scaledParams,
    level,
  }
}

export function getBehaviorDescription(effect: UpgradeEffectBehavior, level: number): string {
  const labels: Record<string, string> = {
    ricochet: `Ricochet: ${effect.params.maxBounces * level} bounces, ${Math.round((1 - effect.params.damageFalloff) * 100)}% damage per bounce`,
    stim_pack: `Stim Pack: +${effect.params.speedBonus * level * 100}% speed, +${effect.params.damageBonus * level * 100}% dmg for ${effect.params.duration * level}s every ${Math.round(effect.params.triggerOnKills / level)} kills`,
    chain_lightning: `Chain Lightning: hits ${effect.params.maxTargets * level} targets, ${Math.round(effect.params.damagePercent * 100)}% chain damage`,
  }
  return labels[effect.behaviorId] ?? `${effect.behaviorId} Lv${level}`
}
