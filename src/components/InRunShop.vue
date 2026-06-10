<template>
  <div v-if="show" class="overlay overlay--upgrade">
    <div class="overlay-shell overlay-shell--choice" :class="{ 'overlay-shell--terran': isTerran }">
      <div class="overlay-header">
        <div class="panel-kicker">FIELD ARMORY</div>
        <h2 class="overlay-title">Supplies & Requisitions</h2>
        <p class="overlay-copy">
          Spend resources on battlefield upgrades, heals, and weapon requisitions.
        </p>
      </div>

      <div class="shop-row">
        <div class="pill pill--mineral"><img src="/ui/mineral.jpg" class="res-icon" /> {{ Math.floor(gameStore.minerals) }}</div>
        <div class="pill pill--gas"><img src="/ui/gas.jpg" class="res-icon" /> {{ Math.floor(gameStore.gas) }}</div>
      </div>

      <div class="shop-grid">
        <button class="shop-item" :class="{ 'shop-item--terran': isTerran }" :disabled="gameStore.minerals < rerollCost" @click="$emit('reroll')">
          <span class="shop-item__icon">🔄</span>
          <span class="shop-item__name">Re-roll Choices</span>
          <span class="shop-item__cost pill pill--mineral"><img src="/ui/mineral.jpg" class="res-icon" /> {{ rerollCost }}</span>
        </button>

        <button class="shop-item" :class="{ 'shop-item--terran': isTerran }" :disabled="gameStore.gas < extraChoiceCost" @click="$emit('extraChoice')">
          <span class="shop-item__icon">➕</span>
          <span class="shop-item__name">Extra Choice</span>
          <span class="shop-item__cost pill pill--gas"><img src="/ui/gas.jpg" class="res-icon" /> {{ extraChoiceCost }}</span>
        </button>

        <button class="shop-item" :class="{ 'shop-item--terran': isTerran }" :disabled="gameStore.minerals < healCost" @click="$emit('heal')">
          <span class="shop-item__icon">❤️</span>
          <span class="shop-item__name">Emergency Heal (+40 HP)</span>
          <span class="shop-item__cost pill pill--mineral"><img src="/ui/mineral.jpg" class="res-icon" /> {{ healCost }}</span>
        </button>

        <template v-for="weapon in lockedWeapons" :key="weapon.id">
          <button
            class="shop-item" :class="{ 'shop-item--terran': isTerran }"
            :disabled="gameStore.minerals < weapon.mineralCost || gameStore.gas < weapon.gasCost"
            @click="$emit('unlockWeapon', weapon.id)"
          >
             <img v-if="weapon.icon.startsWith('/')" :src="weapon.icon" class="shop-item__icon shop-item__icon--img" alt="" />
             <span v-else class="shop-item__icon">{{ weapon.icon }}</span>
            <span class="shop-item__name">Requisition: {{ weapon.name }}</span>
            <span class="shop-item__cost">
              <span class="pill pill--mineral"><img src="/ui/mineral.jpg" class="res-icon" /> {{ weapon.mineralCost }}</span>
              <span class="pill pill--gas"><img src="/ui/gas.jpg" class="res-icon" /> {{ weapon.gasCost }}</span>
            </span>
          </button>
        </template>
      </div>

      <div class="tree-footer">
        <button class="cta-button" :class="isTerran ? 'cta-button--terran-secondary' : 'cta-button--secondary'" @click="$emit('close')">
          Close Armory
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import type { WeaponId } from '../types/game'

defineEmits<{
  close: []
  reroll: []
  extraChoice: []
  heal: []
  unlockWeapon: [id: WeaponId]
}>()

defineProps<{
  show: boolean
}>()

const gameStore = useGameStore()
const isTerran = computed(() => gameStore.race === 'HUMANS')

const rerollCost = 50
const extraChoiceCost = 30
const healCost = 75

const weaponRequisitions: { id: WeaponId; name: string; icon: string; mineralCost: number; gasCost: number }[] = [
  { id: 'minigun', name: 'Minigun', icon: '/characters/marine/weapons/minigun.png', mineralCost: 200, gasCost: 100 },
  { id: 'rocket_launcher', name: 'Rocket Launcher', icon: '/characters/marine/weapons/rocket-launcher.png', mineralCost: 350, gasCost: 200 },
  { id: 'plasma_cannon', name: 'Plasma Cannon', icon: '/characters/marine/weapons/plasma-cannon.png', mineralCost: 500, gasCost: 350 },
]

const lockedWeapons = computed(() =>
  weaponRequisitions.filter((w) => !gameStore.unlockedWeapons.includes(w.id))
)
</script>

<style scoped>
.shop-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.shop-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  color: #ccc;
}

.shop-item:hover:not(:disabled) {
  background: rgba(0, 242, 255, 0.08);
  border-color: #00f2ff;
}

.shop-item:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.shop-item__icon {
  font-size: 1.5rem;
  min-width: 36px;
  text-align: center;
}

.shop-item__icon--img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.shop-item__name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
}

.shop-item__cost {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.8rem;
}
</style>
