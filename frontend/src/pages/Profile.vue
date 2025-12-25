<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-500 p-6 font-sans relative overflow-hidden">
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <Waves class="absolute bottom-0 w-full h-64 animate-pulse text-white" />
    </div>

    <div v-if="data" class="max-w-6xl mx-auto relative z-10">
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
          <User class="w-10 h-10" /> Hồ Sơ Thủy Thủ
        </h1>
        <p class="text-white/90 mt-2">Quản lý thông tin và thành tích của bạn</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <div class="text-center">
              <div class="relative inline-block">
                <div class="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-8xl border-4 border-white shadow-xl animate-bounce">
                  {{ data.userInfo.avatar }}
                </div>
                <div class="absolute -top-4 -right-4">
                  <Crown class="w-12 h-12 text-yellow-400 drop-shadow-lg animate-pulse" />
                </div>
              </div>
              <div class="mt-4">
                <div class="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {{ data.userInfo.title }}
                </div>
                <p class="text-gray-600 text-sm mt-2">Hạng #{{ data.userInfo.rank }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp class="w-6 h-6 text-blue-600" /> Thống Kê
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div class="flex items-center gap-2"><Award class="w-5 h-5 text-blue-600" /><span class="font-semibold text-gray-700">Tổng Điểm</span></div>
                <span class="font-bold text-blue-600 text-lg">{{ data.achievements.totalScore }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <div class="flex items-center gap-2"><Gem class="w-5 h-5 text-pink-600" /><span class="font-semibold text-gray-700">Ngọc Trai</span></div>
                <span class="font-bold text-pink-600 text-lg">{{ data.achievements.pearls }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div class="flex items-center gap-2"><Star class="w-5 h-5 text-orange-600" /><span class="font-semibold text-gray-700">Vỏ Sò</span></div>
                <span class="font-bold text-orange-600 text-lg">{{ data.achievements.shells }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div class="flex items-center gap-2"><Trophy class="w-5 h-5 text-yellow-600" /><span class="font-semibold text-gray-700">Kho Báu</span></div>
                <span class="font-bold text-yellow-600 text-lg">{{ data.achievements.treasures }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User class="w-7 h-7 text-blue-600" /> Thông Tin Cá Nhân
            </h3>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tên Hiển Thị</label>
              <div v-if="isEditingName" class="flex gap-2">
                <input v-model="tempName" type="text" class="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl outline-none" />
                <button @click="handleSaveName" class="p-3 bg-green-500 text-white rounded-xl"><Save class="w-5 h-5" /></button>
                <button @click="isEditingName = false" class="p-3 bg-red-500 text-white rounded-xl"><X class="w-5 h-5" /></button>
              </div>
              <div v-else class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <span class="font-semibold text-gray-800">{{ data.userInfo.name }}</span>
                <button @click="isEditingName = true" class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
                  <Edit2 class="w-4 h-4" /> Sửa
                </button>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <Mail class="w-5 h-5 text-gray-500" />
                <span class="font-semibold text-gray-800">{{ data.userInfo.email }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Medal class="w-7 h-7 text-yellow-600" /> Huy Hiệu & Thành Tích
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="badge in data.badges" :key="badge.id" 
                :class="['relative p-4 rounded-2xl border-4 text-center transition-all', 
                        badge.unlocked ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} hover:scale-105 shadow-lg` : 'bg-gray-200 opacity-50']">
                <div class="text-5xl mb-2">{{ badge.icon }}</div>
                <p class="text-sm font-bold text-white drop-shadow">{{ badge.name }}</p>
                <div v-if="!badge.unlocked" class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl"><Lock class="w-8 h-8 text-white" /></div>
              </div>
            </div>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar class="w-7 h-7 text-purple-600" /> Hoạt Động Gần Đây
            </h3>
            <div class="space-y-3">
              <div v-for="act in data.recentActivities" :key="act.date" class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                <div><p class="font-semibold text-gray-800">{{ act.title }}</p><p class="text-sm text-gray-600">{{ act.date }}</p></div>
                <span class="px-3 py-1 bg-green-500 text-white rounded-full font-bold text-sm">+{{ act.points }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { 
  User, Mail, Lock, Trophy, Star, Gem, Award, Calendar, TrendingUp, Edit2, Save, X, Waves, Crown, Medal 
} from 'lucide-vue-next';

const data = ref(null);
const isEditingName = ref(false);
const tempName = ref('');

const getRarityColor = (rarity) => {
  if (rarity === 'legendary') return 'from-yellow-400 to-orange-500 border-yellow-300';
  if (rarity === 'epic') return 'from-purple-400 to-pink-500 border-purple-300';
  return 'from-blue-400 to-cyan-500 border-blue-300';
};

const handleSaveName = async () => {
  try {
    await axios.put('/api/profile/name', { name: tempName.value });
    data.value.userInfo.name = tempName.value;
    isEditingName.value = false;
  } catch (e) { alert("Không thể cập nhật tên"); }
};

onMounted(async () => {
  const res = await axios.get('/api/profile');
  data.value = res.data;
  tempName.value = res.data.userInfo.name;
});
</script>