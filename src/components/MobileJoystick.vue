<template>
  <div class="joystick-container">
    <div 
      class="joystick-area" 
      @touchstart="onTouchStart" 
      @touchmove="onTouchMove" 
      @touchend="onTouchEnd"
    >
      <div class="joystick-knob" :style="{ transform: `translate(${knobX}px, ${knobY}px)` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { InputManager } from '../engine/managers/InputManager';

const knobX = ref(0);
const knobY = ref(0);
const joystickRadius = 50;

const onTouchStart = (e: TouchEvent) => {
  handleTouch(e);
};

const onTouchMove = (e: TouchEvent) => {
  e.preventDefault(); // Prevent scrolling while using joystick
  handleTouch(e);
};

const onTouchEnd = () => {
  knobX.value = 0;
  knobY.value = 0;
  InputManager.getInstance().setTouchVector(0, 0);
};

const handleTouch = (e: TouchEvent) => {
  const touch = e.touches[0];
  const area = (e.target as HTMLElement).getBoundingClientRect();
  const centerX = area.left + area.width / 2;
  const centerY = area.top + area.height / 2;
  
  let dx = touch.clientX - centerX;
  let dy = touch.clientY - centerY;
  
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > joystickRadius) {
    dx = (dx / distance) * joystickRadius;
    dy = (dy / distance) * joystickRadius;
  }
  
  knobX.value = dx;
  knobY.value = dy;
  
  InputManager.getInstance().setTouchVector(dx / joystickRadius, dy / joystickRadius);
};
</script>

<style scoped>
.joystick-container {
  position: absolute;
  bottom: 40px;
  left: 40px;
  z-index: 1000;
}

.joystick-area {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
}

.joystick-knob {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}
</style>
