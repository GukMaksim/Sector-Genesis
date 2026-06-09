import { META_UPGRADES } from './metaUpgrades'
import type { MetaUpgradeDef, ComputedStats, UpgradeEffectStat } from '../types'

const STORAGE_KEY = 'sector-genesis-meta'

interface MetaState {
  levels: Record<string, number>
  credits: number
}

function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { levels: {}, credits: 0 }
}

function saveMeta(state: MetaState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export class MetaUpgradeManager {
  private state: MetaState = loadMeta()

  getCredits(): number {
    return this.state.credits
  }

  addCredits(amount: number): void {
    this.state.credits += amount
    saveMeta(this.state)
  }

  getLevel(metaId: string): number {
    return this.state.levels[metaId] ?? 0
  }

  getDef(metaId: string): MetaUpgradeDef | undefined {
    return META_UPGRADES.find((m) => m.id === metaId)
  }

  getAllDefs(): MetaUpgradeDef[] {
    return META_UPGRADES
  }

  getCost(metaId: string): number {
    const def = this.getDef(metaId)
    if (!def) return Infinity
    const level = this.getLevel(metaId)
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, level))
  }

  canAfford(metaId: string): boolean {
    return this.state.credits >= this.getCost(metaId)
  }

  canLevel(metaId: string): boolean {
    const def = this.getDef(metaId)
    if (!def) return false
    return this.getLevel(metaId) < def.maxLevel
  }

  purchase(metaId: string): boolean {
    if (!this.canLevel(metaId) || !this.canAfford(metaId)) return false
    this.state.credits -= this.getCost(metaId)
    this.state.levels[metaId] = (this.state.levels[metaId] ?? 0) + 1
    saveMeta(this.state)
    return true
  }

  applyMetaStats(baseStats: ComputedStats): ComputedStats {
    const stats = { ...baseStats }
    for (const def of META_UPGRADES) {
      const level = this.getLevel(def.id)
      if (level === 0) continue
      const effect = def.effect as UpgradeEffectStat
      if (effect.type === 'stat') {
        const key = effect.stat as keyof ComputedStats
        if (key in stats) {
          const totalValue = effect.value * level
          if (effect.mode === 'mult') {
            const current = stats[key] as number
            ;(stats as Record<string, number>)[key] = current * (1 + totalValue)
          } else {
            ;(stats as Record<string, number>)[key] += totalValue
          }
        }
      }
    }
    return stats
  }

  getStartingWeapons(): string[] {
    const weapons: string[] = []
    if (this.getLevel('meta_start_minigun') > 0) weapons.push('minigun')
    return weapons
  }

  reset(): void {
    this.state = { levels: {}, credits: 0 }
    saveMeta(this.state)
  }
}

export const metaManager = new MetaUpgradeManager()
