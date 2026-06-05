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
            <div
              class="progress-fill progress-fill--xp"
              :style="{ width: `${clampedXpPercentage}%` }"
            ></div>
          </div>
          <button class="pill pill--cta" @click="openUpgradeMenu">UPGRADES</button>
        </section>

        <section class="hud-right panel panel--compact">
          <span class="mini-stat__label">KILLS</span>
          <span class="mini-stat__value">{{ gameStore.kills }}</span>
        </section>
      </header>
      <Minimap />
    </div>

    <div v-if="gameStore.showUpgradeOverlay" class="overlay overlay--upgrade">
      <div class="overlay-shell overlay-shell--tree">
        <div class="overlay-header">
          <div>
            <div class="panel-kicker">DOCTRINE MATRIX</div>
            <h2 class="overlay-title">Terran Skill Tree</h2>
          </div>
          <p class="overlay-copy">Spend command points on one branch at a time. Each node shows its cost, current rank, and effects.</p>
        </div>

        <div class="tree-topline">
          <div class="tree-points panel panel--compact" style="display: flex; gap: 16px; align-items: center;">
            <div class="panel-res">
              <span class="panel-kicker" style="color: #00f2ff;"><img src=""></span>
              <strong style="color: #00f2ff; font-size: 1.4rem;">{{ Math.floor(gameStore.minerals) }}</strong>
            </div>
            <div class="panel-res">
              <span class="panel-kicker" style="color: #5bfb88;">🟢</span>
              <strong style="color: #5bfb88; font-size: 1.4rem;">{{ Math.floor(gameStore.gas) }}</strong>
            </div>
          </div>
          <div class="tree-loadout panel panel--compact">
            <span class="panel-kicker">CURRENT LOADOUT</span>
            <div class="chip-row chip-row--compact">
              <span v-for="weapon in weaponLoadout" :key="weapon" class="pill pill--weapon">{{ weapon }}</span>
            </div>
          </div>
        </div>

        <div class="tree-branchbar">
          <button
            v-for="branch in gameStore.skillTreeBranches"
            :key="branch.id"
            class="branch-tab"
            :class="{ 'is-active': branch.id === activeBranchId }"
            :style="{ '--branch-accent': branch.accent }"
            @click="activeBranchId = branch.id"
          >
            <span class="branch-tab__name">{{ branch.name }}</span>
            <span class="branch-tab__hint">{{ branch.nodes.length }} nodes</span>
          </button>
        </div>

        <div class="tree-body">
          <div class="tree-summary panel panel--compact">
            <div class="tree-summary__title">Selected Doctrine</div>
            <div class="tree-summary__branch">{{ activeBranch?.title }}</div>
            <p class="tree-summary__copy">{{ activeBranchSummary }}</p>
            <div class="tree-summary__legend">
              <span><strong>Cost:</strong> 1 CP per node</span>
              <span><strong>Tip:</strong> Unlocked nodes stay active for the run</span>
            </div>
          </div>

          <div class="skill-node-list">
            <button
              v-for="node in activeBranch?.nodes ?? []"
              :key="node.id"
              class="skill-node"
              :class="{
                'is-available': node.available,
                'is-unlocked': node.rank > 0,
                'is-locked': node.locked,
              }"
              :disabled="!node.available"
              @click="unlockNode(node.id)"
            >
              <div class="skill-node__top">
                <span class="skill-node__tag">{{ node.tag }}</span>
                <span class="skill-node__cost" style="font-size: 0.65rem; letter-spacing: 0;">💎{{ node.mineralCost }} / 🟢{{ node.gasCost }}</span>
                <span class="skill-node__rank">RANK {{ node.rank }}/{{ node.maxRank }}</span>
              </div>
              <div class="skill-node__name">{{ node.name }}</div>
              <div class="skill-node__description">{{ node.description }}</div>
              <div class="skill-node__effects">
                <span v-for="effect in describeNodeEffects(node)" :key="effect" class="skill-node__effect">
                  {{ effect }}
                </span>
              </div>
              <div class="skill-node__footer">
                <span>{{ node.available ? 'AVAILABLE' : node.locked ? 'LOCKED' : 'SOLD OUT' }}</span>
                <span v-if="node.rank > 0">{{ node.rank }} / {{ node.maxRank }} INSTALLED</span>
              </div>
            </button>
          </div>
        </div>

        <div class="tree-footer">
          <span>Resources are gathered by standing near mineral patches and gas geysers</span>
          <button class="cta-button cta-button--secondary" @click="continueBattle">
            Continue Battle
          </button>
        </div>
      </div>
    </div>

    <div v-if="gameStore.isGameOver" class="overlay overlay--gameover">
      <div class="overlay-shell overlay-shell--gameover">
        <div class="overlay-header overlay-header--center">
          <div class="panel-kicker panel-kicker--danger">MISSION FAILED</div>
          <h2 class="overlay-title overlay-title--danger">Re-deploy to Sector Genesis</h2>
          <p class="overlay-copy overlay-copy--center">
            The operative was terminated after sustained enemy pressure. Review the run summary and redeploy.
          </p>
        </div>

        <div class="results-grid">
          <div class="result-card">
            <span class="panel-kicker">THREATS ELIMINATED</span>
            <strong>{{ gameStore.kills }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">FINAL LEVEL</span>
            <strong>{{ gameStore.level }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">RUN TIME</span>
            <strong>{{ formattedTime }}</strong>
          </div>
          <div class="result-card">
            <span class="panel-kicker">CREDITS</span>
            <strong>{{ gameStore.credits }}</strong>
          </div>
        </div>

        <div class="overlay-actions">
          <button class="cta-button cta-button--danger" @click="restartGame">
            Re-deploy to Sector
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
import { onMounted, ref, computed } from 'vue';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../stores/gameStore';
import MobileJoystick from './MobileJoystick.vue';
import WeaponHotbar from './WeaponHotbar.vue';
import Minimap from './Minimap.vue';

const loading = ref(true);
const gameStore = useGameStore();
const engineInstance = ref<GameEngine | null>(null);
const activeBranchId = ref('command');

const clampedXpPercentage = computed(() => Math.min(100, Math.max(0, gameStore.xpPercentage)));

const formattedTime = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(gameStore.time));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const weaponLoadout = computed(() => gameStore.equippedWeaponNames);

const openUpgradeMenu = () => {
  gameStore.isPaused = true;
  gameStore.showUpgradeOverlay = true;
};

const activeBranch = computed(() => gameStore.skillTreeBranches.find((branch) => branch.id === activeBranchId.value) ?? gameStore.skillTreeBranches[0]);

const activeBranchSummary = computed(() => {
  switch (activeBranch.value?.id) {
    case 'command':
      return 'Focus on XP flow, crit chance, sustain, and combat efficiency.';
    case 'arsenal':
      return 'Upgrade rifles into a full Terran arsenal, then unlock heavy weapons.';
    case 'engineering':
      return 'Improve armor, recovery, projectile shape, and battlefield endurance.';
    case 'mobility':
      return 'Boost movement, shields, and support fire for faster runs and safer resets.';
    default:
      return 'Select a branch to inspect its nodes.';
  }
});

const unlockNode = (nodeId: string) => {
  gameStore.unlockSkillNode(nodeId);
};

const continueBattle = () => {
  gameStore.closeUpgradeOverlay();
};

const describeNodeEffects = (node: { effects: Array<{ type: string; stat?: string; value?: number; weaponId?: string; mode?: string }> }) => {
  const statLabels: Record<string, string> = {
    damageMult: 'DAMAGE',
    fireRateMult: 'FIRE RATE',
    speedMult: 'MOVE SPEED',
    projectileCountBonus: 'PROJECTILE COUNT',
    armor: 'ARMOR',
    lifesteal: 'LIFESTEAL',
    criticalChance: 'CRITICAL CHANCE',
    pickupRadius: 'PICKUP RADIUS',
    xpGainMult: 'XP GAIN',
    maxHealthBonus: 'MAX HEALTH',
    projectileSizeMult: 'PROJECTILE SIZE',
    projectileSpeedMult: 'PROJECTILE SPEED',
  };
  const percentStats = new Set([
    'damageMult',
    'fireRateMult',
    'speedMult',
    'xpGainMult',
    'maxHealthBonus',
    'projectileSizeMult',
    'projectileSpeedMult',
  ]);

  return node.effects.map((effect) => {
    if (effect.type === 'weapon_unlock') {
      return `UNLOCK ${String(effect.weaponId).replaceAll('_', ' ').toUpperCase()}`;
    }

    if (effect.type === 'weapon_rank') {
      return `+${effect.value} ${String(effect.weaponId).replaceAll('_', ' ').toUpperCase()} RANK`;
    }

    if (effect.type === 'health_burst') {
      return `HEAL +${effect.value}`;
    }

    const symbol = effect.mode === 'mult' ? '+' : '+';
    if (effect.stat === 'criticalChance' || effect.stat === 'xpGainMult') {
      return `${symbol}${Math.round((effect.value ?? 0) * 100)}% ${effect.stat === 'criticalChance' ? 'CRIT' : 'XP GAIN'}`;
    }

    if (effect.stat && percentStats.has(effect.stat)) {
      return `${symbol}${Math.round((effect.value ?? 0) * 100)}% ${statLabels[effect.stat]}`;
    }

    if (effect.stat && statLabels[effect.stat]) {
      return `${symbol}${effect.value} ${statLabels[effect.stat]}`;
    }

    return `${symbol}${Math.round((effect.value ?? 0) * 100)}% ${String(effect.stat).replace(/([A-Z])/g, ' $1').toUpperCase()}`;
  });
};

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
