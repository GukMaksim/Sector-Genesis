<template>
  <div v-if="race === 'HUMANS'" class="race-frame">
    <!-- Scan lines overlay (top-most layer) -->
    <div class="race-frame__scanlines" />

    <!-- Top bar -->
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

    <!-- Bottom bar with warning stripes -->
    <div class="race-frame__bar race-frame__bar--bottom">
      <div class="race-frame__stripes" />
    </div>

    <!-- Left side bar -->
    <div class="race-frame__side race-frame__side--left" />

    <!-- Right side bar -->
    <div class="race-frame__side race-frame__side--right" />

    <!-- Corner L-brackets -->
    <div class="race-frame__corner race-frame__corner--tl" />
    <div class="race-frame__corner race-frame__corner--tr" />
    <div class="race-frame__corner race-frame__corner--bl" />
    <div class="race-frame__corner race-frame__corner--br" />

    <!-- Vignette overlay for edge darkening -->
    <div class="race-frame__vignette" />
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

/* --- Top Bar --- */
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

/* --- Bottom Bar with Warning Stripes --- */
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
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -64px 0;
  }
}

/* --- Side Bars --- */
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

/* Rivet dots on side bars */
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

/* --- Corner L-Brackets --- */
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

/* Extra rivets on corners */
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

/* Inner corner triangles (decorative) */
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

/* --- Scan Lines Overlay --- */
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

/* --- Vignette (edge darkening) --- */
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
   RESPONSIVE ADJUSTMENTS
   ============================================ */
@media (max-width: 760px) {
  .race-frame__bar--top {
    height: 32px;
  }

  .race-frame__bar--bottom {
    height: 22px;
  }

  .race-frame__side--left,
  .race-frame__side--right {
    top: 32px;
    bottom: 22px;
    width: 10px;
  }

  .race-frame__corner {
    width: 18px;
    height: 18px;
  }

  .race-frame__title {
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
