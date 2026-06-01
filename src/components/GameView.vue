<template>
  <div id="game-container" class="relative w-full h-full overflow-hidden bg-[#2a2520]">
    <!-- HUD Overlay -->
    <div v-if="!loading" class="absolute top-0 left-0 w-full p-4 pointer-events-none z-10">
      <!-- XP Bar (Enhanced) -->
      <div class="w-full h-4 bg-gray-900 border border-sci-fi-blue/20 rounded-sm overflow-hidden mb-2 shadow-[0_0_10px_rgba(0,242,255,0.1)] relative">
        <div 
          class="h-full bg-gradient-to-r from-sci-fi-blue/50 to-sci-fi-blue shadow-[0_0_15px_rgba(0,242,255,0.5)] transition-all duration-300 relative" 
          :style="{ width: gameStore.xpPercentage + '%' }"
        >
            <div class="absolute inset-0 bg-white/10 animate-pulse"></div>
        </div>
        <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference tracking-tighter">
            NEXT LEVEL PROGRESS: {{ Math.floor(gameStore.xpPercentage) }}%
        </div>
      </div>
      
      <div class="flex justify-between items-start text-white font-mono">
        <div>
          <div class="text-xs text-sci-fi-blue">OPERATIVE STATUS</div>
          <div class="text-xl font-bold uppercase tracking-wider">{{ gameStore.currentStage.name }}</div>
          <div class="text-sm opacity-70">LEVEL {{ gameStore.level }}</div>
        </div>

        <div class="flex flex-col items-center">
            <div class="text-xs text-sci-fi-green mb-1">SHIELD INTEGRITY</div>
            <div class="w-48 h-4 bg-gray-800 border border-sci-fi-green/30 rounded-sm overflow-hidden">
                <div 
                    class="h-full bg-sci-fi-green transition-all duration-300" 
                    :style="{ width: (playerHealthPercentage) + '%' }"
                ></div>
            </div>
        </div>
        
        <div class="text-right">
          <div class="text-xs text-sci-fi-red">THREAT ELIMINATED</div>
          <div class="text-2xl font-bold">{{ gameStore.kills }}</div>
        </div>
      </div>
    </div>

    <!-- Upgrade Overlay -->
    <div v-if="gameStore.showUpgradeOverlay" class="absolute inset-0 flex items-center justify-center bg-black/80 z-40 backdrop-blur-sm">
      <div class="max-w-4xl w-full p-8">
        <h2 class="text-4xl font-black text-sci-fi-blue mb-8 text-center italic tracking-widest">ENHANCEMENT AVAILABLE</h2>
        <div class="grid grid-cols-3 gap-6">
          <button 
            v-for="upgrade in gameStore.availableUpgrades" 
            :key="upgrade.id"
            @click="gameStore.applyUpgrade(upgrade)"
            class="group relative bg-gray-900 border-2 border-sci-fi-blue/30 hover:border-sci-fi-blue p-6 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,242,255,0.3)]"
          >
            <div class="text-xl font-bold text-white mb-2 uppercase">{{ upgrade.name }}</div>
            <div class="text-sm text-gray-400 mb-4">{{ upgrade.description }}</div>
            <div class="text-xs text-sci-fi-blue font-bold opacity-0 group-hover:opacity-100 transition-opacity">INSTALL MODULE</div>
            
            <!-- Decorative corners -->
            <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sci-fi-blue opacity-50"></div>
            <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sci-fi-blue opacity-50"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Game Over Overlay -->
    <div v-if="gameStore.isGameOver" class="absolute inset-0 flex items-center justify-center bg-black/95 z-50 backdrop-blur-md">
      <div class="text-center p-12 border-2 border-sci-fi-red bg-gray-950/50 shadow-[0_0_50px_rgba(255,0,60,0.2)]">
        <h2 class="text-6xl font-black text-sci-fi-red mb-4 italic tracking-tighter">MISSION FAILED</h2>
        <div class="text-xl text-gray-400 mb-8 uppercase tracking-widest font-mono">Operative terminated in Sector Genesis</div>
        
        <div class="grid grid-cols-2 gap-8 mb-12 text-left font-mono">
            <div class="border-l-2 border-gray-800 pl-4">
                <div class="text-xs text-gray-500">THREATS ELIMINATED</div>
                <div class="text-3xl font-bold text-white">{{ gameStore.kills }}</div>
            </div>
            <div class="border-l-2 border-gray-800 pl-4">
                <div class="text-xs text-gray-500">FINAL LEVEL REACHED</div>
                <div class="text-3xl font-bold text-white">{{ gameStore.level }}</div>
            </div>
        </div>

        <button 
          @click="restartGame"
          class="px-12 py-4 bg-sci-fi-red text-black font-black text-xl hover:bg-white transition-colors uppercase tracking-widest"
        >
          Re-deploy to Sector
        </button>
      </div>
    </div>

    <!-- UI Overlay will go here -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-white bg-[#2a2520] z-50">
      <div class="text-2xl font-bold animate-pulse tracking-[0.5em]">LOADING SECTOR...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../stores/gameStore';

const loading = ref(true);
const gameStore = useGameStore();
const engineInstance = ref<GameEngine | null>(null);

const playerHealthPercentage = computed(() => {
    if (!engineInstance.value?.player) return 100;
    return (engineInstance.value.player.currentHealth / engineInstance.value.player.maxHealth) * 100;
});

const restartGame = () => {
    window.location.reload();
};

onMounted(async () => {
  const engine = await GameEngine.getInstance();
  engineInstance.value = engine;
  await engine.init({
    resizeTo: window,
    backgroundColor: 0x2a2520,
    antialias: true,
  });
  
  loading.value = false;
  
  window.addEventListener('resize', () => {
    engine.app.renderer.resize(window.innerWidth, window.innerHeight);
  });
});
</script>

<style scoped>
#game-container {
  width: 100vw;
  height: 100vh;
}
</style>
