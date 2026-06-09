<template>
  <div id="game-container" class="game-shell">
    <MobileJoystick class="mobile-only" />
    <WeaponHotbar />

    <div v-if="!loading" class="hud-layer">
      <header class="hud-top">
        <section class="hud-brand panel panel--accent panel--compact">
          <div class="panel-kicker">TERRAN COMMAND</div>
          <div class="stage-title">{{ gameStore.currentStage.name }}</div>
          <div class="stage-meta stage-meta--compact">
            <span class="pill pill--blue">LV {{ gameStore.level }}</span>
            <span class="pill">{{ formattedTime }}</span>
            <span class="pill pill--mineral"><img src="/ui/mineral.jpg" class="res-icon" /> {{ Math.floor(gameStore.minerals) }}</span>
            <span class="pill pill--gas"><img src="/ui/gas.jpg" class="res-icon" /> {{ Math.floor(gameStore.gas) }}</span>
          </div>
        </section>

        <section class="hud-core panel panel--compact">
          <div class="hud-core__label-row">
            <span class="panel-kicker">XP</span>
            <span class="hud-core__value">{{ Math.floor(gameStore.xpPercentage) }}%</span>
          </div>
          <div class="progress-track progress-track--xp">
            <div class="progress-fill progress-fill--xp" :style="{ width: `${clampedXpPercentage}%` }"></div>
          </div>
          <div class="hud-core__label-row" style="margin-top: 4px; gap: 8px;">
            <button class="pill pill--cta" style="font-size: 0.6rem; padding: 2px 8px;" @click="openShop">ARMORY</button>
            <span class="mini-stat__label">UPGRADES</span>
            <span class="mini-stat__value">{{ upgradeCount }}</span>
          </div>
        </section>

        <section class="hud-right panel panel--compact">
          <span class="mini-stat__label">KILLS</span>
          <span class="mini-stat__value">{{ gameStore.kills }}</span>
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
    />

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

    <div v-if="gameStore.isGameOver" class="overlay overlay--gameover">
      <div class="overlay-shell overlay-shell--gameover">
        <div class="overlay-header overlay-header--center">
          <div class="panel-kicker panel-kicker--danger">MISSION FAILED</div>
          <h2 class="overlay-title overlay-title--danger">Re-deploy to Sector Genesis</h2>
          <p class="overlay-copy overlay-copy--center">
            The operative was terminated. +{{ creditsEarned }} credits earned.
          </p>
        </div>

        <div class="results-grid">
          <div class="result-card">
            <span class="panel-kicker">KILLS</span>
            <strong>{{ gameStore.kills }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">LEVEL</span>
            <strong>{{ gameStore.level }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">TIME</span>
            <strong>{{ formattedTime }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">CREDITS</span>
            <strong>+{{ creditsEarned }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">UPGRADES</span>
            <strong>{{ upgradeCount }}</strong>
          </div>
        </div>

        <div class="overlay-actions">
          <button class="cta-button cta-button--secondary" @click="showMetaPanel = true; creditsEarned = 0;">
            Meta-Upgrades
          </button>
          <button class="cta-button cta-button--danger" @click="restartGame">
            Re-deploy
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="overlay overlay--loading">
      <div class="loading-card">
        <div class="loading-orb" />
        <div class="panel-kicker">INITIALIZING BATTLEFIELD</div>
        <div class="loading-title">LOADING SECTOR</div>
        <div class="loading-copy">Synchronizing tactical systems, rendering battlefield assets, and arming the HUD.</div>
        <div class="loading-bar">
          <div class="loading-bar__fill" />
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

const clampedXpPercentage = computed(() => Math.min(100, Math.max(0, gameStore.xpPercentage)));
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

    const choices = engine.upgradeManager.getChoices(3);
    upgradeChoices.value = choices;
    showUpgradeChoice.value = true;
  } else {
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
  if (showUpgradeChoice.value) return;
  showShop.value = true;
  gameStore.isPaused = true;
};

const closeShop = () => {
  showShop.value = false;
  gameStore.isPaused = false;
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
