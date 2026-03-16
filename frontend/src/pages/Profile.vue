<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-500 p-6 font-sans relative overflow-hidden">
    <div v-if="data" class="max-w-6xl mx-auto relative z-10">
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
          <User class="w-10 h-10" /> Hồ Sơ Thủy Thủ
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300 text-center">
            <div class="relative inline-block group cursor-pointer" @click="$refs.fileInput.click()">
              <img :src="data.userInfo.avatar ? `/images/avatars/${data.userInfo.avatar}` : '/images/avatars/ava3.jpg'" 
                   class="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover mx-auto">
              <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera class="text-white w-8 h-8" />
              </div>
              <input type="file" ref="fileInput" class="hidden" @change="handleAvatarUpload" accept="image/*">
            </div>
            <div class="mt-4">
              <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg inline-block text-xl">
                {{ data.userInfo.title }}
              </div>
              <p class="text-blue-700 font-extrabold mt-3 text-2xl drop-shadow-sm italic">Hạng #{{ data.userInfo.rank }}</p>
            </div>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-3xl p-6 border-4 border-cyan-300 shadow-xl">
             <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp class="text-blue-600" /> Thống Kê</h3>
             <div class="space-y-3">
                
                <div class="flex justify-between p-3 bg-pink-50 rounded-xl"><span>Ngọc Trai</span><span class="font-bold text-pink-600">{{ data.achievements.pearls }}</span></div>
                <div class="flex justify-between p-3 bg-pink-50 rounded-xl"><span>Vỏ sò</span><span class="font-bold text-pink-600">{{ data.achievements.shells }}</span></div>
                <div class="flex justify-between p-3 bg-pink-50 rounded-xl"><span>Kho Báu</span><span class="font-bold text-pink-600">{{ data.achievements.treasures }}</span></div>

                <div class="flex justify-between p-3 bg-blue-50 rounded-xl"><span>Tổng Điểm</span><span class="font-bold text-blue-600">{{ data.achievements.totalScore }}</span></div>
             </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Medal class="text-yellow-600" /> Huy Hiệu Thành Tích</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="badge in data.badges" :key="badge.id" 
                @click="openBadgeDetail(badge)"
                :class="['relative p-4 rounded-2xl border-4 text-center cursor-pointer transition-all hover:scale-105 shadow-md', 
                        badge.unlocked ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}` : 'bg-gray-200 grayscale']">
                <div class="text-5xl mb-2">{{ badge.icon }}</div>
                <p class="text-sm font-bold" :class="badge.unlocked ? 'text-white shadow-sm' : 'text-gray-500'">{{ badge.name }}</p>
                <div v-if="!badge.unlocked" class="absolute top-2 right-2"><Lock class="w-4 h-4 text-gray-400" /></div>
              </div>
            </div>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-2"><Settings class="text-gray-600"/> Cài Đặt</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Tên Thủy Thủ</label>
                <div class="flex gap-2 mt-1">
                  <input v-model="data.userInfo.name" class="flex-1 px-4 py-2 bg-gray-50 border rounded-xl focus:border-blue-400 outline-none border-gray-200">
                  <button @click="saveInfo('name')" class="p-2 bg-blue-500 text-white rounded-lg"><Save class="w-5 h-5"/></button>
                </div>
              </div>
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Username</label>
                <div class="flex gap-2 mt-1">
                  <input v-model="data.userInfo.username" class="flex-1 px-4 py-2 bg-gray-50 border rounded-xl focus:border-blue-400 outline-none border-gray-200">
                  <button @click="saveInfo('username')" class="p-2 bg-blue-500 text-white rounded-lg"><Save class="w-5 h-5"/></button>
                </div>
              </div>
            </div>
            <button @click="showPassModal = true" class="w-full py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg">Đổi Mật Khẩu</button>
          </div>

          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Calendar class="text-purple-600" /> Hoạt Động Gần Đây</h3>
            <div class="space-y-3">
              <div v-for="act in data.recentActivities" :key="act.date" class="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div><p class="font-bold text-gray-800">{{ act.title }}</p><p class="text-sm text-gray-600">{{ act.date }}</p></div>
                <span class="px-3 py-1 bg-green-500 text-white rounded-full font-bold text-sm">+{{ act.points }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedBadge" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="selectedBadge = null">
       <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-8 border-cyan-200 text-center relative">
          <button @click="selectedBadge = null" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
          <div class="text-7xl mb-4">{{ selectedBadge.icon }}</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedBadge.name }}</h2>
          
          <div class="my-6">
             <div class="flex justify-between text-sm font-bold mb-2 text-blue-800">
                <span>Tiến trình hiện tại:</span>
                <span>{{ selectedBadge.current }} / {{ selectedBadge.target }} {{ selectedBadge.unit }}</span>
             </div>
             <div class="w-full bg-gray-200 h-6 rounded-full overflow-hidden border-2 border-gray-300 shadow-inner">
                <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out" 
                     :style="{ width: Math.min((selectedBadge.current / selectedBadge.target) * 100, 100) + '%' }"></div>
             </div>
          </div>

          <div v-if="selectedBadge.unlocked" class="bg-green-100 text-green-700 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-green-200">
             <CheckCircle class="w-6 h-6" /> Đã hoàn thành thành tựu này
          </div>
          <p v-else class="text-gray-500 font-bold italic bg-gray-50 p-3 rounded-xl border">Cố gắng thêm một chút nữa để mở khóa nhé!</p>
       </div>
    </div>

    <div v-if="showPassModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
       <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-orange-300">
          <h2 class="text-2xl font-bold mb-4 flex gap-2"><Lock class="text-orange-500"/> Bảo Mật</h2>
          <input v-model="pass.old" type="password" placeholder="Mật khẩu cũ" class="w-full mb-3 px-4 py-3 border rounded-xl outline-none bg-gray-50">
          <input v-model="pass.new" type="password" placeholder="Mật khẩu mới" class="w-full mb-6 px-4 py-3 border rounded-xl outline-none bg-gray-50">
          <div class="flex gap-2">
             <button @click="handleChangePass" class="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold">Lưu</button>
             <button @click="showPassModal = false" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Hủy</button>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { User, Save, TrendingUp, Medal, Camera, Lock, X, CheckCircle, Settings, Award, Gem, Calendar } from 'lucide-vue-next';

const data = ref(null);
const selectedBadge = ref(null);
const showPassModal = ref(false);
const pass = ref({ old: '', new: '' });

const getRarityColor = (rarity) => {
  if (rarity === 'legendary') return 'from-yellow-400 to-orange-500 border-yellow-300 text-white';
  if (rarity === 'epic') return 'from-purple-400 to-pink-500 border-purple-300 text-white';
  return 'from-blue-400 to-cyan-500 border-blue-300 text-white';
};

const openBadgeDetail = (badge) => { selectedBadge.value = badge; };

const saveInfo = async (type) => {
  try {
    const payload = type === 'name' ? { name: data.value.userInfo.name } : { username: data.value.userInfo.username };
    await axios.put('/api/profile/update', payload);
    alert("Cập nhật thành công!");
  } catch (e) { alert(e.response?.data?.message || "Lỗi cập nhật"); }
};

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('avatar', file);
  try {
    const res = await axios.post('/api/profile/avatar', fd);
    data.value.userInfo.avatar = res.data.filename;
    alert("Đã thay đổi ảnh đại diện!");
  } catch (e) { alert("Lỗi khi tải ảnh lên"); }
};

const handleChangePass = async () => {
  try {
    await axios.post('/api/profile/change-password', { oldPassword: pass.value.old, newPassword: pass.value.new });
    alert("Đã đổi mật khẩu!");
    showPassModal.value = false;
    pass.value = { old: '', new: '' };
  } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
};

onMounted(async () => {
  const res = await axios.get('/api/profile');
  data.value = res.data;
});
</script>