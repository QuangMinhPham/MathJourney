<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-sky-50 font-['Nunito']">
    <div id="app" class="w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">

      <div v-if="!loading && !completed" class="hidden lg:block w-48 shrink-0">
        <div class="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-5 border-4 border-blue-200 sticky top-4">
          <h3 class="text-center font-extrabold text-blue-700 mb-4 text-sm uppercase tracking-wider">
            <i class="fa-solid fa-keyboard"></i> Phím Tắt
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="char in specialChars" 
              :key="char"
              @click="insertSpecialChar(char)"
              class="bg-blue-50 hover:bg-blue-500 hover:text-white border-2 border-blue-200 text-blue-700 font-bold py-3 rounded-lg transition-all active:scale-90 text-base"
              :disabled="isChecking"
            >
              {{ char }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 w-full max-w-3xl">
        <div v-if="loading" class="text-center py-20">
          <div class="text-6xl animate-bounce mb-4 text-blue-500">🏴‍☠️</div>
          <p class="text-blue-600 text-2xl font-bold">Đang chuẩn bị câu đố...</p>
        </div>

        <div v-else-if="!completed" class="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl border-4 border-blue-200 transition-all duration-300">
          
          <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
            <button @click="$router.back()" class="text-blue-500 hover:text-blue-700 font-bold transition-colors">
               <i class="fa-solid fa-arrow-left"></i> Quay lại
            </button>
            <div class="flex gap-4">
              <div class="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold shadow-sm border border-blue-200">
                <i class="fa-solid fa-question-circle"></i> Câu {{ currentIndex + 1 }}/{{ questions.length }}
              </div>
              <div class="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl font-bold shadow-sm border border-amber-200">
                <i class="fa-solid fa-star"></i> {{ score }} điểm
              </div>
            </div>
          </div>

          <div class="mb-8">
            <div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                class="bg-gradient-to-r from-blue-400 to-indigo-500 h-full transition-all duration-500 rounded-full"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>

          <div class="text-center mb-10">
            <div class="text-5xl mb-4 animate-[bounce_3s_infinite]">{{ currentQuestion.emoji || '🗺️' }}</div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed mb-4">
              {{ currentQuestion.question_text }}
            </h2>
            <img v-if="currentQuestion.image_url" 
                 :src="currentQuestion.image_url" 
                 class="mt-6 mx-auto rounded-xl border-4 border-blue-100 shadow-lg max-h-48 object-contain">
          </div>

          <div class="lg:hidden mb-6 bg-blue-50/80 rounded-2xl p-4 border-2 border-blue-200">
            <p class="text-xs font-bold text-blue-500 mb-3 text-center uppercase">Ký tự đặc biệt:</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <button 
                v-for="char in specialChars" 
                :key="'mob-'+char"
                @click="insertSpecialChar(char)"
                class="bg-white border border-blue-300 text-blue-700 font-bold py-2 px-3 rounded-lg active:bg-blue-500 active:text-white transition-all text-sm"
              >
                {{ char }}
              </button>
            </div>
          </div>

          <div class="relative w-full mb-10 min-h-[80px] flex flex-wrap justify-center gap-2 md:gap-3"
               :class="{ 'animate-[shake_0.5s_ease-in-out]': isWrong }">
            
            <input 
              ref="mainInput"
              type="text" 
              v-model="userAnswer" 
              class="absolute opacity-0 top-0 left-0 h-full w-full cursor-pointer z-10" 
              autocomplete="off"
              @keydown.space.prevent 
              @input="handleInput"
              @compositionstart="isComposing = true"
              @compositionend="onCompositionEnd"
              :disabled="isChecking"
              autofocus
            >

            <template v-for="(item, index) in answerStructure" :key="index">
              <div v-if="item.isSpace" class="w-4 md:w-8 flex items-center justify-center"></div>
              <div v-else 
                   class="w-10 h-14 md:w-12 md:h-16 rounded-xl border-b-4 flex items-center justify-center text-2xl font-extrabold transition-all duration-200 select-none"
                   :class="getBoxClass(item.charIndex)"
              >
                {{ userAnswer[item.charIndex] || "" }}
              </div>
            </template>
          </div>

          <div v-if="feedbackMessage" 
               class="text-center mb-6 font-bold text-xl p-4 rounded-xl transition-all" 
               :class="feedbackType === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
            {{ feedbackMessage }}
          </div>

          <div class="text-center mb-6" v-if="currentQuestion.hint && !showHint">
            <button 
              @click="showHint = true"
              class="bg-purple-100 text-purple-600 hover:bg-purple-200 font-bold py-2 px-6 rounded-full transition-all border border-purple-200"
            >
              <i class="fa-solid fa-lightbulb"></i> Xem Gợi Ý
            </button>
          </div>
          <div v-if="showHint && currentQuestion.hint" 
               class="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6 animate-[pop_0.3s_ease-out]">
            <p class="text-lg text-purple-800 text-center">
              <i class="fa-solid fa-lightbulb text-yellow-500"></i> 
              <span class="font-bold">Gợi ý:</span> {{ currentQuestion.hint }}
            </p>
          </div>

          <div class="text-center">
            <button 
              v-if="!isChecking"
              @click="submitAnswer" 
              class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-[0_5px_0_#312e81] active:shadow-none active:translate-y-1 transition-all w-full md:w-auto uppercase"
              :class="{ 'opacity-50 cursor-not-allowed': userAnswer.length === 0 }"
              :disabled="userAnswer.length === 0"
            >
              Mở Khóa
            </button>
            <button 
              v-else
              class="bg-gray-300 text-gray-600 text-xl font-bold py-4 px-12 rounded-full w-full md:w-auto uppercase cursor-not-allowed"
              disabled
            >
              <i class="fa-solid fa-spinner fa-spin"></i> Đang mở...
            </button>
          </div>
        </div>

        <div v-else class="bg-white rounded-3xl p-10 text-center shadow-2xl border-4 border-blue-100 animate-[pop_0.3s_ease-out]">
          <div class="text-7xl mb-4 animate-bounce">🏆</div>
          <h2 class="text-4xl font-bold text-blue-600 mb-4">
            {{ score === questions.length * 10 ? '🎉 Kho Báu Đã Mở! 🎉' : '⭐ Hoàn Thành! ⭐' }}
          </h2>
          <p class="text-2xl text-gray-700 mb-6">
            Bạn đã giải đúng <span class="font-bold text-green-600">{{ Math.round(score/10) }}/{{ questions.length }}</span> câu hỏi.
          </p>
          
          <div class="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-2xl p-8 mb-8 shadow-lg">
            <div class="text-5xl font-black mb-2">{{ score }} Điểm</div>
            <div class="text-xl">{{ getScoreMessage() }}</div>
          </div>

          <div class="flex justify-center gap-4">
            <button @click="restartGame" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full transition-all">
              <i class="fa-solid fa-rotate-right"></i> Chơi Lại
            </button>
            <button @click="$router.push('/lessons')" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all">
              Tiếp Tục 🗺️
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

// Cấu hình
const route = useRoute();
const chapterId = route.params.chapterId || 1;

// State
const loading = ref(true);
const completed = ref(false);
const questions = ref([]);
const currentIndex = ref(0);
const score = ref(0);
const userAnswer = ref("");
const isChecking = ref(false);
const isWrong = ref(false);
const feedbackMessage = ref("");
const feedbackType = ref("");
const mainInput = ref(null);
const showHint = ref(false);
const isComposing = ref(false);
const questionResults = ref([]);

// Danh sách ký tự đặc biệt
const specialChars = ref(['m²', 'dm²', 'cm²', 'km²', 'mm²', '°', '±', '≈', '≤', '≥', '×', '÷', 'π', '√', '∞', '%']);

// Truy vấn thông tin câu hỏi hiện tại
const currentQuestion = computed(() => questions.value[currentIndex.value] || {});

const progressPercent = computed(() => (currentIndex.value / (questions.value.length || 1)) * 100);

const normalizeVN = (str) => {
  return str
    .normalize('NFD')                 // tách chữ + dấu
    .replace(/[\u0300-\u036f]/g, '')  // xoá toàn bộ dấu
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanCorrectAnswer = computed(() => {
  const raw = currentQuestion.value.correct_answer || "";
  return raw
    .replace(/\s/g, '')   // ❗ XOÁ TOÀN BỘ SPACE
    .toLowerCase();
});



const answerStructure = computed(() => {
  const raw = currentQuestion.value.correct_answer || "";
  let charCount = 0;
  return raw.split('').map(char => {
    if (char === ' ') return { isSpace: true };
    else return { isSpace: false, charIndex: charCount++ };
  });
});

const maxCharLength = computed(() => cleanCorrectAnswer.value.length);

// Các hàm xử lý
const fetchData = async () => {
  try {
    loading.value = true;
    const res = await fetch(`/api/challenges/short-answer/${chapterId}`);
    const data = await res.json();
    if (data.questions) {
      questions.value = data.questions;
    }
  } catch (err) {
    console.error("Lỗi fetch:", err);
  } finally {
    loading.value = false;
    focusInput();
  }
};

const focusInput = () => {
  nextTick(() => { if (mainInput.value) mainInput.value.focus(); });
};

const insertSpecialChar = (char) => {
  if (isChecking.value) return;
  if (userAnswer.value.length < maxCharLength.value) {
    userAnswer.value += char;
    focusInput();
  }
};

const handleInput = (e) => {
  if (isComposing.value) return;

  // ❗ CHỈ XOÁ SPACE – KHÔNG CẮT
  userAnswer.value = e.target.value.replace(/\s/g, '');
};



const onCompositionEnd = (e) => {
  isComposing.value = false;

  let val = e.target.value.replace(/\s/g, '');

  if (val.length > maxCharLength.value) {
    val = val.slice(0, maxCharLength.value);
  }

  userAnswer.value = val;
};



const getBoxClass = (charIndex) => {
  if (!userAnswer.value[charIndex]) return 'bg-white border-blue-200 text-transparent';
  return 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm scale-105';
};

const submitAnswer = async () => {
  if (!userAnswer.value) return;
  isChecking.value = true;

  const userClean = userAnswer.value.toLowerCase();
  const correctClean = cleanCorrectAnswer.value;

  const isCorrect = userClean === correctClean;

  questionResults.value.push({
    question_id: currentQuestion.value.question_id,
    question_text: currentQuestion.value.question_text,
    correct_answer: currentQuestion.value.correct_answer,
    user_answer: userAnswer.value,
    is_correct: isCorrect
  });

  if (isCorrect) {
    score.value += 20;
    feedbackMessage.value = "🎉 Tuyệt vời! Bạn đã tìm ra chìa khóa!";
    feedbackType.value = "success";
  } else {
    isWrong.value = true;
    feedbackMessage.value = `❌ Chưa đúng rồi! Đáp án là: ${currentQuestion.value.correct_answer}`;
    feedbackType.value = "error";
    setTimeout(() => isWrong.value = false, 500);
  }

  setTimeout(() => {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
      userAnswer.value = "";
      isChecking.value = false;
      feedbackMessage.value = "";
      showHint.value = false;
      focusInput();
    } else {
      completed.value = true;
      saveFinalScore();
    }
  }, 1200);
};




const saveFinalScore = async () => {
  const token = localStorage.getItem("token");
  const challengeId = 3 + ((chapterId - 1) * 3);
  try {
    await fetch("/api/scores/save", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ chapter_id: chapterId, challenge_id: challengeId, score: score.value })
    });

    if (questionResults.value.length > 0) {
      await fetch("/api/progress/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ challenge_id: challengeId, answers: questionResults.value })
      });
    }
  } catch (e) { console.error("Lỗi lưu điểm:", e); }
};

const getScoreMessage = () => {
  const totalPossible = (questions.value.length || 1) * 10;
  const percentage = (score.value / totalPossible) * 100;
  if (percentage === 100) return "Bạn thực sự là một huyền thoại săn kho báu!";
  if (percentage >= 80) return "Rất tốt! Bạn gần như đã làm chủ hòn đảo này!";
  return "Hãy tiếp tục rèn luyện để trở nên giỏi hơn nhé!";
};

const restartGame = () => {
  currentIndex.value = 0;
  score.value = 0;
  userAnswer.value = "";
  completed.value = false;
  isChecking.value = false;
  feedbackMessage.value = "";
  showHint.value = false;
  focusInput();
};

onMounted(fetchData);
</script>

<style>
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>  