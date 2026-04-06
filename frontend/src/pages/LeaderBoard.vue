<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-500 p-6 relative overflow-hidden font-sans">
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <div class="absolute bottom-0 left-0 right-0">
        <Waves class="w-full h-64 text-white animate-pulse" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto mb-8 relative z-10">
      <div class="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden border-4 border-cyan-300">
        <div class="absolute top-0 right-0 opacity-10"><Ship class="w-64 h-64" /></div>
        <div class="absolute bottom-0 left-0 opacity-10"><Compass class="w-48 h-48" /></div>
        
        <div class="relative z-10 text-center">
          <div class="flex items-center justify-center gap-4 mb-4">
            <Anchor class="w-12 h-12 animate-bounce" />
            <h1 class="text-5xl font-bold text-center drop-shadow-lg uppercase tracking-wider">🌊 Hải Tặc Toán Học 🌊</h1>
            <Ship class="w-12 h-12 animate-bounce" />
          </div>
          <p class="text-center text-xl opacity-95 drop-shadow-md italic">⚓ Khám phá đại dương tri thức - Săn lùng kho báu toán học! 🏴‍☠️</p>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
      <div v-for="stat in stats" :key="stat.label" class="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border-2" :class="stat.border">
        <div class="flex items-center gap-3">
          <div :class="['p-3 rounded-xl', stat.bgIcon]">
            <component :is="stat.icon" class="w-6 h-6" :class="stat.textColor" />
          </div>
          <div>
            <p class="text-gray-600 text-sm font-semibold">{{ stat.label }}</p>
            <p class="text-2xl font-bold" :class="stat.textColor">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto space-y-4 relative z-10">
      <div
        v-for="student in students"
        :key="student.rank"
        class="bg-gradient-to-r rounded-2xl shadow-2xl border-4 transform transition-all hover:scale-[1.02] hover:shadow-cyan-400/50 backdrop-blur"
        :class="[getRankColor(student.rank), student.rank <= 3 && currentPage === 1 ? 'p-6' : 'p-5']"
      >
        <div class="flex items-center gap-6">
          <div class="flex-shrink-0 w-44">
            <div v-if="student.rank === 1 && currentPage === 1" class="flex items-center gap-2 text-yellow-300">
              <Crown class="w-8 h-8 animate-bounce drop-shadow-lg" />
              <span class="text-2xl font-black drop-shadow-md">Đô Đốc</span>
            </div>
            <div v-else-if="student.rank === 2 && currentPage === 1" class="flex items-center gap-2 text-cyan-100">
              <Ship class="w-7 h-7 drop-shadow-lg" />
              <span class="text-xl font-black drop-shadow-md">Thuyền Trưởng</span>
            </div>
            <div v-else-if="student.rank === 3 && currentPage === 1" class="flex items-center gap-2 text-orange-200">
              <Anchor class="w-7 h-7 drop-shadow-lg" />
              <span class="text-xl font-black drop-shadow-md">Hoa Tiêu</span>
            </div>
            <div v-else class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xl font-bold shadow-lg border-2 border-white ml-4">
              #{{ student.rank }}
            </div>
          </div>

          <div :class="['flex-shrink-0 drop-shadow-lg', student.rank <= 3 && currentPage === 1 ? 'text-7xl' : 'text-6xl']">
            {{ student.avatar }}
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-white mb-2 drop-shadow-lg truncate" :class="student.rank <= 3 && currentPage === 1 ? 'text-2xl' : 'text-xl'">
              {{ student.name }}
            </h3>
            <div class="flex flex-wrap gap-3">
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Compass class="w-4 h-4 text-blue-600" />
                <span class="font-bold text-blue-700">{{ student.score }}</span>
              </div>
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Shell class="w-4 h-4 text-pink-500" />
                <span class="font-bold text-pink-600">{{ student.pearls }} 🐚</span>
              </div>
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Coins class="w-4 h-4 text-yellow-500" />
                <span class="font-bold text-yellow-600">{{ student.shells }} 💰</span>
              </div>
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Trophy class="w-4 h-4 text-amber-500" />
                <span class="font-bold text-amber-700">{{ student.treasure }} 🏺</span>
              </div>
            </div>
          </div>

          <div class="hidden lg:block flex-shrink-0 w-44">
            <div class="bg-white/40 backdrop-blur rounded-full h-5 overflow-hidden border-2 border-white/50 relative shadow-inner">
              <div
                class="bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-500 h-full rounded-full transition-all duration-1000 relative"
                :style="{ width: (student.completion_percentage || 0) + '%' }"
              >
                <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                  <span class="text-sm drop-shadow">⛵</span>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center mt-1.5 px-1">
              <p class="text-[11px] text-white font-black drop-shadow-lg uppercase tracking-tighter">
                {{ student.participation_ratio }} bài đã làm
              </p>
              <p class="text-[11px] text-white font-black drop-shadow-lg">
                {{ student.completion_percentage }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phân trang -->
    <div v-if="totalPages > 1" class="max-w-6xl mx-auto mt-6 flex items-center justify-center gap-2 relative z-10">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-10 h-10 rounded-xl bg-white/80 font-black text-blue-700 shadow disabled:opacity-40 hover:bg-white transition-all"
      >‹</button>

      <button
        v-for="p in pageNumbers"
        :key="p"
        @click="goToPage(p)"
        :class="['w-10 h-10 rounded-xl font-black shadow transition-all',
          p === currentPage
            ? 'bg-blue-700 text-white scale-110'
            : 'bg-white/80 text-blue-700 hover:bg-white']"
      >{{ p }}</button>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-10 h-10 rounded-xl bg-white/80 font-black text-blue-700 shadow disabled:opacity-40 hover:bg-white transition-all"
      >›</button>

      <span class="text-white font-bold text-sm ml-2 drop-shadow">
        Trang {{ currentPage }} / {{ totalPages }} ({{ totalStudents }} học sinh)
      </span>
    </div>

    <div class="max-w-6xl mx-auto mt-8 text-center relative z-10 mb-10">
      <div class="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 rounded-2xl p-6 text-white shadow-2xl border-4 border-cyan-300">
        <p class="text-lg font-bold mb-2 drop-shadow-lg">🌊 Đại dương tri thức đang chờ đợi các thủy thủ dũng cảm! 🌊</p>
        <p class="text-sm opacity-90 drop-shadow">Mỗi thử thách vượt qua là một bước gần hơn tới kho báu vĩ đại!</p>
        <div class="mt-4 flex justify-center gap-4 text-3xl filter drop-shadow-md">
          ⚓ 🏴‍☠️ 🌊 🐚 💎 ⛵ 🦀 🧜‍♀️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import {
  Anchor, Ship, Waves, Compass, Crown, Shell, Coins, Trophy
} from 'lucide-vue-next';

