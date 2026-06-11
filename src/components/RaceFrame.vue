<template>
  <!-- Terran frame -->
  <div v-if="race === 'HUMANS'" class="race-frame">
    <div class="race-frame__scanlines" />
    <div class="race-frame__bar race-frame__bar--top">
      <div class="race-frame__branding">
        <span class="race-frame__chevron">◀</span>
        <span class="race-frame__ornament">◆</span>
        <span class="race-frame__title">TERRAN FEDERATION</span>
        <span class="race-frame__ornament">◆</span>
        <span class="race-frame__chevron">▶</span>
      </div>
      <div class="race-frame__top-line" />
    </div>
    <div class="race-frame__bar race-frame__bar--bottom">
      <div class="race-frame__stripes" />
    </div>
    <div class="race-frame__side race-frame__side--left" />
    <div class="race-frame__side race-frame__side--right" />
    <div class="race-frame__corner race-frame__corner--tl" />
    <div class="race-frame__corner race-frame__corner--tr" />
    <div class="race-frame__corner race-frame__corner--bl" />
    <div class="race-frame__corner race-frame__corner--br" />
    <div class="race-frame__vignette" />
  </div>

  <!-- Bioform frame -->
  <div v-if="race === 'BIOFORMS'" class="bioform-frame">
    <div class="bioform-frame__haze" />
    <div class="bioform-frame__bar bioform-frame__bar--top">
      <div class="bioform-frame__branding">
        <span class="bioform-frame__ornament">◈</span>
        <span class="bioform-frame__title">BIOFORM SWARM</span>
        <span class="bioform-frame__ornament">◈</span>
      </div>
      <div class="bioform-frame__top-spores" />
    </div>
    <div class="bioform-frame__bar bioform-frame__bar--bottom">
      <div class="bioform-frame__veins" />
    </div>
    <div class="bioform-frame__side bioform-frame__side--left" />
    <div class="bioform-frame__side bioform-frame__side--right" />
    <div class="bioform-frame__corner bioform-frame__corner--tl" />
    <div class="bioform-frame__corner bioform-frame__corner--tr" />
    <div class="bioform-frame__corner bioform-frame__corner--bl" />
    <div class="bioform-frame__corner bioform-frame__corner--br" />
    <div class="bioform-frame__vignette" />
  </div>
</template>

<script setup lang="ts">
import type { RaceType } from '../types/game'

defineProps<{
  race: RaceType
}>()
</script>

<style scoped>
/* ============================================
   RACE FRAME — Terran Steel Plate Border
   ============================================ */

.race-frame {
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

.race-frame__bar--top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, rgba(26, 30, 46, 0.95) 0%, rgba(42, 48, 64, 0.92) 100%);
  border-bottom: 2px solid rgba(240, 184, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.race-frame__branding {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Rajdhani', 'Segoe UI', system-ui, sans-serif;
  user-select: none;
}

.race-frame__title {
  font-size: clamp(0.7rem, 0.7vw + 0.35rem, 0.95rem);
  font-weight: 800;
  letter-spacing: 0.35em;
  color: var(--terran-yellow, #f0b800);
  text-shadow: 0 0 12px rgba(240, 184, 0, 0.25);
}

.race-frame__chevron {
  color: rgba(240, 184, 0, 0.5);
  font-size: clamp(0.5rem, 0.4vw + 0.25rem, 0.7rem);
}

.race-frame__ornament {
  color: rgba(240, 184, 0, 0.6);
  font-size: clamp(0.4rem, 0.3vw + 0.2rem, 0.55rem);
}

.race-frame__top-line {
  position: absolute;
  bottom: -2px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(240, 184, 0, 0.6) 15%,
    rgba(240, 184, 0, 0.8) 50%,
    rgba(240, 184, 0, 0.6) 85%,
    transparent 100%
  );
}

.race-frame__bar--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: rgba(26, 30, 46, 0.92);
  border-top: 1px solid rgba(240, 184, 0, 0.2);
  z-index: 6;
  overflow: hidden;
}

.race-frame__stripes {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -45deg,
    rgba(240, 184, 0, 0.7) 0px,
    rgba(240, 184, 0, 0.7) 8px,
    rgba(26, 30, 46, 0.95) 8px,
    rgba(26, 30, 46, 0.95) 16px
  );
  background-size: 200% 100%;
  animation: stripe-scroll 12s linear infinite;
}

@keyframes stripe-scroll {
  0% { background-position: 0 0; }
  100% { background-position: -64px 0; }
}

.race-frame__side--left,
.race-frame__side--right {
  position: fixed;
  top: 40px;
  bottom: 28px;
  width: 14px;
  z-index: 6;
  background: linear-gradient(
    90deg,
    rgba(26, 30, 46, 0.92) 0%,
    rgba(42, 48, 64, 0.85) 50%,
    rgba(26, 30, 46, 0.92) 100%
  );
  border-left: 1px solid rgba(240, 184, 0, 0.12);
  border-right: 1px solid rgba(240, 184, 0, 0.12);
}

