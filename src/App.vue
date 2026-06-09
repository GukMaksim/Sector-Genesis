<script setup lang="ts">
import { ref } from 'vue'
import GameView from './components/GameView.vue'
import RaceSelection from './components/RaceSelection.vue'

const gameStarted = ref(false)

const handleStart = () => {
  gameStarted.value = true
}
</script>

<template>
  <RaceSelection v-if="!gameStarted" @start="handleStart" />
  <GameView v-else />
</template>
