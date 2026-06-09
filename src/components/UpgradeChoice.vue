<template>
  <div v-if="show" class="overlay overlay--upgrade">
    <div class="overlay-shell overlay-shell--choice">
      <div class="overlay-header">
        <div class="panel-kicker">LEVEL UP!</div>
        <h2 class="overlay-title">Choose an Upgrade</h2>
        <p class="overlay-copy">Select one enhancement to improve your combat capabilities.</p>
      </div>

      <div v-if="choices.length === 0" class="empty-pool">
        <p>No upgrades available. Continue battle.</p>
        <button class="cta-button cta-button--secondary" @click="$emit('skip')">
          Continue
        </button>
      </div>

      <div v-else class="upgrade-grid">
        <button
          v-for="choice in choices"
          :key="choice.id"
          class="upgrade-card"
          :class="[`upgrade-card--${choice.rarity}`]"
          :style="{ '--rarity-color': rarityColor(choice.rarity) }"
          @click="$emit('pick', choice.id)"
        >
          <div class="upgrade-card__header">
            <span class="upgrade-card__icon">{{ choice.icon }}</span>
            <span class="upgrade-card__rarity">{{ choice.rarity.toUpperCase() }}</span>
          </div>
          <div class="upgrade-card__name">{{ choice.name }}</div>
          <div class="upgrade-card__desc">{{ choice.description }}</div>
          <div class="upgrade-card__effects">
            <span v-for="(desc, i) in effectDescriptions(choice)" :key="i" class="upgrade-card__effect">
              {{ desc }}
            </span>
          </div>
          <div class="upgrade-card__footer">
            <span v-if="currentLevel(choice.id) > 0">
              LV {{ currentLevel(choice.id) }} → {{ currentLevel(choice.id) + 1 }}
            </span>
            <span v-else>NEW</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUpgradeStore } from '../stores/upgradeStore'
import type { UpgradeDef } from '../upgrades/types'
import { RARITY_COLORS } from '../upgrades/types'

const props = defineProps<{
  show: boolean
  choices: UpgradeDef[]
}>()

defineEmits<{
  pick: [id: string]
  skip: []
}>()

const upgradeStore = useUpgradeStore()

const rarityColor = (rarity: string) => RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#ffffff'

const currentLevel = (id: string) => upgradeStore.getLevel(id)

const statLabels: Record<string, string> = {
  damageMult: 'DAMAGE',
  fireRateMult: 'FIRE RATE',
  speedMult: 'MOVE SPEED',
  projectileCountBonus: 'PROJECTILES',
  armor: 'ARMOR',
  lifesteal: 'LIFESTEAL',
  criticalChance: 'CRIT CHANCE',
  pickupRadius: 'PICKUP',
  xpGainMult: 'XP GAIN',
  maxHealthBonus: 'MAX HP',
  projectileSizeMult: 'PROJECTILE SIZE',
  projectileSpeedMult: 'PROJECTILE SPEED',
}

const effectDescriptions = (upgrade: UpgradeDef) => {
  const descs: string[] = []
  for (const effect of upgrade.effects) {
    if (effect.type === 'stat') {
      const level = currentLevel(upgrade.id) + 1
      const value = effect.value + (effect.perLevel ?? 0) * (level - 1)
      const isPercent = ['damageMult', 'fireRateMult', 'speedMult', 'xpGainMult', 'maxHealthBonus', 'projectileSizeMult', 'projectileSpeedMult', 'criticalChance', 'lifesteal'].includes(effect.stat)
      const label = statLabels[effect.stat] || effect.stat.toUpperCase()
      if (isPercent) {
        descs.push(`+${Math.round(value * 100)}% ${label}`)
      } else {
        descs.push(`+${value} ${label}`)
      }
    } else if (effect.type === 'behavior') {
      const labels: Record<string, string> = {
        ricochet: `BOUNCE (${effect.params.maxBounces}x)`,
        stim_pack: `STIM (every ${effect.params.triggerOnKills} kills)`,
        chain_lightning: `CHAIN (${effect.params.maxTargets} targets)`,
      }
      descs.push(labels[effect.behaviorId] || effect.behaviorId)
    } else if (effect.type === 'weapon_mod') {
      descs.push(`${effect.weaponId.replace(/_/g, ' ')}: +${Math.round(effect.value * 100)}% ${effect.stat}`)
    }
  }
  return descs
}
</script>