.race-frame__side--left {
  left: 0;
  border-left: none;
  border-right: 1px solid rgba(240, 184, 0, 0.12);
}

.race-frame__side--right {
  right: 0;
  border-right: none;
  border-left: 1px solid rgba(240, 184, 0, 0.12);
}

.race-frame__side--left::before,
.race-frame__side--right::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 50% 30px, rgba(240, 184, 0, 0.35) 2px, transparent 2px);
  background-size: 100% 60px;
}

.race-frame__side--right::before {
  background-image: radial-gradient(circle at 50% 30px, rgba(240, 184, 0, 0.35) 2px, transparent 2px);
  background-size: 100% 60px;
}

.race-frame__corner {
  position: fixed;
  width: 24px;
  height: 24px;
  z-index: 7;
}

.race-frame__corner--tl {
  top: 0;
  left: 0;
  border-top: 3px solid rgba(240, 184, 0, 0.5);
  border-left: 3px solid rgba(240, 184, 0, 0.5);
}

.race-frame__corner--tr {
  top: 0;
  right: 0;
  border-top: 3px solid rgba(240, 184, 0, 0.5);
  border-right: 3px solid rgba(240, 184, 0, 0.5);
}

.race-frame__corner--bl {
  bottom: 0;
  left: 0;
  border-bottom: 3px solid rgba(240, 184, 0, 0.5);
  border-left: 3px solid rgba(240, 184, 0, 0.5);
}

.race-frame__corner--br {
  bottom: 0;
  right: 0;
  border-bottom: 3px solid rgba(240, 184, 0, 0.5);
  border-right: 3px solid rgba(240, 184, 0, 0.5);
}

.race-frame__corner--tl::after,
.race-frame__corner--tr::after,
.race-frame__corner--bl::after,
.race-frame__corner--br::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(240, 184, 0, 0.5);
  box-shadow: 0 0 4px rgba(240, 184, 0, 0.2);
}

.race-frame__corner--tl::after { top: 4px; left: 4px; }
.race-frame__corner--tr::after { top: 4px; right: 4px; }
.race-frame__corner--bl::after { bottom: 4px; left: 4px; }
.race-frame__corner--br::after { bottom: 4px; right: 4px; }

.race-frame__corner--tl::before,
.race-frame__corner--tr::before,
.race-frame__corner--bl::before,
.race-frame__corner--br::before {
  content: '';
  position: absolute;
}

.race-frame__corner--tl::before {
  top: 0;
  left: 0;
  border-top: 8px solid rgba(240, 184, 0, 0.15);
  border-right: 8px solid transparent;
}

.race-frame__corner--tr::before {
  top: 0;
  right: 0;
  border-top: 8px solid rgba(240, 184, 0, 0.15);
  border-left: 8px solid transparent;
}

.race-frame__corner--bl::before {
  bottom: 0;
  left: 0;
  border-bottom: 8px solid rgba(240, 184, 0, 0.15);
  border-right: 8px solid transparent;
}

.race-frame__corner--br::before {
  bottom: 0;
  right: 0;
  border-bottom: 8px solid rgba(240, 184, 0, 0.15);
  border-left: 8px solid transparent;
}

.race-frame__scanlines {
  position: fixed;
  inset: 0;
  z-index: 8;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.06) 3px,
    rgba(0, 0, 0, 0.06) 4px
  );
  pointer-events: none;
}

.race-frame__vignette {
  position: fixed;
  inset: 0;
  z-index: 4;
  background: radial-gradient(
    ellipse at center,
    transparent 65%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}

/* ============================================
   BIOFORM FRAME — Organic Hive Border
   ============================================ */

.bioform-frame {
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

.bioform-frame__haze {
  position: fixed;
  inset: 0;
  z-index: 4;
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(0, 30, 10, 0.15) 100%
  );
  pointer-events: none;
}

.bioform-frame__bar--top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, rgba(8, 20, 12, 0.95) 0%, rgba(12, 28, 18, 0.92) 100%);
  border-bottom: 2px solid rgba(0, 255, 65, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.bioform-frame__branding {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Rajdhani', 'Segoe UI', system-ui, sans-serif;
  user-select: none;
}

.bioform-frame__title {
  font-size: clamp(0.7rem, 0.7vw + 0.35rem, 0.95rem);
  font-weight: 800;
  letter-spacing: 0.35em;
  color: #00ff41;
  text-shadow: 0 0 12px rgba(0, 255, 65, 0.25);
}

.bioform-frame__ornament {
  color: rgba(0, 255, 65, 0.5);
  font-size: clamp(0.5rem, 0.4vw + 0.25rem, 0.7rem);
}

.bioform-frame__top-spores {
  position: absolute;
  bottom: -2px;
  left: 20px;
  right: 20px;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 255, 65, 0.5) 15%,
    rgba(130, 255, 0, 0.8) 50%,
    rgba(0, 255, 65, 0.5) 85%,
    transparent 100%
  );
}

