import { upgradeRegistry } from './UpgradeRegistry'
import { useUpgradeStore } from '../stores/upgradeStore'
import { metaManager } from './meta/MetaUpgradeManager'
import { getSpecialization } from './specializations'
import { rollUpgrades } from './conditions'
import { applyStatEffect } from './effects/StatEffect'
import { createBehaviorInstance } from './effects/BehaviorEffect'
import { createWeaponModInstance } from './effects/WeaponModEffect'
import type {
  UpgradeDef,
  UpgradeContext,
  ComputedStats,
  ActiveBehavior,
  WeaponMod,
  UpgradeEffectBehavior,
  UpgradeEffectStat,
  UpgradeEffectWeaponMod,
} from './types'
import { DEFAULT_COMPUTED_STATS } from './types'
import { useGameStore } from '../stores/gameStore'

export class UpgradeManager {
  private upgradeStore = useUpgradeStore()

  getContext(): UpgradeContext {
    return {
      level: 0,
      activeUpgrades: this.upgradeStore.upgradeMap,
      specializationId: this.upgradeStore.specializationId,
    }
  }

  getChoices(count: number = 3): UpgradeDef[] {
    const pool = upgradeRegistry.getAllUpgrades()
    const context = this.getContext()
    return rollUpgrades(pool, context, count)
  }

  applyUpgrade(defId: string): boolean {
    const def = upgradeRegistry.getUpgrade(defId)
    if (!def) return false

    const context = this.getContext()
    const currentLevel = context.activeUpgrades.get(defId)?.level ?? 0
    const newLevel = currentLevel + 1

    if (newLevel > def.maxLevel) return false

    this.upgradeStore.addUpgrade(defId, newLevel)

    if (def.grantsWeapon) {
      const store = useGameStore()
      if (store && store.unlockWeapon) {
        store.unlockWeapon(def.grantsWeapon as any)
      }
    }

    this.rebuildStats()
    this.checkEvolutions()
    return true
  }

  private checkEvolutions(): void {
    const context = this.getContext()
    const evolutions = upgradeRegistry.getAllEvolutions()

    for (const evo of evolutions) {
      const allMet = evo.requirements.every((req) => {
        const inst = context.activeUpgrades.get(req.upgradeId)
        return inst && inst.level >= req.requiredLevel
      })
      if (!allMet) continue

      for (const id of evo.removesUpgrades) {
        this.upgradeStore.removeUpgrade(id)
      }

      for (const id of evo.grantsUpgrades) {
        this.upgradeStore.addUpgrade(id, 1)
      }

      if (evo.grantsWeapon) {
        const store = useGameStore()
        if (store && store.unlockWeapon) {
          store.unlockWeapon(evo.grantsWeapon as any)
        }
      }

      this.upgradeStore.showEvolution(`${evo.name}\n${evo.description}`)
      this.rebuildStats()
    }
  }

  private rebuildStats(): void {
    const stats: ComputedStats = { ...DEFAULT_COMPUTED_STATS }

    const metaStats = metaManager.applyMetaStats(stats)
    Object.assign(stats, metaStats)

    const behaviors: ActiveBehavior[] = []
    const weaponMods: WeaponMod[] = []

    for (const inst of this.upgradeStore.activeUpgrades) {
      const def = upgradeRegistry.getUpgrade(inst.defId)
      if (!def) continue

      for (const effect of def.effects) {
        if (effect.type === 'stat') {
          applyStatEffect(effect as UpgradeEffectStat, inst.level, stats)
        } else if (effect.type === 'behavior') {
          behaviors.push(createBehaviorInstance(effect as UpgradeEffectBehavior, inst.level))
        } else if (effect.type === 'weapon_mod') {
          weaponMods.push(createWeaponModInstance(effect as UpgradeEffectWeaponMod, inst.level))
        }
      }
    }

    const spec = this.upgradeStore.specializationId
      ? getSpecialization(this.upgradeStore.specializationId)
      : null
    if (spec) {
      for (const node of spec.nodes) {
        if (this.upgradeStore.specializationNodes.includes(node.id)) {
          for (const effect of node.effects) {
            if (effect.type === 'stat') {
              applyStatEffect(effect as UpgradeEffectStat, 1, stats)
            }
          }
        }
      }
    }

    this.upgradeStore.statMultipliers = stats
    this.upgradeStore.setBehaviors(behaviors)
    this.weaponMods = weaponMods
  }

  weaponMods: WeaponMod[] = []

  getBehaviorParams(behaviorId: string): Record<string, number> | null {
    const behavior = this.upgradeStore.activeBehaviors.find((b: ActiveBehavior) => b.behaviorId === behaviorId)
    return behavior?.params ?? null
  }

  hasBehavior(behaviorId: string): boolean {
    return this.upgradeStore.activeBehaviors.some((b: ActiveBehavior) => b.behaviorId === behaviorId)
  }

  getWeaponMod(weaponId: string): WeaponMod[] {
    return this.weaponMods.filter((m: WeaponMod) => m.weaponId === weaponId)
  }

  hasSpecialization(): boolean {
    return this.upgradeStore.specializationId !== null
  }

  applySpecialization(specId: string): boolean {
    const spec = getSpecialization(specId)
    if (!spec) return false

    this.upgradeStore.setSpecialization(specId)

    for (const node of spec.nodes) {
      if (node.requiredLevel <= 10) {
        this.upgradeStore.addSpecializationNode(node.id)
      }
    }

    this.rebuildStats()
    return true
  }

  checkSpecializationLevelUp(level: number): void {
    const spec = this.upgradeStore.specializationId
      ? getSpecialization(this.upgradeStore.specializationId)
      : null
    if (!spec) return

    for (const node of spec.nodes) {
      if (
        node.requiredLevel === level &&
        !this.upgradeStore.specializationNodes.includes(node.id)
      ) {
        this.upgradeStore.addSpecializationNode(node.id)
      }
    }

    this.rebuildStats()
  }

  resetRunState(): void {
    this.upgradeStore.resetRunState()
    this.weaponMods = []
  }
}
