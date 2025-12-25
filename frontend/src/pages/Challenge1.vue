<template>
  <div class="challenge1-body">
    <div id="bubble-container" ref="bubbleContainer"></div>

    <div v-if="showOverlay" id="overlay-bg"></div>

    <div v-if="isPaused && !gameEnded && !currentQuestion" id="pauseOverlay">
      <div class="pause-content">
        <h1>Đang Tạm Dừng ⏸️</h1>
        <button class="resume-btn" @click="togglePause">Tiếp tục chơi ▶️</button>
      </div>
    </div>

    <router-link id="backBtn" :to="`/lessons/${chapterId}/challenges`">
      <i class="fa-solid fa-arrow-left"></i> Quay lại
    </router-link>

    <div id="gameInfo">
      <span>⏳ <span id="timer" :class="{ 'danger-text': totalTime < 60 }">{{ formattedTime }}</span></span>
      <span style="color:#ddd">|</span>
      <span>⭐ <span id="score">{{ score }}</span></span>
      <span style="color:#ddd">|</span>
      <button class="control-btn" @click="togglePause" title="Tạm dừng">
        <i class="fa-solid" :class="isPaused ? 'fa-play' : 'fa-pause'"></i>
      </button>
    </div>

    <img 
      v-for="(trash, index) in trashItems" 
      :key="index"
      :src="trash.image"
      class="trash"
      :class="{ 'disabled': trash.disabled }"
      :style="{ left: trash.x + 'px', top: trash.y + 'px', animationDelay: (index * 0.2) + 's' }"
      @click="handleTrashClick(index)"
      @error="handleImgError"
    >

    <div v-if="currentQuestion" id="questionBox" class="modal-box">
      <div style="font-size: 50px; margin-bottom: 10px;">🤔</div>
      <p id="questionText">{{ currentQuestion.text }}</p>
      <div id="answers">
        <button 
          v-for="(opt, idx) in currentQuestion.options" 
          :key="idx" 
          @click="checkAnswer(idx)"
          :disabled="isAnswering"
          :class="{
            'correct-ans': isAnswering && idx === currentQuestion.correctIndex,
            'wrong-ans': isAnswering && selectedIdx === idx && idx !== currentQuestion.correctIndex
          }"
        >
          {{ opt }}
        </button>
      </div>
    </div>

    <div v-if="gameEnded" id="resultBox" class="modal-box">
      <div style="font-size: 60px; margin-bottom: 10px;">🏆</div>
      <h2>Hoàn Thành!</h2>
      <div id="finalMessage">
        <h3 :style="{ color: score >= successThreshold ? '#06d6a0' : '#ffb703', margin: '10px 0' }">
          {{ resultText }}
        </h3>
        <div style="margin-top: 20px;">
          <button class="end-btn btn-secondary" @click="restartGame">🔁 Chơi lại</button>
          <button class="end-btn btn-primary" @click="$router.push(`/lessons/${chapterId}/challenges`)">➡️ Tiếp tục</button>
          <button class="end-btn btn-info" @click="$router.push('/')">🏠 Về nhà</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';

// === CONFIG ===
const route = useRoute();
const chapterId = route.params.chapterId || 1;
const STORAGE_KEY = `trash_game_time_ch${chapterId}`;
const DEFAULT_TIME = 600;

// === STATE ===
const trashImages = ["bottle.png", "can1.png", "can2.png", "bag.png", "apple.png", "banana.png", "paper.png", "glass.png"];
const gameQuestions = ref([]);
const trashItems = ref([]);
const totalTime = ref(DEFAULT_TIME);
const score = ref(0);
const isPaused = ref(false);
const gameEnded = ref(false);
const activeQuestionIndex = ref(null);
const bubbleContainer = ref(null);
let timerInterval = null;
let bubbleInterval = null;

// Thêm state mới để phục vụ hiệu ứng chọn đáp án
const isAnswering = ref(false);
const selectedIdx = ref(null);

// === COMPUTED ===
const formattedTime = computed(() => {
  const min = Math.floor(totalTime.value / 60);
  const sec = totalTime.value % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
});

const currentQuestion = computed(() => {
  return activeQuestionIndex.value !== null ? gameQuestions.value[activeQuestionIndex.value] : null;
});