const students     = ref([]);
const currentPage  = ref(1);
const totalPages   = ref(1);
const totalStudents = ref(0);

const stats = computed(() => [
  { label: 'Thủy Thủ',  value: totalStudents.value, icon: Ship,  textColor: 'text-blue-600',   bgIcon: 'bg-blue-100',   border: 'border-blue-300'   },
  { label: 'Vỏ Sò',   value: students.value.reduce((s, x) => s + x.pearls,  0), icon: Shell,  textColor: 'text-pink-600',   bgIcon: 'bg-pink-100',   border: 'border-pink-300'   },
  { label: 'Vàng',    value: students.value.reduce((s, x) => s + x.shells,  0), icon: Coins,  textColor: 'text-yellow-600', bgIcon: 'bg-yellow-100', border: 'border-yellow-300' },
  { label: 'Kho Báu', value: students.value.reduce((s, x) => s + x.treasure,0), icon: Trophy, textColor: 'text-amber-600',  bgIcon: 'bg-amber-100',  border: 'border-amber-300'  },
]);

const pageNumbers = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  return pages;
});

const getRankColor = (rank) => {
  if (rank === 1) return "from-yellow-400 via-amber-500 to-orange-500 border-yellow-300";
  if (rank === 2) return "from-cyan-400 via-blue-400 to-blue-500 border-cyan-300";
  if (rank === 3) return "from-orange-400 via-red-400 to-pink-500 border-orange-300";
  return "from-blue-400 to-cyan-500 border-blue-300";
};

const fetchData = async (page = 1) => {
  try {
    const { data } = await axios.get(`/api/leaderboard?page=${page}`);
    students.value     = data.data;
    currentPage.value  = data.page;
    totalPages.value   = data.totalPages;
    totalStudents.value = data.total;
  } catch (err) {
    console.error("Lỗi khi tải bảng xếp hạng:", err);
  }
};

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  fetchData(page);
};

onMounted(() => fetchData(1));
</script>

<style scoped>
/* Thêm hiệu ứng hover mượt mà cho toàn bộ card */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>