.bioform-frame__bar--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: rgba(8, 20, 12, 0.92);
  border-top: 1px solid rgba(0, 255, 65, 0.15);
  z-index: 6;
  overflow: hidden;
}

.bioform-frame__veins {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -45deg,
    rgba(0, 255, 65, 0.3) 0px,
    rgba(0, 255, 65, 0.3) 4px,
    rgba(130, 255, 0, 0.1) 4px,
    rgba(130, 255, 0, 0.1) 8px,
    transparent 8px,
    transparent 16px
  );
  background-size: 200% 100%;
  animation: vein-pulse 6s linear infinite;
  opacity: 0.6;
}

@keyframes vein-pulse {
  0% { background-position: 0 0; }
  100% { background-position: -48px 0; }
}

.bioform-frame__side--left,
.bioform-frame__side--right {
  position: fixed;
  top: 40px;
  bottom: 28px;
  width: 14px;
  z-index: 6;
  background: linear-gradient(
    90deg,
    rgba(8, 20, 12, 0.92) 0%,
    rgba(12, 28, 18, 0.85) 50%,
    rgba(8, 20, 12, 0.92) 100%
  );
  border-left: 1px solid rgba(0, 255, 65, 0.1);
  border-right: 1px solid rgba(0, 255, 65, 0.1);
}

.bioform-frame__side--left {
  left: 0;
  border-left: none;
  border-right: 1px solid rgba(0, 255, 65, 0.1);
}

.bioform-frame__side--right {
  right: 0;
  border-right: none;
  border-left: 1px solid rgba(0, 255, 65, 0.1);
}

.bioform-frame__side--left::before,
.bioform-frame__side--right::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 50% 30px, rgba(0, 255, 65, 0.25) 2px, transparent 2px);
  background-size: 100% 60px;
}

.bioform-frame__side--right::before {
  background-image: radial-gradient(circle at 50% 30px, rgba(0, 255, 65, 0.25) 2px, transparent 2px);
  background-size: 100% 60px;
}

.bioform-frame__corner {
  position: fixed;
  width: 24px;
  height: 24px;
  z-index: 7;
}

.bioform-frame__corner--tl {
  top: 0;
  left: 0;
  border-top: 3px solid rgba(0, 255, 65, 0.4);
  border-left: 3px solid rgba(0, 255, 65, 0.4);
}

.bioform-frame__corner--tr {
  top: 0;
  right: 0;
  border-top: 3px solid rgba(0, 255, 65, 0.4);
  border-right: 3px solid rgba(0, 255, 65, 0.4);
}

.bioform-frame__corner--bl {
  bottom: 0;
  left: 0;
  border-bottom: 3px solid rgba(0, 255, 65, 0.4);
  border-left: 3px solid rgba(0, 255, 65, 0.4);
}

.bioform-frame__corner--br {
  bottom: 0;
  right: 0;
  border-bottom: 3px solid rgba(0, 255, 65, 0.4);
  border-right: 3px solid rgba(0, 255, 65, 0.4);
}

.bioform-frame__corner--tl::after,
.bioform-frame__corner--tr::after,
.bioform-frame__corner--bl::after,
.bioform-frame__corner--br::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(0, 255, 65, 0.4);
  box-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
}

.bioform-frame__corner--tl::after { top: 4px; left: 4px; }
.bioform-frame__corner--tr::after { top: 4px; right: 4px; }
.bioform-frame__corner--bl::after { bottom: 4px; left: 4px; }
.bioform-frame__corner--br::after { bottom: 4px; right: 4px; }

.bioform-frame__vignette {
  position: fixed;
  inset: 0;
  z-index: 4;
  background: radial-gradient(
    ellipse at center,
    transparent 65%,
    rgba(0, 20, 5, 0.25) 100%
  );
  pointer-events: none;
}

/* ============================================
   RESPONSIVE ADJUSTMENTS
   ============================================ */
@media (max-width: 760px) {
  .race-frame__bar--top, .bioform-frame__bar--top {
    height: 32px;
  }

  .race-frame__bar--bottom, .bioform-frame__bar--bottom {
    height: 22px;
  }

  .race-frame__side--left, .race-frame__side--right,
  .bioform-frame__side--left, .bioform-frame__side--right {
    top: 32px;
    bottom: 22px;
    width: 10px;
  }

  .race-frame__corner, .bioform-frame__corner {
    width: 18px;
    height: 18px;
  }

  .race-frame__title, .bioform-frame__title {
    font-size: 0.6rem;
    letter-spacing: 0.2em;
  }

  .race-frame__stripes {
    background: repeating-linear-gradient(
      -45deg,
      rgba(240, 184, 0, 0.6) 0px,
      rgba(240, 184, 0, 0.6) 6px,
      rgba(26, 30, 46, 0.95) 6px,
      rgba(26, 30, 46, 0.95) 12px
    );
  }
}
</style>
