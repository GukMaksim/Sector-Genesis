<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { metaManager } from '../upgrades/meta/MetaUpgradeManager'
import type { RaceType } from '../types/game'
import MetaUpgradePanel from './MetaUpgradePanel.vue'

const emit = defineEmits<{
  start: []
}>()

const showMeta = ref(false)
const gameStore = useGameStore()

const races: Array<{
  id: RaceType
  name: string
  subtitle: string
  description: string
  accent: string
  locked: boolean
  lockHint?: string
}> = [
  {
    id: 'HUMANS',
    name: 'Terran Federation',
    subtitle: 'Homo Sapiens Superior',
    description: 'Balanced warfare doctrine. Masters of adaptive tactics, terran forces excel at resource efficiency, tactical flexibility, and sustained combat operations.',
    accent: '#00f2ff',
    locked: false,
  },
  {
    id: 'PSIONICS',
    name: 'Psionic Ascendancy',
    subtitle: 'Homo Psionica',
    description: 'Mind over matter. Psionic operatives bend reality through sheer will, unleashing devastating psychic storms and manipulating the battlefield with thought alone.',
    accent: '#bf7fff',
    locked: true,
    lockHint: 'Coming soon — Awaiting neural imprint synchronization',
  },
  {
    id: 'BIOFORMS',
    name: 'Bioform Swarm',
    subtitle: 'Nexus Organica',
    description: 'Evolution unshackled. Bioforms adapt, consume, and regenerate. Every encounter makes them stronger as they assimilate genetic material from fallen foes.',
    accent: '#00ff41',
    locked: true,
    lockHint: 'Coming soon — Genetic template undergoing final maturation',
  },
]

const selectRace = (race: (typeof races)[number]) => {
  if (race.locked) return
  gameStore.race = race.id
  emit('start')
}
</script>

<template>
  <div class="race-selection">
    <div class="race-selection__bg" />

    <header class="race-header">
      <div class="race-header__kicker">SECTOR GENESIS</div>
      <h1 class="race-header__title">Choose Your Genesis</h1>
      <p class="race-header__copy">
        Each race offers a unique evolutionary path. Your choice will determine the weapons, abilities, and strategy at your disposal.
      </p>
    </header>

    <div class="race-grid">
      <button
        v-for="race in races"
        :key="race.id"
        class="race-card"
        :class="{ 'race-card--locked': race.locked }"
        :style="{ '--race-accent': race.accent }"
        :disabled="race.locked"
        @click="selectRace(race)"
      >
        <div class="race-card__glow" />

        <div class="race-card__badge">
          <span class="race-card__status" :class="{ 'race-card__status--locked': race.locked }">
            {{ race.locked ? 'LOCKED' : 'AVAILABLE' }}
          </span>
        </div>

        <div class="race-card__body">
          <div class="race-card__emblem">
            <div class="race-card__ring" />
            <div class="race-card__sigil">{{ race.name.charAt(0) }}</div>
          </div>

          <div class="race-card__info">
            <span class="race-card__subtitle">{{ race.subtitle }}</span>
            <h2 class="race-card__name">{{ race.name }}</h2>
          </div>

          <p class="race-card__desc">{{ race.description }}</p>

          <div v-if="race.locked" class="race-card__lock-hint">
            {{ race.lockHint }}
          </div>

          <div v-else class="race-card__action">
            <span class="race-card__select-text">DEPLOY</span>
            <span class="race-card__arrow">→</span>
          </div>
        </div>

        <div v-if="race.locked" class="race-card__overlay" />
      </button>
    </div>

    <MetaUpgradePanel :show="showMeta" @close="showMeta = false" />

    <footer class="race-footer">
      <button class="race-footer__meta-btn" @click="showMeta = true">
        META-UPGRADES ({{ metaManager.getCredits() }} CR)
      </button>
      <span class="race-footer__version">v0.1.0 — EARLY ACCESS</span>
    </footer>
  </div>
</template>

<style scoped>
.race-selection {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 3vw, 40px);
  padding: clamp(16px, 3vw, 40px);
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 50% at 50% 20%, rgba(0, 242, 255, 0.06), transparent),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(191, 127, 255, 0.04), transparent),
    radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0, 255, 65, 0.04), transparent),
    linear-gradient(180deg, #03060c 0%, #07111d 50%, #04080f 100%);
}

.race-selection__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 4px, 4px 100%;
  opacity: 0.12;
  mix-blend-mode: screen;
}

.race-header {
  text-align: center;
  display: grid;
  gap: 8px;
  max-width: 720px;
  position: relative;
  z-index: 1;
}

.race-header__kicker {
  font-size: 0.72rem;
  letter-spacing: 0.4em;
  color: var(--text-muted, rgba(185, 201, 224, 0.72));
  text-transform: uppercase;
}

