<template>
  <div>
    <div class="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-3xl p-10 mb-8 text-white flex justify-between items-center shadow-xl relative overflow-hidden border-4 border-white">
      <div class="relative z-10 flex flex-col gap-5">
        <div>
          <h2 class="text-3xl font-black mb-2 italic uppercase tracking-tight">Chào thuyền trưởng! 👋</h2>
          <p class="text-blue-100 text-sm font-bold opacity-80">Hệ thống đang vận hành trơn tru. Bạn có dữ liệu mới để kiểm tra.</p>
        </div>
        
        <router-link to="/" class="w-fit bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-3 transition-all border border-white/20 shadow-lg">
          <Home class="w-4 h-4" /> <span>Rời Dashboard & Về trang học tập</span>
        </router-link>
      </div>
      
      <div class="text-8xl opacity-20 relative z-10 italic font-black">MATH</div>
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="s in statsList" :key="s.lbl" class="bg-white p-7 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
        <span class="text-4xl mb-4 block group-hover:scale-125 transition-transform duration-300">{{ s.icon }}</span>
        <div class="text-4xl font-black text-slate-800 tracking-tighter">{{ s.val }}</div>
        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{{ s.lbl }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Home } from 'lucide-vue-next';

// Khởi tạo stats với dữ liệu mặc định
const statsList = ref([
  { icon: '👥', val: '0', lbl: 'Tổng học sinh', key: 'totalStudents' },
  { icon: '✅', val: '0', lbl: 'Bài nộp hôm nay', key: 'submissionsToday' },
  { icon: '📋', val: '0', lbl: 'Thử thách đang mở', key: 'activeChallenges' },
  { icon: '👨‍🏫', val: '0', lbl: 'Giáo viên online', key: 'totalTeachers' }
]);

const fetchStats = async () => {
  try {
    const res = await axios.get('/api/admin/stats');
    // Cập nhật giá trị từ API vào mảng hiển thị
    statsList.value.forEach(s => {
      s.val = res.data[s.key] || 0;
    });
  } catch (e) {
    console.error("Không thể tải thống kê:", e);
  }
};

onMounted(fetchStats);
</script>