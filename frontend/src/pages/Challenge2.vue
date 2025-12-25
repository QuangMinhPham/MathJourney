<template>
  <div class="game-page min-h-screen bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <span class="text-4xl">✨</span>
          <h1 class="text-4xl md:text-5xl font-black text-amber-800 drop-shadow-sm uppercase">
            🏴‍☠️ Truy Tìm Kho Báu 🏴‍☠️
          </h1>
          <span class="text-4xl animate-pulse">✨</span>
        </div>
        <p class="text-xl text-amber-700 font-bold mb-4">
          Nối các rương câu hỏi với chìa khóa đáp án đúng!
        </p>
        
        <div class="mt-4 inline-flex items-center gap-4 bg-white/90 px-8 py-3 rounded-full shadow-xl border-2 border-amber-200">
          <span class="text-2xl font-black text-amber-800">
            Điểm: {{ isChecked ? score : '---' }}
          </span>
        </div>
      </div>

      <div 
        ref="containerRef"
        class="game-container relative bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 border-4 border-amber-300 min-h-[500px]"
        @mousemove="onDragMove" 
        @touchmove="onDragMove"
        @mouseup="endDrag"
        @touchend="endDrag"
      >
        <svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          <line v-for="(line, index) in connections" :key="index"
                :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
                class="connection-line"
                :class="{ 
                  'line-correct': isChecked && line.isCorrect, 
                  'line-wrong': isChecked && !line.isCorrect 
                }"
                @click="removeConnection(index)"
                style="pointer-events: auto; cursor: pointer; stroke-width: 6; stroke-linecap: round;" />
          
          <line v-if="isDrawing"
                :x1="tempLine.x1" :y1="tempLine.y1" :x2="tempLine.x2" :y2="tempLine.y2"
                class="drawing-line" />
        </svg>

        <div class="relative grid grid-cols-2 gap-12 md:gap-32 z-20">
          <div class="space-y-6">
            <h2 class="text-2xl font-black text-white mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 py-3 rounded-2xl shadow-md">
              🗺️ Rương Câu Hỏi
            </h2>
            <div
              v-for="(item, index) in leftItems"
              :key="'left-'+index"
              :id="'chest-'+index"
              class="duo-card p-4 flex items-center gap-4 min-h-[100px] relative transition-all"
              :class="getItemStatusClass('chest-'+index)"
            >
              <img src="/images/ruongkhoa.png" class="w-12 h-12 md:w-16 md:h-16 object-contain shrink-0">
              <div class="flex-1 text-lg font-bold text-gray-700 leading-tight">{{ item.left_text }}</div>
              
              <div class="connector-dot" style="right: -12px;"
                   @mousedown.stop="startDrag($event, 'chest-'+index, 'chest')"
                   @touchstart.stop="startDrag($event, 'chest-'+index, 'chest')"></div>
            </div>
          </div>

          <div class="space-y-6">
            <h2 class="text-2xl font-black text-white mb-6 text-center bg-gradient-to-r from-orange-400 to-red-400 py-3 rounded-2xl shadow-md">
              💎 Chìa Khóa
            </h2>
            <div
              v-for="(item, index) in rightItems"
              :key="'right-'+index"
              :id="'key-'+index"
              class="duo-card p-4 flex flex-row-reverse items-center gap-4 min-h-[100px] justify-end text-right relative transition-all"
              :class="getItemStatusClass('key-'+index)"
            >
              <img src="/images/chiakhoa.png" class="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0 opacity-90">
              <div class="flex-1 text-lg font-bold text-amber-700 leading-tight">{{ item.right_text }}</div>
              
              <div class="connector-dot" style="left: -12px;"
                   @mousedown.stop="startDrag($event, 'key-'+index, 'key')"
                   @touchstart.stop="startDrag($event, 'key-'+index, 'key')"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center flex justify-center gap-4">
        <button 
          @click="resetGame"
          class="bg-gray-500 text-white px-8 py-4 rounded-2xl font-black text-xl hover:bg-gray-600 transition-all border-b-4 border-gray-700 active:border-b-0 active:translate-y-1"
        >
          🔄 Làm lại
        </button>
        <button 
          @click="submitGame"
          :disabled="isChecked"
          class="bg-green-500 text-white px-12 py-4 rounded-2xl font-black text-xl hover:bg-green-600 transition-all border-b-4 border-green-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚢 MỞ RƯƠNG
        </button>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center border-4 border-amber-400 shadow-2xl animate-popIn">
        <img src="/images/ruongmo.png" class="w-32 h-32 mx-auto mb-4 drop-shadow-md animate-bounce">
        <h2 class="text-3xl font-extrabold text-amber-600 mb-2 uppercase">{{ resultTitle }}</h2>
        <p class="text-gray-600 font-bold mb-8 text-lg">
          Bạn đã mở được <span class="text-amber-600 text-2xl">{{ correctMatches }}/{{ leftItems.length }}</span> rương tri thức!
        </p>
        <button @click="closeModal" class="w-full bg-blue-500 text-white border-b-4 border-blue-700 hover:bg-blue-600 py-3 rounded-xl font-bold uppercase transition-all">
           Tiếp tục hành trình 🗺️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import confetti from 'canvas-confetti';

