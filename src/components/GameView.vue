<template>
  <div id="game-container" class="game-shell">
    <RaceFrame :race="gameStore.race" />
    <MobileJoystick class="mobile-only" />
    <WeaponHotbar />

    <div v-if="!loading" class="hud-layer">
      <header class="hud-top">
        <section class="hud-brand panel panel--compact" :class="racePanelClass">
          <div class="panel-kicker">{{ raceCommandText }}</div>
          <div class="stage-title">{{ gameStore.currentStage.name }}</div>
          <div class="stage-meta stage-meta--compact" :class="rc('stage-meta')">
            <span class="pill" :class="rp('pill')">LV {{ gameStore.level }}</span>
            <span class="pill">{{ formattedTime }}</span>
            <span class="pill pill--mineral"><img src="/ui/mineral.jpg" class="res-icon" /> {{ Math.floor(gameStore.minerals) }}</span>
            <span class="pill pill--gas"><img src="/ui/gas.jpg" class="res-icon" /> {{ Math.floor(gameStore.gas) }}</span>
          </div>
        </section>

        <section class="hud-core panel panel--compact" :class="rc('panel')">
          <div class="hud-core__label-row">
            <span class="panel-kicker">XP</span>
            <span class="hud-core__value" :class="rc('hud-core__value')">{{ Math.floor(gameStore.xpPercentage) }}%</span>
          </div>
          <div class="progress-track progress-track--xp">
            <div class="progress-fill" :class="rpc('progress-fill--xp')" :style="{ width: `${clampedXpPercentage}%` }"></div>
          </div>
          <div class="hud-core__label-row" style="margin-top: 4px; gap: 8px;">
            <button class="pill" :class="rp('pill--cta')" style="font-size: 0.6rem; padding: 2px 8px;" @click="openShop">ARMORY</button>
            <span class="mini-stat__label">UPGRADES</span>
            <span class="mini-stat__value">{{ upgradeCount }}</span>
          </div>
        </section>

        <section class="hud-right panel panel--compact" :class="rc('panel')">
          <span class="mini-stat__label">KILLS</span>
          <span class="mini-stat__value" :class="rc('mini-stat__value')">{{ gameStore.kills }}</span>
        </section>
      </header>
      <Minimap />
    </div>

    <InRunShop
      :show="showShop"
      @close="closeShop"
      @reroll="handleReroll"
      @extra-choice="handleExtraChoice"
      @heal="handleShopHeal"
      @unlock-weapon="handleShopWeaponUnlock"
      @dmg-boost="handleDmgBoost"
      @fire-rate-boost="handleFireRateBoost"
      @armor-boost="handleArmorBoost"
      @full-heal="handleFullHeal"
    />

    <Transition name="evo-fade">
      <div v-if="showLevelUpFlash" class="overlay overlay--levelup">
        <div class="levelup-card" :class="rc('levelup-card')">
          <div class="levelup-icon">⬆</div>
          <div class="levelup-title">LEVEL UP</div>
          <div class="levelup-level">Level {{ gameStore.level }}</div>
          <div class="levelup-stage" v-if="gameStore.currentStage">
            {{ gameStore.currentStage.name }}
          </div>
        </div>
      </div>
    </Transition>

    <UpgradeChoice
      :show="showUpgradeChoice"
      :choices="upgradeChoices"
      @pick="handleUpgradePick"
      @skip="handleUpgradeSkip"
      @open-shop="openShop"
    />

    <SpecializationChoice
      :show="gameStore.showSpecializationChoice"
      :current-spec="upgradeStore.specializationId"
      @pick="handleSpecPick"
      @skip="handleSpecSkip"
    />

    <EvolutionNotification
      :show="upgradeStore.showEvolutionNotification"
      :name="evolutionName"
      :description="evolutionDesc"
      @dismiss="dismissEvolution"
    />

    <MetaUpgradePanel
      :show="showMetaPanel"
      @close="closeMetaPanel"
    />

    <div v-if="gameStore.isGameOver" class="overlay" :class="ro('overlay--gameover')">
      <div class="overlay-shell overlay-shell--gameover" :class="rc('overlay-shell')">
        <div class="overlay-header overlay-header--center">
          <div class="panel-kicker panel-kicker--danger">MISSION FAILED</div>
          <h2 class="overlay-title overlay-title--danger">Re-deploy to Sector Genesis</h2>
          <p class="overlay-copy overlay-copy--center">
            The operative was terminated. +{{ creditsEarned }} credits earned.
          </p>
        </div>

        <div class="results-grid">
          <div class="result-card" :class="rc('result-card')">
            <span class="panel-kicker">KILLS</span>
            <strong>{{ gameStore.kills }}</strong>
          </div>
          <div class="result-card" :class="rc('result-card')">
            <span class="panel-kicker">LEVEL</span>
            <strong>{{ gameStore.level }}</strong>
          </div>
          <div class="result-card" :class="rc('result-card')">
            <span class="panel-kicker">TIME</span>
            <strong>{{ formattedTime }}</strong>
          </div>
          <div class="result-card" :class="rc('result-card')">
            <span class="panel-kicker">CREDITS</span>
            <strong>+{{ creditsEarned }}</strong>
          </div>
          <div class="result-card" :class="rc('result-card')">
            <span class="panel-kicker">UPGRADES</span>
            <strong>{{ upgradeCount }}</strong>
          </div>
        </div>

        <div class="overlay-actions">
          <button class="cta-button" :class="rcs('cta-button')" @click="showMetaPanel = true; creditsEarned = 0;">
            Meta-Upgrades
          </button>
          <button class="cta-button cta-button--danger" @click="restartGame">
            Re-deploy
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="overlay overlay--loading">
      <div class="loading-card" :class="rc('loading-card')">
        <div class="loading-orb" :class="rc('loading-orb')" />
        <div class="panel-kicker">INITIALIZING BATTLEFIELD</div>
        <div class="loading-title">LOADING SECTOR</div>
        <div class="loading-copy">Synchronizing tactical systems, rendering battlefield assets, and arming the HUD.</div>
        <div class="loading-bar" :class="rc('loading-bar')">
          <div class="loading-bar__fill" :class="rc('loading-bar__fill')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../stores/gameStore';
