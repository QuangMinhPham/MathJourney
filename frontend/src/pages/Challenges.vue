<template>
  <div class="challenges-page">
    <div class="overlay"></div>

    <div id="app-container">
      <h1>🏴‍☠️ Bản Đồ Kho Báu 🪙</h1>

      <div class="map-container">
        <svg class="path-svg" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path class="path-line" d="M 150 200 Q 500 350 850 200" />
        </svg>

        <div 
          v-for="(challenge, index) in challenges" 
          :key="challenge.id" 
          class="island-wrapper"
          @click="goToChallenge(challenge.id)"
          :style="{ marginTop: index === 1 ? '80px' : '0' }" 
        >
          <div class="island-icon">
              <img 
                v-if="challenge.icon && !imageErrors[index]" 
                :src="challenge.icon" 
                :alt="challenge.name" 
                @error="handleImageError(index)"
              >
              <i v-else :class="getIconClass(index)"></i>
          </div>

          <div class="island-info">
            <h2>{{ challenge.name }}</h2>
            <p>{{ challenge.des }}</p>
          </div>
        </div>
      </div>

      <button class="back-btn" @click="goBack">
        <i class="fa-solid fa-map"></i> Quay lại bài học
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChallengesMap',
  data() {
    return {
      // Lấy chapterId từ tham số đường dẫn (URL)
      chapterId: this.$route.params.chapterId || 1,
      imageErrors: {}, // Theo dõi các icon bị lỗi load ảnh
      challenges: [
        { 
          id: 1, 
          name: "Dọn dẹp rác biển", 
          icon: "/images/quiz_icon.png", 
          des: "Trả lời câu hỏi trắc nghiệm để qua cửa" 
        },
        { 
          id: 2, 
          name: "Rương Kho Báu", 
          icon: "/images/matching_icon.jpg", 
          des: "Tìm chìa khóa đúng để mở rương" 
        },
        { 
          id: 3, 
          name: "Mật Mã Cổ Đại", 
          icon: "/images/short_icon.png", 
          des: "Điền đáp án nhanh để giải mã" 
        }
      ]
    }
  },
  methods: {
    // Điều hướng đến: /lessons/1/challenge-1, /lessons/2/challenge-1...
    goToChallenge(challengeId) {
      this.$router.push(`/lessons/${this.chapterId}/challenge-${challengeId}`);
    },
    // Quay lại danh sách bài học chung
    goBack() {
      this.$router.push('/lessons');
    },
    // Trả về class icon dự phòng nếu không load được ảnh
    getIconClass(index) {
      const icons = ["fa-question", "fa-key", "fa-feather-pointed"];
      return `fa-solid ${icons[index]}`;
    },
    // Xử lý khi đường dẫn ảnh bị sai hoặc thiếu
    handleImageError(index) {
      this.imageErrors[index] = true;
    }
  }
}
</script>

<style scoped>
/* Toàn bộ CSS giao diện cũ được giữ nguyên và đóng gói trong scoped */
.challenges-page {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  min-height: 100vh;
  /* Lưu ý: Đường dẫn ảnh nền nên để bắt đầu bằng dấu / để Vite tìm đúng trong public */
  background: url('/images/treasure_map.jpg') no-repeat center center/cover;
  background-color: #2b5876;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 30, 60, 0.4);
  z-index: 0;
}

#app-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1000px;
  text-align: center;
}

h1 {
  font-family: 'Indie Flower', cursive;
  font-size: 3.5rem;
  color: #ffd700;
  text-shadow: 4px 4px 0px #3e2723;
  margin-bottom: 50px;
  letter-spacing: 2px;
}

.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px 0;
}

.path-svg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
}

.path-line {
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-dasharray: 15, 10;
  stroke-linecap: round;
  filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.5));
  opacity: 0.7;
}

.island-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

.island-wrapper:hover {
  transform: translateY(-15px) scale(1.05);
}

.island-icon {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 30% 30%, #ffd700, #ff8c00);
  border: 4px solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4), inset 0 -5px 10px rgba(0,0,0,0.2);
  margin-bottom: 15px;
  position: relative;
}

.island-icon::after {
  content: '';
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

.island-icon img {
  width: 60%;
  height: 60%;
  object-fit: contain;
  filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));
}

.island-icon i {
  font-size: 40px;
  color: #8B4513;
}

.island-info {
  background: #5d4037;
  border: 3px solid #8d6e63;
  padding: 10px 15px;
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  position: relative;
  width: 100%;
}

.island-info::before, .island-info::after {
  content: '';
  position: absolute;
  top: 8px;
  width: 6px; height: 6px;
  background: #aaa;
  border-radius: 50%;
  box-shadow: inset 1px 1px 2px #000;
}
.island-info::before { left: 8px; }
.island-info::after { right: 8px; }

.island-info h2 {
  margin: 0;
  font-size: 1.1rem;
  font-family: 'Indie Flower', cursive;
  color: #ffeb3b;
}

.island-info p {
  margin: 5px 0 0;
  font-size: 0.85rem;
  color: #d7ccc8;
}

.back-btn {
  margin-top: 60px;
  padding: 12px 35px;
  font-size: 1.1rem;
  border: none;
  background: #ff5722;
  color: white;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(255, 87, 34, 0.4);
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.back-btn:hover {
  background: #e64a19;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
    height: auto;
    gap: 50px;
  }
  .path-svg { display: none; }
  .map-container::before {
    content: '';
    position: absolute;
    top: 50px; bottom: 50px; left: 50%;
    width: 4px;
    background: repeating-linear-gradient(to bottom, #fff 0, #fff 10px, transparent 10px, transparent 20px);
    transform: translateX(-50%);
    z-index: 0;
    opacity: 0.5;
  }
}
</style>