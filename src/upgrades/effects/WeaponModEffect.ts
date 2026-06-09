import type { UpgradeEffectWeaponMod, WeaponMod } from '../types'

export function createWeaponModInstance(
  effect: UpgradeEffectWeaponMod,
  level: number,
): WeaponMod {
  return {
    weaponId: effect.weaponId,
    stat: effect.stat,
    value: effect.value * level,
    mode: effect.mode,
    level,
  }
}

export function getWeaponModDescription(effect: UpgradeEffectWeaponMod, level: number): string {
  const totalValue = effect.value * level
  const suffix = effect.mode === 'mult' ? '%' : ''
  const displayValue = effect.mode === 'mult' ? Math.round(totalValue * 100) : totalValue
  return `${effect.weaponId.replace(/_/g, ' ')}: +${displayValue}${suffix} ${effect.stat}`
}