import { useUpgradeStore } from '../stores/upgradeStore';
import { metaManager } from '../upgrades/meta/MetaUpgradeManager';
import type { UpgradeDef } from '../upgrades/types';
import type { WeaponId } from '../types/game';
import MobileJoystick from './MobileJoystick.vue';
import WeaponHotbar from './WeaponHotbar.vue';
import Minimap from './Minimap.vue';
import UpgradeChoice from './UpgradeChoice.vue';
import SpecializationChoice from './SpecializationChoice.vue';
import EvolutionNotification from './EvolutionNotification.vue';
import InRunShop from './InRunShop.vue';
import MetaUpgradePanel from './MetaUpgradePanel.vue';
import RaceFrame from './RaceFrame.vue';

const loading = ref(true);
const gameStore = useGameStore();
const upgradeStore = useUpgradeStore();
const engineInstance = ref<GameEngine | null>(null);
const upgradeChoices = ref<UpgradeDef[]>([]);
const showUpgradeChoice = ref(false);
const showShop = ref(false);
const showMetaPanel = ref(false);
const evolutionName = ref('');
const evolutionDesc = ref('');
const creditsEarned = ref(0);
const showLevelUpFlash = ref(false);
const shopFromUpgrade = ref(false);

const isTerran = computed(() => gameStore.race === 'HUMANS');
const isBioform = computed(() => gameStore.race === 'BIOFORMS');
const raceMod = computed(() => isTerran.value ? 'terran' : isBioform.value ? 'bioform' : '');
const racePanelClass = computed(() => {
  if (isTerran.value) return 'panel--terran';
  if (isBioform.value) return 'panel--bioform';
  return 'panel--accent';
});
const raceCommandText = computed(() => {
  if (isTerran.value) return 'TERRAN COMMAND';
  if (isBioform.value) return 'BIOFORM SWARM';
  return 'SECTOR COMMAND';
});
const clampedXpPercentage = computed(() => Math.min(100, Math.max(0, gameStore.xpPercentage)));