const showOverlay = computed(() => currentQuestion.value || gameEnded.value);

const successThreshold = computed(() => gameQuestions.value.length * 10 * 0.8);

const resultText = computed(() => {
  return score.value >= successThreshold.value ? `Xuất sắc! +${score.value} điểm` : `Hoàn thành! +${score.value} điểm`;
});

// === METHODS ===
const fetchQuestions = async () => {
  try {
    const res = await fetch(`/api/${chapterId}/challenge-1`);
    const data = await res.json();
    
    if (data.questions && data.questions.length > 0) {
      gameQuestions.value = data.questions.map(q => {
        const correctIndex = q.options.findIndex(opt => opt.is_correct === 1);
        return {
          text: q.question_text,
          options: q.options.map(opt => opt.option_text),
          correctIndex: correctIndex
        };
      });
    } else {
      gameQuestions.value = [
        { text: "Rác nào lâu phân hủy nhất?", options: ["Táo", "Giấy", "Chai nhựa"], correctIndex: 2 },
        { text: "Rùa biển hay ăn nhầm cái gì?", options: ["Túi nilon", "Cát", "Rong biển"], correctIndex: 0 }
      ];
    }
    spawnTrash();
    initTimer();
  } catch (err) {
    console.error("Lỗi API:", err);
  }
};

const spawnTrash = () => {
  const count = gameQuestions.value.length;
  const positions = [];
  const items = [];
  const headerSafe = 100;

  for (let i = 0; i < count; i++) {
    let x, y, valid, attempts = 0;
    do {
      valid = true;
      x = Math.random() * (window.innerWidth - 120) + 20;
      y = Math.random() * (window.innerHeight - 150 - headerSafe) + headerSafe;
      for (let pos of positions) {
        if (Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2)) < 110) {
          valid = false; break;
        }
      }
      attempts++;
    } while (!valid && attempts < 100);

    positions.push({ x, y });
    items.push({
      x, y,
      disabled: false,
      image: `/images/${trashImages[i % trashImages.length]}`
    });
  }
  trashItems.value = items;
};

const handleTrashClick = (index) => {
  if (!isPaused.value && !trashItems.value[index].disabled) {
    activeQuestionIndex.value = index;
    isPaused.value = true;
  }
};

const checkAnswer = (idx) => {
  if (isAnswering.value) return;

  selectedIdx.value = idx;
  isAnswering.value = true;

  const correct = gameQuestions.value[activeQuestionIndex.value].correctIndex;
  const isCorrect = idx === correct;

  // Hiệu ứng delay để người dùng thấy màu xanh/đỏ
  setTimeout(() => {
    if (isCorrect) {
      score.value += 10;
    }
    
    trashItems.value[activeQuestionIndex.value].disabled = true;

    // Reset trạng thái sau khi đã hiển thị xong hiệu ứng
    isAnswering.value = false;
    selectedIdx.value = null;
    activeQuestionIndex.value = null;
    isPaused.value = false;

    if (trashItems.value.every(item => item.disabled)) {
      endGame();
    }
  }, 1000); // Đợi 1 giây
};

const initTimer = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && parseInt(saved) > 0) {
    totalTime.value = parseInt(saved);
  }
  timerInterval = setInterval(() => {
    if (!isPaused.value && !gameEnded.value) {
      totalTime.value--;
      localStorage.setItem(STORAGE_KEY, totalTime.value);
      if (totalTime.value <= 0) endGame();
    }
  }, 1000);
};

const togglePause = () => {
  if (!gameEnded.value && activeQuestionIndex.value === null) {
    isPaused.value = !isPaused.value;
  }
};

const endGame = () => {
  gameEnded.value = true;
  clearInterval(timerInterval);
  localStorage.removeItem(STORAGE_KEY);
  saveScoreToDB();
};

const saveScoreToDB = async () => {
  const token = localStorage.getItem("token");
  const challengeId = 1 + ((chapterId - 1) * 3); 
  
  try {
    await fetch("/api/scores/save", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        chapter_id: chapterId, 
        challenge_id: challengeId, 
        score: score.value 
      })
    });
  } catch(e) {  
    console.error("Lỗi lưu điểm:", e); 
  }
};

const restartGame = () => window.location.reload();

