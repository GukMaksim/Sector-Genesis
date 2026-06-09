<template>
  <div v-if="show" class="overlay overlay--upgrade">
    <div class="overlay-shell overlay-shell--choice">
      <div class="overlay-header">
        <div class="panel-kicker">TERRAN ARMORY</div>
        <h2 class="overlay-title">Meta-Upgrades</h2>
        <p class="overlay-copy">
          Permanent enhancements that persist across all deployments. Spend credits earned from previous runs.
        </p>
      </div>

      <div class="meta-header">
        <span class="credit-display">CREDITS: <strong>{{ metaManager.getCredits() }}</strong></span>
      </div>

      <div class="meta-list">
        <div v-for="meta in metaDefs" :key="meta.id" class="meta-item">
          <div class="meta-item__info">
            <div class="meta-item__name">{{ meta.name }}</div>
            <div class="meta-item__desc">{{ meta.description }}</div>
            <div class="meta-item__level">
              Level {{ metaManager.getLevel(meta.id) }} / {{ meta.maxLevel }}
            </div>
          </div>
          <div class="meta-item__action">
            <span v-if="metaManager.getLevel(meta.id) >= meta.maxLevel" class="meta-maxed">MAXED</span>
            <button
              v-else
              class="meta-buy-btn"
              :disabled="metaManager.getCredits() < metaManager.getCost(meta.id)"
              @click="purchase(meta.id)"
            >
              {{ metaManager.getCost(meta.id) }} CR
            </button>
          </div>
        </div>
      </div>

      <div class="tree-footer">
        <button class="cta-button cta-button--secondary" @click="$emit('close')">
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { metaManager } from '../upgrades/meta/MetaUpgradeManager'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const metaDefs = computed(() => metaManager.getAllDefs())

const purchase = (id: string) => {
  metaManager.purchase(id)
  emit('close')
}
</script>

<style scoped>
.meta-header {
  text-align: center;
  margin-bottom: 16px;
}

.credit-display {
  font-size: 1.2rem;
  color: #ffd700;
  letter-spacing: 1px;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.meta-item__info {
  flex: 1;
}

.meta-item__name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0f0f0;
  margin-bottom: 4px;
}

.meta-item__desc {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 4px;
}

.meta-item__level {
  font-size: 0.7rem;
  color: #555;
}

.meta-item__action {
  min-width: 80px;
  text-align: center;
}

.meta-buy-btn {
  padding: 8px 16px;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid #ffd700;
  border-radius: 6px;
  color: #ffd700;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.meta-buy-btn:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.3);
}

.meta-buy-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.meta-maxed {
  color: #00ff00;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 2px;
}
</style>