const rc = (base: string) => raceMod.value ? { [`${base}--${raceMod.value}`]: true } : {};
const rp = (base: string) => raceMod.value ? `${base}--${raceMod.value}` : `${base}--blue`;
const rpc = (base: string) => raceMod.value ? `${base}--${raceMod.value}` : base;
const ro = (base: string) => raceMod.value ? `${base}--${raceMod.value}` : base;
const rcs = (base: string) => raceMod.value ? `${base}--${raceMod.value}-secondary` : `${base}--secondary`;
const upgradeCount = computed(() => upgradeStore.activeUpgrades.length);

const formattedTime = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(gameStore.time));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

watch(() => gameStore.showUpgradeOverlay, (show) => {
  if (show && engineInstance.value) {
    const engine = engineInstance.value;

    if (gameStore.level === 10 && !upgradeStore.specializationId) {
      gameStore.showSpecializationChoice = true;
      gameStore.showUpgradeOverlay = false;
      return;
    }

    // Show level-up flash first, then choices after 1s
    showLevelUpFlash.value = true;
    setTimeout(() => {
      if (!gameStore.showUpgradeOverlay) return; // cancelled
      const choices = engine.upgradeManager.getChoices(3);
      upgradeChoices.value = choices;
      showLevelUpFlash.value = false;
      showUpgradeChoice.value = true;
    }, 1000);
  } else {
    showLevelUpFlash.value = false;
    showUpgradeChoice.value = false;
  }
});

watch(() => upgradeStore.showEvolutionNotification, (show) => {
  if (show) {
    const text = upgradeStore.evolutionNotificationText;
    const parts = text.split('\n');
    evolutionName.value = parts[0] || '';
    evolutionDesc.value = parts.slice(1).join('\n') || '';
  }
});

watch(() => gameStore.isGameOver, (over) => {
  if (over) {
    creditsEarned.value = Math.max(1, Math.floor(gameStore.kills * 0.5 + gameStore.level * 5 + gameStore.time * 0.1));
    metaManager.addCredits(creditsEarned.value);
    clearAllBoosts();
    showShop.value = false;
  }
});

// --- Upgrade handling ---
const handleUpgradePick = (id: string) => {
  const engine = engineInstance.value;
  if (!engine) return;
  engine.upgradeManager.applyUpgrade(id);
  closeUpgradeOverlay();
};

const handleUpgradeSkip = () => {
  closeUpgradeOverlay();
};

const closeUpgradeOverlay = () => {
  showUpgradeChoice.value = false;
  gameStore.showUpgradeOverlay = false;
  gameStore.isPaused = false;
};

const refreshChoices = () => {
  const engine = engineInstance.value;
  if (!engine) return;
  upgradeChoices.value = engine.upgradeManager.getChoices(upgradeChoices.value.length || 3);
};

// --- Shop handling ---
const openShop = () => {
  if (gameStore.isGameOver) return;
  if (showUpgradeChoice.value) {
    shopFromUpgrade.value = true;
    showUpgradeChoice.value = false;
  }
  showShop.value = true;
  gameStore.isPaused = true;
};

const closeShop = () => {
  showShop.value = false;
  if (gameStore.isGameOver) {
    shopFromUpgrade.value = false;
    return;
  }
  if (shopFromUpgrade.value) {
    shopFromUpgrade.value = false;
    showUpgradeChoice.value = true;
  } else {
    gameStore.isPaused = false;
  }
};

const handleReroll = () => {
  if (gameStore.minerals < 50) return;
  gameStore.minerals -= 50;
  refreshChoices();
};

const handleExtraChoice = () => {
  if (gameStore.gas < 30) return;
  gameStore.gas -= 30;
  const engine = engineInstance.value;
  if (!engine) return;
  const extra = engine.upgradeManager.getChoices(1);
  if (extra.length > 0) {
    upgradeChoices.value = [...upgradeChoices.value, ...extra];
  }
};

const handleShopHeal = () => {
  if (gameStore.minerals < 75) return;
  gameStore.minerals -= 75;
  gameStore.heal(40);
};

const handleShopWeaponUnlock = (id: WeaponId) => {
  gameStore.unlockWeapon(id);
};