.race-header__title {
  font-family: "Rajdhani", "Segoe UI", sans-serif;
  font-size: clamp(1.8rem, 3vw + 0.8rem, 3.2rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-main, rgba(243, 247, 255, 0.96));
  margin: 0;
  line-height: 0.95;
}

.race-header__copy {
  color: var(--text-muted, rgba(185, 201, 224, 0.72));
  font-size: 0.88rem;
  margin: 0;
  line-height: 1.6;
}

.race-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(12px, 1.5vw, 20px);
  width: 100%;
  max-width: 1100px;
  position: relative;
  z-index: 1;
}

.race-card {
  position: relative;
  appearance: none;
  border: 1px solid rgba(128, 173, 212, 0.16);
  background: linear-gradient(180deg, rgba(13, 20, 34, 0.88), rgba(7, 12, 22, 0.78));
  backdrop-filter: blur(18px);
  color: var(--text-main, rgba(243, 247, 255, 0.96));
  padding: 0;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
}

.race-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 30%, transparent 70%, color-mix(in srgb, var(--race-accent) 8%, transparent));
  pointer-events: none;
  z-index: 1;
}

.race-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.03);
  pointer-events: none;
  z-index: 1;
}

.race-card:not(.race-card--locked):hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--race-accent) 40%, rgba(128, 173, 212, 0.16));
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.4),
    0 0 0 1px color-mix(in srgb, var(--race-accent) 20%, transparent);
}

.race-card:not(.race-card--locked):focus-visible {
  outline: 2px solid var(--race-accent);
  outline-offset: 2px;
}

.race-card--locked {
  cursor: not-allowed;
  opacity: 0.6;
  filter: grayscale(0.5);
}

.race-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, color-mix(in srgb, var(--race-accent) 8%, transparent), transparent 60%);
  opacity: 0;
  transition: opacity 400ms ease;
  pointer-events: none;
}

.race-card:not(.race-card--locked):hover .race-card__glow {
  opacity: 1;
}

.race-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 5, 10, 0.35);
  z-index: 2;
  pointer-events: none;
}

.race-card__badge {
  padding: 12px 14px 0;
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 3;
}

.race-card__status {
  font-size: 0.6rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--race-accent) 36%, transparent);
  color: var(--race-accent);
  background: color-mix(in srgb, var(--race-accent) 10%, transparent);
}

.race-card__status--locked {
  border-color: rgba(128, 128, 128, 0.3);
  color: var(--text-muted, rgba(185, 201, 224, 0.72));
  background: rgba(255, 255, 255, 0.04);
}

.race-card__body {
  padding: 10px 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  position: relative;
  z-index: 3;
}

.race-card__emblem {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.race-card__ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1.5px solid color-mix(in srgb, var(--race-accent) 40%, transparent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--race-accent) 14%, transparent);
}

.race-card__sigil {
  font-family: "Rajdhani", "Segoe UI", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--race-accent);
  text-shadow: 0 0 14px color-mix(in srgb, var(--race-accent) 30%, transparent);
}

.race-card__info {
  display: grid;
  gap: 2px;
}

.race-card__subtitle {
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted, rgba(185, 201, 224, 0.72));
  font-style: italic;
}

.race-card__name {
  font-family: "Rajdhani", "Segoe UI", sans-serif;
  font-size: clamp(1.1rem, 0.8vw + 0.7rem, 1.4rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
  color: var(--text-main, rgba(243, 247, 255, 0.96));
}

.race-card__desc {
  color: var(--text-muted, rgba(185, 201, 224, 0.72));
  font-size: 0.78rem;
  line-height: 1.55;
  margin: 0;
  flex: 1;
}

.race-card__lock-hint {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: rgba(185, 201, 224, 0.5);
  font-style: italic;
  padding-top: 4px;
  border-top: 1px solid rgba(128, 173, 212, 0.1);
}

.race-card__action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(128, 173, 212, 0.1);
}

.race-card__select-text {
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--race-accent);
  font-weight: 700;
}

.race-card__arrow {
  font-size: 1.1rem;
  color: var(--race-accent);
  transition: transform 200ms ease;
}

.race-card:not(.race-card--locked):hover .race-card__arrow {
  transform: translateX(4px);
}

.race-footer {
  position: relative;
  z-index: 1;
}

.race-footer__version {
  font-size: 0.62rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(185, 201, 224, 0.35);
}

.race-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.race-footer__meta-btn {
  background: none;
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffd700;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.race-footer__meta-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: #ffd700;
}

@media (max-width: 760px) {
  .race-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .race-card__body {
    padding: 8px 12px 14px;
  }
}
</style>