const createBubbles = () => {
  bubbleInterval = setInterval(() => {
    if (!bubbleContainer.value) return;
    const size = Math.random() * 30 + 15;
    const bubble = document.createElement('div');
    bubble.className = 'bubble-vue';
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    const duration = Math.random() * 7 + 5;
    bubble.style.animationDuration = duration + 's';
    
    bubbleContainer.value.appendChild(bubble);
    setTimeout(() => bubble.remove(), 15000);
  }, 800);
};

const handleImgError = (e) => {
  e.target.src = 'https://cdn-icons-png.flaticon.com/512/3299/3299901.png';
};

// === LIFECYCLE ===
onMounted(() => {
  fetchQuestions();
  createBubbles();
});

onUnmounted(() => {
  clearInterval(timerInterval);
  clearInterval(bubbleInterval);
});
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.challenge1-body {
  margin: 0; height: 100vh; overflow: hidden;
  background: url("/images/bg_ch1_2.jpg") no-repeat center center/cover;
  background-color: #0077b6;
  font-family: "Inter", sans-serif;
  position: relative;
  width: 100vw;
}

.challenge1-body::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,180,216,0.1), rgba(0,0,0,0.3));
  pointer-events: none; z-index: 0;
}

/* HUD & UI */
#gameInfo {
  position: fixed; top: 20px; right: 20px;
  background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px);
  padding: 10px 20px; border-radius: 50px;
  border: 3px solid #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  display: flex; align-items: center; gap: 15px;
  font-weight: 700; font-size: 18px; z-index: 1000;
}

#backBtn {
  position: fixed; top: 20px; left: 20px;
  background: rgba(255, 255, 255, 0.85); padding: 10px 20px; border-radius: 30px;
  border: 3px solid #fff; font-weight: bold;
  z-index: 1000; text-decoration: none; color: #2b2d42;
  display: flex; align-items: center; gap: 10px;
}

.control-btn { background: none; border: none; cursor: pointer; font-size: 20px; }

/* RÁC */
.trash {
  width: 80px; height: 80px; position: absolute; cursor: pointer; z-index: 10;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
  transition: transform 0.3s ease, opacity 0.3s;
  animation: float 3s ease-in-out infinite;
}
.trash.disabled { filter: grayscale(100%) brightness(0.4); pointer-events: none; opacity: 0; transform: scale(0); }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

/* MODALS */
.modal-box {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: #fff; padding: 30px; border-radius: 25px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4); width: 90%; max-width: 500px;
  text-align: center; z-index: 1001; border: 4px solid #90e0ef;
}

#overlay-bg {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4); z-index: 999; backdrop-filter: blur(2px);
}

#questionText {
  font-size: 1.5rem;
  font-weight: 600;
}

#answers button {
  display: block; width: 100%; margin: 12px 0; padding: 15px;
  border: none; border-radius: 15px; background: #f0f4f8;
  cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.2s;
}
#answers button:hover:not(:disabled) { background: #90e0ef; color: #fff; }

/* CSS Màu sắc cho đáp án */
.correct-ans {
  background-color: #0ee443 !important;
  color: white !important;
  transform: scale(1.05);
}

.wrong-ans {
  background-color: #ff2525 !important;
  color: white !important;
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.end-btn {
  display: inline-block; width: 45%; margin: 5px; padding: 12px 10px;
  border: none; border-radius: 12px; color: white; cursor: pointer; font-weight: 700;
}
.btn-primary { background: #06d6a0; }
.btn-secondary { background: #00b4d8; }
.btn-info { background: #ffb703; }

/* BONG BÓNG */
#bubble-container { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
:deep(.bubble-vue) {
  position: absolute; bottom: -50px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: rise linear infinite;
}

@keyframes rise {
  0% { bottom: -50px; transform: translateX(0); opacity: 0; }
  20% { opacity: 0.6; }
  100% { bottom: 110vh; transform: translateX(30px); opacity: 0; }
}

#pauseOverlay {
  position: fixed; inset: 0; background: rgba(0, 50, 80, 0.8);
  z-index: 2000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;
}
.resume-btn {
  padding: 15px 40px; font-size: 1.5rem; border-radius: 50px;
  background: #06d6a0; color: white; border: 4px solid white; cursor: pointer; font-weight: bold;
}

.danger-text { color: #ef476f !important; }
</style>