const route = useRoute();
const router = useRouter();
const chapterId = route.params.chapterId || 1;

// States
const leftItems = ref([]);
const rightItems = ref([]);
const connections = ref([]);
const isDrawing = ref(false);
const tempLine = ref({ x1: 0, y1: 0, x2: 0, y2: 0 });
const startPoint = ref(null);
const isChecked = ref(false);
const showModal = ref(false);
const score = ref(0);
const correctMatches = ref(0);
const containerRef = ref(null);

// Fetch Data từ backend
const fetchData = async () => {
  try {
    const res = await fetch(`/api/challenges/matching/${chapterId}`);
    const data = await res.json();
    if (!data.questions?.length) return;

    const pairs = data.questions.flatMap(q => q.pairs);

    leftItems.value = pairs.map((p, i) => ({
      ...p,
      domId: `chest-${i}`,
      expected: normalizeExpected(p.correct_match)
    }));

    rightItems.value = pairs.map((p, i) => ({
      ...p,
      domId: `key-${i}`,
      val: extractFirstLetter(p.right_text || "")
    }));
  } catch (e) {
    console.error("Lỗi fetch:", e);
  }
};

const normalizeExpected = (cm) => {
  if (!cm) return "";
  const parts = cm.split("-");
  return (parts.length > 1 ? parts[1] : parts[0]).toLowerCase().replace(/[).]/g, "");
};

const extractFirstLetter = (text) => {
  const m = text?.trim().match(/^([A-Za-z0-9])/);
  return m ? m[1].toLowerCase() : "";
};

// Drawing Logic
const getCenter = (id) => {
  const dot = document.querySelector(`#${id} .connector-dot`);
  const container = containerRef.value;
  if (!dot || !container) return { x: 0, y: 0 };

  const rDot = dot.getBoundingClientRect();
  const rCont = container.getBoundingClientRect();
  return {
    x: rDot.left + rDot.width/2 - rCont.left,
    y: rDot.top + rDot.height/2 - rCont.top
  };
};

const startDrag = (e, id, type) => {
  if (isChecked.value) return;
  connections.value = connections.value.filter(c => c.startId !== id && c.endId !== id);

  const pos = getCenter(id);
  startPoint.value = { id, type, x: pos.x, y: pos.y };
  tempLine.value = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
  isDrawing.value = true;
};

const onDragMove = (e) => {
  if (!isDrawing.value) return;
  const container = containerRef.value.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  tempLine.value.x2 = clientX - container.left;
  tempLine.value.y2 = clientY - container.top;
};

