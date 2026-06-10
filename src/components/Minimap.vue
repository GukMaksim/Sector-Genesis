
<template>
  <div class="minimap-container" :class="{ 'minimap--terran': isTerran }">
    <canvas ref="canvas" :width="size" :height="size"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { GameEngine } from '../engine/GameEngine';

const gameStore = useGameStore();
const isTerran = computed(() => gameStore.race === 'HUMANS');

const size = 150;
const canvas = ref<HTMLCanvasElement | null>(null);
const worldScale = 0.05; // Adjust this to show more/less area

let animationId: number;

const draw = async () => {
  const engine = await GameEngine.getInstance();
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !engine.player) {
    animationId = requestAnimationFrame(draw);
    return;
  }

  // Clear
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, size, size);
  
  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);

  const centerX = size / 2;
  const centerY = size / 2;

  // Draw Background Tiles
  const gridSize = 256;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  engine.background?.tiles.forEach((tileData) => {
    const dx = (tileData.container.x - engine.player!.container.x) * worldScale;
    const dy = (tileData.container.y - engine.player!.container.y) * worldScale;

    if (Math.abs(dx) < size / 2 + (gridSize * worldScale) && Math.abs(dy) < size / 2 + (gridSize * worldScale)) {
      ctx.fillStyle = 'rgba(40, 45, 35, 0.6)';
      ctx.fillRect(centerX + dx, centerY + dy, gridSize * worldScale, gridSize * worldScale);
    }
  });

  // Draw Obstacles
  engine.obstacles.forEach(obs => {
    if (obs.isDestroyed) return;
    const dx = (obs.container.x - engine.player!.container.x) * worldScale;
    const dy = (obs.container.y - engine.player!.container.y) * worldScale;

    if (Math.abs(dx) < size / 2 && Math.abs(dy) < size / 2) {
      const s = Math.max(2, obs.radius * worldScale);
      if (obs.obstacleType === 'trees') {
        ctx.fillStyle = '#2a5a2a';
      } else if (obs.obstacleType === 'water') {
        ctx.fillStyle = '#1a4a6a';
      } else if (obs.obstacleType === 'building') {
        ctx.fillStyle = '#666677';
      } else {
        ctx.fillStyle = '#555555';
      }
      ctx.fillRect(centerX + dx - s / 2, centerY + dy - s / 2, s, s);
    }
  });

  // Draw Resource Nodes
  engine.resourceNodes.forEach(node => {
    if (node.isDestroyed) return;
    const dx = (node.container.x - engine.player!.container.x) * worldScale;
    const dy = (node.container.y - engine.player!.container.y) * worldScale;
    
    if (Math.abs(dx) < size / 2 && Math.abs(dy) < size / 2) {
      ctx.fillStyle = node.nodeType === 'mineral' ? '#00f2ff' : '#00ff00';
      ctx.beginPath();
      ctx.arc(centerX + dx, centerY + dy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw Enemies
  engine.enemies.forEach(enemy => {
    if (enemy.isDestroyed) return;
    const dx = (enemy.container.x - engine.player!.container.x) * worldScale;
    const dy = (enemy.container.y - engine.player!.container.y) * worldScale;
    
    if (Math.abs(dx) < size / 2 && Math.abs(dy) < size / 2) {
      ctx.fillStyle = enemy.isBoss ? '#ff00ff' : '#ff0000';
      ctx.beginPath();
      ctx.arc(centerX + dx, centerY + dy, enemy.isBoss ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw Player (always at center)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Add a small border to player to make it pop
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();

  animationId = requestAnimationFrame(draw);
};

onMounted(() => {
  draw();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.minimap-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 150px;
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 242, 255, 0.2);
  pointer-events: none;
  border: 1px solid rgba(0, 242, 255, 0.3);
  background: rgba(0, 8, 15, 0.8);
  z-index: 100;
}

.minimap-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 242, 255, 0.05) 3px
  );
  pointer-events: none;
}
</style>
