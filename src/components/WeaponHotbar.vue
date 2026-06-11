<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import type { WeaponId } from '../types/game';

const gameStore = useGameStore();

const isTerran = computed(() => gameStore.race === 'HUMANS');

const weaponDetails: Record<string, { name: string; icon: string; key: string }> = {
  gauss_rifle: { name: 'Gauss Rifle', icon: '/characters/marine/weapons/gauss-rifle.png', key: '1' },
  minigun: { name: 'Minigun', icon: '/characters/marine/weapons/minigun.png', key: '2' },
  rocket_launcher: { name: 'Rocket Launcher', icon: '/characters/marine/weapons/rocket-launcher.png', key: '3' },
  plasma_cannon: { name: 'Plasma Cannon', icon: '/characters/marine/weapons/plasma-cannon.png', key: '4' },
  claw_strike: { name: 'Claw Strike', icon: '/characters/monsters/monster1.png', key: '1' },
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
  <div v-if="!gameStore.isGameOver" class="weapon-hotbar-container" :class="{ 'weapon-hotbar--terran': isTerran }">
    <div class="hotbar-label" :class="{ 'hotbar-label--terran': isTerran }">TACTICAL WEAPON SYSTEMS</div>
    <div class="hotbar-slots">
      <button
        v-for="(weapon, index) in hotbarWeapons"
        :key="weapon.id"
        class="hotbar-slot"
        :class="{ 'is-active': gameStore.activeWeaponId === weapon.id }"
        @click="selectWeapon(weapon.id)"
      >
        <span class="hotbar-slot__key">{{ index + 1 }}</span>
        <img v-if="weapon.icon.startsWith('/')" :src="weapon.icon" class="hotbar-slot__img" alt="" />
        <span v-else class="hotbar-slot__icon">{{ weapon.icon }}</span>
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

.hotbar-slot__img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 2px;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 4px rgba(240, 184, 0, 0.15));
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

/* ============================
   TERRAN THEME
   ============================ */
.weapon-hotbar--terran .hotbar-slots {
  background: rgba(20, 25, 40, 0.75);
  border-color: rgba(240, 184, 0, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(240, 184, 0, 0.04);
}

.weapon-hotbar--terran .hotbar-slot {
  background: rgba(26, 30, 46, 0.5);
  border-color: rgba(240, 184, 0, 0.08);
}

.weapon-hotbar--terran .hotbar-slot:hover:not(.is-locked) {
  background: rgba(240, 184, 0, 0.08);
  border-color: rgba(240, 184, 0, 0.4);
  box-shadow: 0 4px 12px rgba(240, 184, 0, 0.12);
}

.weapon-hotbar--terran .hotbar-slot.is-active {
  background: rgba(240, 184, 0, 0.12);
  border-color: rgba(240, 184, 0, 0.6);
  box-shadow: 0 0 15px rgba(240, 184, 0, 0.25), inset 0 0 8px rgba(240, 184, 0, 0.12);
}

.weapon-hotbar--terran .hotbar-slot.is-active::after {
  background: rgba(240, 184, 0, 0.8);
  box-shadow: 0 0 8px rgba(240, 184, 0, 0.5);
}

.weapon-hotbar--terran .hotbar-slot.is-active .hotbar-slot__key {
  color: rgba(240, 184, 0, 0.9);
}

.hotbar-label--terran {
  color: rgba(240, 184, 0, 0.7) !important;
  text-shadow: 0 0 8px rgba(240, 184, 0, 0.3) !important;
}
</style>
