<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import type { WeaponId } from '../types/game';

const gameStore = useGameStore();

const weaponDetails = {
  gauss_rifle: { name: 'Gauss Rifle', icon: '🔫', key: '1' },
  minigun: { name: 'Minigun', icon: '🌀', key: '2' },
  rocket_launcher: { name: 'Rocket Launcher', icon: '🚀', key: '3' },
  plasma_cannon: { name: 'Plasma Cannon', icon: '💥', key: '4' },
  orbital_laser: { name: 'Orbital Laser', icon: '⚡', key: '5' }
};

const hotbarWeapons = computed(() => {
  return gameStore.unlockedWeapons
    .filter((id) => id !== 'orbital_laser')
    .map((id) => {
      return {
        id,
        ...weaponDetails[id]
      };
    });
});

const selectWeapon = (id: WeaponId) => {
  gameStore.setActiveWeapon(id);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (gameStore.isGameOver || gameStore.isPaused) return;
  const num = parseInt(e.key);
  if (num >= 1 && num <= hotbarWeapons.value.length) {
    const weapon = hotbarWeapons.value[num - 1];
    selectWeapon(weapon.id);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div v-if="!gameStore.isGameOver" class="weapon-hotbar-container">
    <div class="hotbar-label">TACTICAL WEAPON SELECTION</div>
    <div class="hotbar-slots">
      <button
        v-for="(weapon, index) in hotbarWeapons"
        :key="weapon.id"
        class="hotbar-slot"
        :class="{ 'is-active': gameStore.activeWeaponId === weapon.id }"
        @click="selectWeapon(weapon.id)"
      >
        <span class="hotbar-slot__key">{{ index + 1 }}</span>
        <span class="hotbar-slot__icon">{{ weapon.icon }}</span>
        <span class="hotbar-slot__name">{{ weapon.name }}</span>
      </button>
      
      <!-- Locked empty slots for preview (up to 4 total) -->
      <div 
        v-for="i in Math.max(0, 4 - hotbarWeapons.length)" 
        :key="'locked-' + i" 
        class="hotbar-slot is-locked"
      >
        <span class="hotbar-slot__key">{{ hotbarWeapons.length + i }}</span>
        <span class="hotbar-slot__icon">🔒</span>
        <span class="hotbar-slot__name">Locked</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weapon-hotbar-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: auto;
}

.hotbar-label {
  font-family: 'Rajdhani', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: rgba(0, 242, 255, 0.6);
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(0, 242, 255, 0.4);
}

.hotbar-slots {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(8, 12, 24, 0.55);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 242, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.hotbar-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  background: rgba(16, 24, 48, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Rajdhani', sans-serif;
}

.hotbar-slot:hover:not(.is-locked) {
  background: rgba(0, 242, 255, 0.1);
  border-color: rgba(0, 242, 255, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 242, 255, 0.15);
}

.hotbar-slot.is-active {
  background: rgba(0, 242, 255, 0.15);
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3), inset 0 0 8px rgba(0, 242, 255, 0.2);
}

.hotbar-slot.is-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 10%;
  width: 80%;
  height: 2px;
  background: #00f2ff;
  border-radius: 1px;
  box-shadow: 0 0 8px #00f2ff;
}

.hotbar-slot.is-locked {
  cursor: not-allowed;
  opacity: 0.4;
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.05);
}

.hotbar-slot__key {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
}

.hotbar-slot.is-active .hotbar-slot__key {
  color: #00f2ff;
}

.hotbar-slot__icon {
  font-size: 26px;
  margin-bottom: 2px;
}

.hotbar-slot__name {
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.8);
  padding: 0 4px;
}

.hotbar-slot.is-active .hotbar-slot__name {
  color: white;
  font-weight: 700;
}
</style>