// --- Temporary shop boosts ---
const boostTimeouts: ReturnType<typeof setTimeout>[] = [];

const clearAllBoosts = () => {
  for (const t of boostTimeouts) clearTimeout(t);
  boostTimeouts.length = 0;
};

const applyTempBoost = (key: keyof typeof upgradeStore.statMultipliers, value: number, durationMs: number) => {
  (upgradeStore.statMultipliers as Record<string, number>)[key] += value;
  const timeout = setTimeout(() => {
    (upgradeStore.statMultipliers as Record<string, number>)[key] -= value;
    const idx = boostTimeouts.indexOf(timeout);
    if (idx !== -1) boostTimeouts.splice(idx, 1);
  }, durationMs);
  boostTimeouts.push(timeout);
};

const handleDmgBoost = () => {
  if (gameStore.minerals < 100) return;
  gameStore.minerals -= 100;
  applyTempBoost('damageMult', 0.15, 30000);
};

const handleFireRateBoost = () => {
  if (gameStore.gas < 80) return;
  gameStore.gas -= 80;
  applyTempBoost('fireRateMult', 0.25, 30000);
};

const handleArmorBoost = () => {
  if (gameStore.minerals < 120) return;
  gameStore.minerals -= 120;
  applyTempBoost('armor', 5, 30000);
};

const handleFullHeal = () => {
  if (gameStore.minerals < 150) return;
  gameStore.minerals -= 150;
  gameStore.heal(9999); // Full heal
};

// --- Specialization ---
const handleSpecPick = (specId: string) => {
  const engine = engineInstance.value;
  if (!engine) return;
  engine.upgradeManager.applySpecialization(specId);
  gameStore.showSpecializationChoice = false;
  gameStore.showUpgradeOverlay = true;
  gameStore.isPaused = true;
  refreshChoices();
  showUpgradeChoice.value = true;
};

const handleSpecSkip = () => {
  gameStore.showSpecializationChoice = false;
  gameStore.showUpgradeOverlay = false;
  gameStore.isPaused = false;
};

// --- Evolution ---
const dismissEvolution = () => {
  upgradeStore.hideEvolution();
};

// --- Meta ---
const closeMetaPanel = () => {
  showMetaPanel.value = false;
};

// --- Restart ---
const restartGame = () => {
  window.location.reload();
};

onMounted(async () => {
  const engine = await GameEngine.getInstance();
  engineInstance.value = engine;
  await engine.init({
    resizeTo: window,
    backgroundColor: 0x040811,
    antialias: true,
  });

  loading.value = false;

  window.addEventListener('resize', () => {
    engine.app.renderer.resize(window.innerWidth, window.innerHeight);
  });
});
</script>

<style scoped>
/* Level-up flash overlay */
.overlay--levelup {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.levelup-card {
  background: linear-gradient(135deg, #1a2a1a, #0a1a0a);
  border: 2px solid #00ff41;
  border-radius: 20px;
  padding: 48px 64px;
  text-align: center;
  animation: levelup-pulse 0.6s ease-in-out infinite alternate;
}

.levelup-card--terran {
  border-color: #00f2ff;
  background: linear-gradient(135deg, #0a1a2a, #0a0a1a);
}

.levelup-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: levelup-bounce 1s ease infinite;
}

.levelup-title {
  font-size: 3rem;
  font-weight: 900;
  color: #00ff41;
  letter-spacing: 8px;
  text-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
}

.levelup-card--terran .levelup-title {
  color: #00f2ff;
  text-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
}

.levelup-level {
  font-size: 1.5rem;
  color: #fff;
  margin-top: 12px;
  font-weight: 600;
}

.levelup-stage {
  font-size: 0.9rem;
  color: #888;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

@keyframes levelup-pulse {
  from { box-shadow: 0 0 20px rgba(0, 255, 65, 0.3); }
  to { box-shadow: 0 0 60px rgba(0, 255, 65, 0.7); }
}

@keyframes levelup-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* evo-fade transition used by the level-up flash */
.evo-fade-enter-active,
.evo-fade-leave-active {
  transition: opacity 0.5s ease;
}

.evo-fade-enter-from,
.evo-fade-leave-to {
  opacity: 0;
}
</style>
