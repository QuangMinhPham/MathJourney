<template>
  <transition name="fade">
    <div v-if="isLoading" class="loading-screen">
      <!-- Animated Waves Background -->
      <div class="waves-background">
        <svg class="waves-svg" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" class="text-white" opacity=".5"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" class="text-white"></path>
        </svg>
      </div>

      <div class="loading-content">
        <!-- Animated Ship -->
        <div class="ship-container">
          <div class="ship-bounce">
            <svg class="ship-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
            </svg>
          </div>
          <div class="wave-dots">
            <div class="dot" style="animation-delay: 0s"></div>
            <div class="dot" style="animation-delay: 0.2s"></div>
            <div class="dot" style="animation-delay: 0.4s"></div>
          </div>
        </div>

        <!-- Loading Text -->
        <h2 class="loading-title">Đang Khám Phá...</h2>
        <p class="loading-subtitle">Thuyền đang tiến vào vùng biển tri thức</p>

        <!-- Loading Bar -->
        <div class="loading-bar-container">
          <div class="loading-bar"></div>
        </div>

        <!-- Decorative Icons -->
        <div class="decorative-icons">
          <span class="icon" style="animation-delay: 0s">⚓</span>
          <span class="icon" style="animation-delay: 0.2s">🐚</span>
          <span class="icon" style="animation-delay: 0.4s">💎</span>
          <span class="icon" style="animation-delay: 0.6s">🏆</span>
        </div>
      </div>

      <!-- Floating Compass -->
      <div class="compass compass-top">
        <svg class="compass-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </div>
      <div class="compass compass-bottom">
        <svg class="compass-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(to bottom, #38bdf8, #22d3ee, #3b82f6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.waves-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.2;
}

.waves-svg {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 16rem;
  animation: pulse 2s ease-in-out infinite;
}

.loading-content {
  position: relative;
  z-index: 10;
  text-align: center;
}

.ship-container {
  margin-bottom: 2rem;
  position: relative;
}

.ship-bounce {
  animation: bounce 2s ease-in-out infinite;
}

.ship-icon {
  width: 8rem;
  height: 8rem;
  color: white;
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));
  margin: 0 auto;
}

.wave-dots {
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 0.75rem;
  height: 0.75rem;
  background: white;
  border-radius: 50%;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.loading-title {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
  margin-bottom: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  margin-bottom: 2rem;
}

.loading-bar-container {
  width: 20rem;
  height: 1rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  margin: 0 auto;
}

.loading-bar {
  height: 100%;
  width: 70%;
  background: linear-gradient(to right, #facc15, #f97316, #facc15);
  border-radius: 9999px;
  animation: pulse 1.5s ease-in-out infinite;
}

.decorative-icons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 3.75rem;
}

.icon {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

.compass {
  position: absolute;
  animation: spin 8s linear infinite;
}

.compass-top {
  top: 5rem;
  right: 5rem;
}

.compass-bottom {
  bottom: 5rem;
  left: 5rem;
  animation: spin 10s linear infinite reverse;
}

.compass-icon {
  width: 6rem;
  height: 6rem;
  color: rgba(255, 255, 255, 0.3);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>