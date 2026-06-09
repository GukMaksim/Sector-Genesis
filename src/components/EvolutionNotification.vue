<template>
  <Transition name="evo-fade">
    <div v-if="show" class="evolution-overlay">
      <div class="evolution-card">
        <div class="evolution-icon">🔥</div>
        <div class="evolution-title">EVOLUTION UNLOCKED!</div>
        <div class="evolution-name">{{ name }}</div>
        <div class="evolution-desc">{{ description }}</div>
        <button class="evolution-continue" @click="$emit('dismiss')">CONTINUE</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  name: string
  description: string
}>()

defineEmits<{
  dismiss: []
}>()
</script>

<style scoped>
.evolution-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
}

.evolution-card {
  background: linear-gradient(135deg, #1a0a2e, #16213e);
  border: 2px solid #a335ee;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  animation: pulse-glow 1s ease-in-out infinite alternate;
}

.evolution-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.evolution-title {
  font-size: 1.2rem;
  color: #a335ee;
  letter-spacing: 3px;
  margin-bottom: 8px;
}

.evolution-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.evolution-desc {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 24px;
  line-height: 1.4;
}

.evolution-continue {
  padding: 12px 32px;
  background: #a335ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 2px;
}

.evolution-continue:hover {
  background: #b845f0;
}

@keyframes pulse-glow {
  from { box-shadow: 0 0 20px rgba(163, 53, 238, 0.3); }
  to { box-shadow: 0 0 40px rgba(163, 53, 238, 0.6); }
}

.evo-fade-enter-active,
.evo-fade-leave-active {
  transition: opacity 0.5s ease;
}

.evo-fade-enter-from,
.evo-fade-leave-to {
  opacity: 0;
}
</style>
