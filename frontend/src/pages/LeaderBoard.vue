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
        v-for="(student, index) in students"
        :key="student.id"
        class="bg-gradient-to-r rounded-2xl shadow-2xl border-4 transform transition-all hover:scale-[1.02] hover:shadow-cyan-400/50 backdrop-blur"
        :class="[getRankColor(index + 1), index < 3 ? 'p-6' : 'p-5']"
      >
        <div class="flex items-center gap-6">
          <div class="flex-shrink-0 w-44">
            <div v-if="index === 0" class="flex items-center gap-2 text-yellow-300">
              <Crown class="w-8 h-8 animate-bounce drop-shadow-lg" />
              <span class="text-2xl font-black drop-shadow-md">Đô Đốc</span>
            </div>
            <div v-else-if="index === 1" class="flex items-center gap-2 text-cyan-100">
              <Ship class="w-7 h-7 drop-shadow-lg" />
              <span class="text-xl font-black drop-shadow-md">Thuyền Trưởng</span>
            </div>
            <div v-else-if="index === 2" class="flex items-center gap-2 text-orange-200">
              <Anchor class="w-7 h-7 drop-shadow-lg" />
              <span class="text-xl font-black drop-shadow-md">Hoa Tiêu</span>
            </div>
            <div v-else class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xl font-bold shadow-lg border-2 border-white ml-4">
              #{{ index + 1 }}
            </div>
          </div>

          <div :class="['flex-shrink-0 drop-shadow-lg', index < 3 ? 'text-7xl' : 'text-6xl']">
            {{ student.avatar }}
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-white mb-2 drop-shadow-lg truncate" :class="index < 3 ? 'text-2xl' : 'text-xl'">
              {{ student.name }}
            </h3>
            <div class="flex flex-wrap gap-3">
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Compass class="w-4 h-4 text-blue-600" />
                <span class="font-bold text-blue-700">{{ student.score }}</span>
              </div>
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Gem class="w-4 h-4 text-pink-500" />
                <span class="font-bold text-pink-600">{{ student.pearls }} 💎</span>
              </div>
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Fish class="w-4 h-4 text-orange-500" />
                <span class="font-bold text-orange-600">{{ student.shells }} 🐚</span>
              </div>
              <div class="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md transform hover:scale-110 transition-transform">
                <Star class="w-4 h-4 text-yellow-500" />
                <span class="font-bold text-yellow-700">{{ student.treasure }} 🏆</span>
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
  Anchor, Ship, Waves, Compass, Crown, Star, Fish, Award, Gem 
} from 'lucide-vue-next';

const students = ref([]);

// Tính toán tổng các chỉ số dựa trên TOP 10, đảm bảo ép kiểu Number()
const stats = computed(() => [
  { 
    label: 'Thủy Thủ', 
    value: students.value.length, 
    icon: Ship, textColor: 'text-blue-600', bgIcon: 'bg-blue-100', border: 'border-blue-300' 
  },
  { 
    label: 'Ngọc Trai', 
    value: students.value.reduce((sum, s) => sum + Number(s.pearls || 0), 0), 
    icon: Gem, textColor: 'text-pink-600', bgIcon: 'bg-pink-100', border: 'border-pink-300' 
  },
  { 
    label: 'Vỏ Sò', 
    value: students.value.reduce((sum, s) => sum + Number(s.shells || 0), 0), 
    icon: Fish, textColor: 'text-orange-600', bgIcon: 'bg-orange-100', border: 'border-orange-300' 
  },
  { 
    label: 'Kho Báu', 
    value: students.value.reduce((sum, s) => sum + Number(s.treasure || 0), 0), 
    icon: Award, textColor: 'text-yellow-600', bgIcon: 'bg-yellow-100', border: 'border-yellow-300' 
  },
]);

// Hàm trả về màu nền dựa trên thứ hạng
const getRankColor = (rank) => {
  if (rank === 1) return "from-yellow-400 via-amber-500 to-orange-500 border-yellow-300";
  if (rank === 2) return "from-cyan-400 via-blue-400 to-blue-500 border-cyan-300";
  if (rank === 3) return "from-orange-400 via-red-400 to-pink-500 border-orange-300";
  return "from-blue-400 to-cyan-500 border-blue-300";
};

// Gọi API lấy dữ liệu từ Backend
const fetchData = async () => {
  try {
    const response = await axios.get('/api/leaderboard');
    students.value = response.data;
  } catch (err) {
    console.error("Lỗi khi tải bảng xếp hạng:", err);
  }
};

onMounted(fetchData);
</script>

<style scoped>
/* Thêm hiệu ứng hover mượt mà cho toàn bộ card */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>