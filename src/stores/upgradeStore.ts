import { defineStore } from 'pinia'
import type { UpgradeInstance, ComputedStats, ActiveBehavior } from '../upgrades/types'
import { DEFAULT_COMPUTED_STATS } from '../upgrades/types'

export const useUpgradeStore = defineStore('upgrade', {
  state: () => ({
    activeUpgrades: [] as UpgradeInstance[],
    activeBehaviors: [] as ActiveBehavior[],
    specializationId: null as string | null,
    specializationNodes: [] as string[],
    showEvolutionNotification: false,
    evolutionNotificationText: '',
    statMultipliers: { ...DEFAULT_COMPUTED_STATS } as ComputedStats,
  }),

  getters: {
    upgradeMap(state): Map<string, UpgradeInstance> {
      const map = new Map<string, UpgradeInstance>()
      for (const inst of state.activeUpgrades) {
        map.set(inst.defId, inst)
      }
      return map
    },

    getLevel(state) {
      return (defId: string) => {
        const found = state.activeUpgrades.find((u: UpgradeInstance) => u.defId === defId)
        return found?.level ?? 0
      }
    },
  },

  actions: {
    addUpgrade(defId: string, level: number = 1) {
      const existing = this.activeUpgrades.find((u: UpgradeInstance) => u.defId === defId)
      if (existing) {
        existing.level = level
      } else {
        this.activeUpgrades.push({ defId, level })
      }
    },

    removeUpgrade(defId: string) {
      this.activeUpgrades = this.activeUpgrades.filter((u: UpgradeInstance) => u.defId !== defId)
      this.activeBehaviors = this.activeBehaviors.filter((b: ActiveBehavior) => b.behaviorId !== defId)
    },

    setBehaviors(behaviors: ActiveBehavior[]) {
      this.activeBehaviors = behaviors
    },

    setSpecialization(id: string | null) {
      this.specializationId = id
      this.specializationNodes = []
    },

    addSpecializationNode(nodeId: string) {
      if (!this.specializationNodes.includes(nodeId)) {
        this.specializationNodes.push(nodeId)
      }
    },

    showEvolution(text: string) {
      this.evolutionNotificationText = text
      this.showEvolutionNotification = true
    },

    hideEvolution() {
      this.showEvolutionNotification = false
      this.evolutionNotificationText = ''
    },

    resetRunState() {
      this.activeUpgrades = []
      this.activeBehaviors = []
      this.specializationId = null
      this.specializationNodes = []
      this.showEvolutionNotification = false
      this.evolutionNotificationText = ''
      this.statMultipliers = { ...DEFAULT_COMPUTED_STATS }
    },
  },
})