const endDrag = (e) => {
  if (!isDrawing.value) return;
  isDrawing.value = false;

  const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  
  const el = document.elementFromPoint(clientX, clientY);
  const dot = el?.closest('.connector-dot');
  
  if (dot) {
    const parentCard = dot.closest('.duo-card');
    if (parentCard) {
      const targetId = parentCard.id;
      const targetType = targetId.startsWith('chest') ? 'chest' : 'key';

      if (targetType !== startPoint.value.type) {
        connections.value = connections.value.filter(c => c.startId !== targetId && c.endId !== targetId);
        
        const endPos = getCenter(targetId);
        connections.value.push({
          startId: startPoint.value.id,
          endId: targetId,
          x1: startPoint.value.x, y1: startPoint.value.y,
          x2: endPos.x, y2: endPos.y,
          isCorrect: false 
        });
      }
    }
  }
  startPoint.value = null;
};

const removeConnection = (index) => {
  if (!isChecked.value) connections.value.splice(index, 1);
};

const submitGame = () => {
  if (isChecked.value || connections.value.length === 0) return;
  isChecked.value = true;
  let correctCount = 0;

  connections.value.forEach(conn => {
    const chestId = conn.startId.startsWith('chest') ? conn.startId : conn.endId;
    const keyId = conn.startId.startsWith('key') ? conn.startId : conn.endId;

    const chestData = leftItems.value.find(i => i.domId === chestId);
    const keyData = rightItems.value.find(i => i.domId === keyId);

    if (chestData && keyData && chestData.expected === keyData.val) {
      conn.isCorrect = true;
      correctCount++;
    } else {
      conn.isCorrect = false;
    }
  });

  correctMatches.value = correctCount;
  score.value = Math.round((correctCount / leftItems.value.length) * 100);
  
  if (score.value >= 50) {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }

  showModal.value = true;
  saveScoreToDB();
};

const saveScoreToDB = async () => {
  const token = localStorage.getItem("token");
  const challengeId = 2 + ((chapterId - 1) * 3);
  try {
    await fetch("/api/scores/save", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ chapter_id: chapterId, challenge_id: challengeId, score: score.value })
    });
  } catch(e) { console.error(e); }
};

const resetGame = () => {
  isChecked.value = false;
  connections.value = [];
  score.value = 0;
  fetchData();
};

const closeModal = () => {
  showModal.value = false;
  router.push(`/lessons/${chapterId}/challenges`);
};

const getItemStatusClass = (id) => {
  if (!isChecked.value) return '';
  const conn = connections.value.find(c => c.startId === id || c.endId === id);
  if (!conn) return '';
  return conn.isCorrect ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
};

const resultTitle = computed(() => {
  if (score.value >= 80) return "Xuất sắc! 💎";
  if (score.value >= 50) return "Khá lắm! 💰";
  return "Cố lên nào! ⚓";
});

const handleResize = () => {
  connections.value = connections.value.map(c => {
    const p1 = getCenter(c.startId);
    const p2 = getCenter(c.endId);
    return { ...c, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  });
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Nhập font Inter từ Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* Áp dụng font Inter cho toàn bộ trang */
.game-page {
  font-family: 'Inter', sans-serif;
}

.duo-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-bottom-width: 5px;
  border-radius: 20px;
  cursor: grab;
  user-select: none;
}
.duo-card:active { border-bottom-width: 2px; transform: translateY(3px); }

.connector-dot {
  width: 24px; height: 24px;
  background-color: #fbbf24;
  border: 4px solid #fff;
  box-shadow: 0 0 0 3px #d97706;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 30;
  cursor: crosshair;
}
.connector-dot:hover { transform: translateY(-50%) scale(1.2); background-color: #1cb0f6; box-shadow: 0 0 0 3px #1cb0f6; }

.connection-line { stroke: #1cb0f6; transition: stroke 0.3s; }
.line-correct { stroke: #10b981 !important; }
.line-wrong { stroke: #ef4444 !important; }

.drawing-line {
  stroke: #ffb703;
  stroke-width: 5;
  stroke-dasharray: 10, 5;
  fill: none;
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>