import { DAMAGE_UPGRADES } from './runes/damageUpgrades'
import { UTILITY_UPGRADES } from './runes/utilityUpgrades'
import { WEAPON_UPGRADES } from './runes/weaponUpgrades'
import { EVOLUTION_UPGRADES } from './runes/evolutionUpgrades'
import { BIOFORM_UPGRADES } from './runes/bioformUpgrades'
import { EVOLUTION_DEFS } from './evolutions'
import type { UpgradeDef, EvolutionDef } from './types'

class UpgradeRegistry {
  private upgrades: Map<string, UpgradeDef> = new Map()
  private evolutions: Map<string, EvolutionDef> = new Map()

  constructor() {
    this.registerAll()
  }

  private registerAll(): void {
    const allUpgrades = [...DAMAGE_UPGRADES, ...UTILITY_UPGRADES, ...WEAPON_UPGRADES, ...EVOLUTION_UPGRADES, ...BIOFORM_UPGRADES]
    for (const upgrade of allUpgrades) {
      this.upgrades.set(upgrade.id, upgrade)
    }
    for (const evo of EVOLUTION_DEFS) {
      this.evolutions.set(evo.id, evo)
    }
  }

  getUpgrade(id: string): UpgradeDef | undefined {
    return this.upgrades.get(id)
  }

  getAllUpgrades(): UpgradeDef[] {
    return Array.from(this.upgrades.values())
  }

  getEvolution(id: string): EvolutionDef | undefined {
    return this.evolutions.get(id)
  }

  getAllEvolutions(): EvolutionDef[] {
    return Array.from(this.evolutions.values())
  }

  registerUpgrade(upgrade: UpgradeDef): void {
    this.upgrades.set(upgrade.id, upgrade)
  }

  registerEvolution(evolution: EvolutionDef): void {
    this.evolutions.set(evolution.id, evolution)
  }
}

export const upgradeRegistry = new UpgradeRegistry()
