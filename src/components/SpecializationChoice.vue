<template>
  <div v-if="show" class="overlay overlay--upgrade">
    <div class="overlay-shell overlay-shell--choice">
      <div class="overlay-header">
        <div class="panel-kicker">SPECIALIZATION AVAILABLE</div>
        <h2 class="overlay-title">Choose Your Path</h2>
        <p class="overlay-copy">
          At level 10, you may select a combat specialization. This choice is permanent for the run.
        </p>
      </div>

      <div class="spec-grid">
        <button
          v-for="spec in specs"
          :key="spec.id"
          class="spec-card"
          :class="{ 'spec-card--disabled': currentSpec !== null && currentSpec !== spec.id }"
          :disabled="currentSpec !== null && currentSpec !== spec.id"
          @click="$emit('pick', spec.id)"
        >
          <div class="spec-card__name">{{ spec.name }}</div>
          <div class="spec-card__desc">{{ spec.description }}</div>
          <div class="spec-card__nodes">
            <div v-for="node in spec.nodes" :key="node.id" class="spec-card__node">
              <span class="spec-card__node-level">LV{{ node.requiredLevel }}</span>
              <span class="spec-card__node-name">{{ node.name }}</span>
            </div>
          </div>
        </button>
      </div>

      <div class="tree-footer">
        <button class="cta-button cta-button--secondary" @click="$emit('skip')">
          Decide Later
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SPECIALIZATIONS } from '../upgrades/specializations'

defineProps<{
  show: boolean
  currentSpec: string | null
}>()

defineEmits<{
  pick: [id: string]
  skip: []
}>()

const specs = SPECIALIZATIONS
</script>

<style scoped>
.spec-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
}

.spec-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.spec-card:hover:not(:disabled) {
  border-color: #00f2ff;
  background: rgba(0, 242, 255, 0.1);
}

.spec-card--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spec-card__name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.spec-card__desc {
  font-size: 0.85rem;
  color: #aaa;
  margin-bottom: 12px;
  line-height: 1.3;
}

.spec-card__nodes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-card__node {
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
  color: #888;
}

.spec-card__node-level {
  color: #00f2ff;
  font-weight: 600;
  min-width: 30px;
}

.spec-card__node-name {
  color: #ccc;
}
</style>
