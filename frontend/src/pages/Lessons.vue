<template>
  <div class="lessons-container">
    <div class="toolbar">
      <div class="title">
        <i class="fa-solid fa-map-marked-alt"></i>
        <span>ĐẢO GIẤU VÀNG — BÀI HỌC</span>
      </div>
      <div>
        <button @click="goToHome">
          <i class="fa-solid fa-house"></i> Trang chủ
        </button>
      </div>
    </div>

    <div class="page">
      <div v-if="loading" class="loading-state">
        <div class="spinner">🌊</div>
        <p>Đang tìm bản đồ...</p>
      </div>

      <section v-else id="lesson">
        <div class="btn btn-left" @click="scroll('left')" title="Lùi">
          <i class="fa-solid fa-chevron-left"></i>
        </div>

        <div class="main-lesson">
          <div 
            class="slides" 
            ref="sliderRef"
            @mousedown="startDrag"
            @mouseleave="stopDrag"
            @mouseup="stopDrag"
            @mousemove="moveDrag"
          >
            <div 
              v-for="lesson in lessons" 
              :key="lesson.chapter_id" 
              class="slide"
              @click="openLesson(lesson.chapter_id)"
            >
              <div class="lesson-img">
                <img 
                  :src="`/images/${lesson.chapter_id}.jpg`" 
                  onerror="this.src='/images/treasure_map.jpg'" 
                  alt="banner" 
                  draggable="false"
                >
              </div>
              <div class="lesson-name">
                <div class="lesson-number">Bài {{ lesson.chapter_id }}</div>
                <div class="lesson-title">{{ lesson.title }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="btn btn-right" @click="scroll('right')" title="Tiến">
          <i class="fa-solid fa-chevron-right"></i>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// === CONFIG & STATE ===
const router = useRouter();
const sliderRef = ref(null);
const lessons = ref([]);
const loading = ref(true);

const isDown = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const isDragging = ref(false);

// === API LOAD DATA ===
const fetchLessons = async () => {
  try {
    const res = await fetch('/api/lessons');
    const data = await res.json();
    if (data.lessons) {
      lessons.value = data.lessons;
    } else {
      // Dữ liệu mẫu dự phòng
      lessons.value = Array.from({ length: 6 }, (_, i) => ({
        chapter_id: i + 1,
        title: `Bí mật đại dương ${i + 1}`,
      }));
    }
  } catch (error) {
    console.error("Lỗi tải bài học:", error);
  } finally {
    loading.value = false;
  }
};

// === LOGIC ĐIỀU HƯỚNG ===
const goToHome = () => router.push('/');

const openLesson = (chapterId) => {
  if (!isDragging.value) {
    router.push(`/lessons/${chapterId}/challenges`);
  }
};

// === LOGIC SLIDER (Kéo thả bằng chuột) ===
const startDrag = (e) => {
  isDown.value = true;
  isDragging.value = false;
  sliderRef.value.classList.add('active');
  startX.value = e.pageX - sliderRef.value.offsetLeft;
  scrollLeft.value = sliderRef.value.scrollLeft;
};

const stopDrag = () => {
  isDown.value = false;
  sliderRef.value.classList.remove('active');
  setTimeout(() => { isDragging.value = false; }, 50);
};

const moveDrag = (e) => {
  if (!isDown.value) return;
  e.preventDefault();
  const x = e.pageX - sliderRef.value.offsetLeft;
  const walk = (x - startX.value) * 2;
  sliderRef.value.scrollLeft = scrollLeft.value - walk;
  if (Math.abs(x - startX.value) > 5) isDragging.value = true;
};

const scroll = (direction) => {
  const container = sliderRef.value;
  const scrollAmount = 288; // Slide width (260) + gap (28)
  const target = direction === 'left' 
    ? container.scrollLeft - scrollAmount 
    : container.scrollLeft + scrollAmount;
  container.scrollTo({ left: target, behavior: 'smooth' });
};

onMounted(fetchLessons);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* --- Reset & Base --- */
.lessons-container {
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  background: url('/images/bg1.jpg') center/cover fixed no-repeat;
  color: #222;
}

/* --- Toolbar (Khớp 100% bản HTML) --- */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 24px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(6px);
}

.toolbar .title {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 700;
  color: #ffd166;
  font-size: 1.15rem;
}

.toolbar button {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.toolbar button:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* --- Page Layout --- */
.page {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 18px;
}

/* --- Carousel Area --- */
#lesson {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  background: #fff;
  color: #6b4226;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: all 0.18s;
  z-index: 10;
  flex-shrink: 0;
}

.btn:hover {
  transform: translateY(-3px);
  background: peru;
  color: #fff;
}

.main-lesson {
  flex: 1;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.slides {
  display: flex;
  gap: 28px;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 30px 10px;
  cursor: grab;
}

.slides::-webkit-scrollbar {
  display: none;
}

.slides.active {
  cursor: grabbing;
}

/* --- Slide Card --- */
.slide {
  width: 260px;
  min-width: 260px;
  height: 400px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  border: 4px solid transparent;
  /* GIỮ HIỆU ỨNG HOVER CŨ CỦA VUE */
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* HIỆU ỨNG HOVER TỪ BẢN VUE CŨ */
.slide:hover {
  transform: translateY(-20px) rotate(2deg);
  border-color: #ffb703;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3);
}

.lesson-img {
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.lesson-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-bottom: 4px solid #ffd166;
}

.lesson-name {
  padding: 14px;
  text-align: center;
  width: 100%;
}

.lesson-number {
  color: #b86b00;
  font-weight: 800;
  font-size: 20px;
}

.lesson-title {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

/* --- Loading State --- */
.loading-state {
  text-align: center;
  color: #fff;
}
.spinner {
  font-size: 50px;
  animation: bounce 1.5s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* --- Responsive --- */
@media (max-width: 900px) {
  .slide { width: 220px; min-width: 220px; height: 380px; }
  .lesson-img { height: 240px; }
  .toolbar .title { font-size: 1rem; }
}
</style>