<template>
  <div class="space-y-6 font-sans pb-10">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">📊</div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Báo cáo điểm số</h2>
          <p class="text-slate-500 text-sm font-bold">
            Chế độ: {{ selectedChapterId === 'all' ? 'Tổng kết toàn hệ thống' : 'Chi tiết từng bài' }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm">
        <span class="text-[10px] font-black text-slate-400 uppercase ml-3 italic">Phạm vi:</span>
        <select v-model="selectedChapterId" @change="fetchGrades" class="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-blue-600 outline-none cursor-pointer">
          <option value="all">Tất cả bài tập các chương</option>
          <option v-for="ch in chapters" :key="ch.chapter_id" :value="ch.chapter_id">{{ ch.title }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-5">
      <div class="relative">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <input v-model="search" type="search" placeholder="Tìm tên thủy thủ, email hoặc lớp..." 
               class="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 font-bold outline-none text-slate-700">
      </div>
      
      <div class="flex gap-8 px-2">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
          <div class="w-4 h-4 bg-emerald-500 rounded-md"></div> Xuất sắc (≥ 85)
        </div>
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
          <div class="w-4 h-4 bg-blue-500 rounded-md"></div> Đạt (65-84)
        </div>
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
          <div class="w-4 h-4 bg-rose-500 rounded-md"></div> Cải thiện (< 65)
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.1em]">
          <tr>
            <th class="px-8 py-6">ID</th>
            <th class="px-6 py-6">Thủy thủ</th>
            <th class="px-6 py-6">Lớp</th>
            <th class="px-4 py-6 text-center">Dạng 1</th>
            <th class="px-4 py-6 text-center">Dạng 2</th>
            <th class="px-4 py-6 text-center">Dạng 3</th>
            <th class="px-4 py-6 text-center">Tổng điểm</th>
            <th class="px-4 py-6 text-center">Đã làm</th>
            <th class="px-8 py-6 text-center">ĐTB</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="s in filteredGrades" :key="s.user_id" class="hover:bg-blue-50/30 transition-all group">
            <td class="px-8 py-6 font-black text-slate-300 italic">#{{ s.user_id }}</td>
            
            <td class="px-6 py-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-xs shadow-inner">
                  {{ s.full_name?.charAt(0) || '?' }}
                </div>
                <div>
                  <p class="font-black text-slate-800 leading-tight">{{ s.full_name || 'Học sinh' }}</p>
                  <p class="text-[10px] text-slate-400 font-bold lowercase">{{ s.email }}</p>
                </div>
              </div>
            </td>

            <td class="px-6 py-6">
              <span class="bg-slate-100 px-3 py-1 rounded-lg font-black text-slate-500 text-[10px] uppercase border border-slate-200">
                {{ s.class_name || 'N/A' }}
              </span>
            </td>
            
            <td v-for="field in ['score1', 'score2', 'score3']" :key="field" class="px-4 py-6 text-center">
               <span v-if="s[field] === null || s[field] === undefined" class="text-slate-300 font-bold text-xl">—</span>
               <span v-else :class="getScoreColor(s[field])" class="inline-block min-w-[45px] px-2 py-1.5 rounded-xl font-black text-sm shadow-sm border-2 border-white">
                 {{ s[field] }}
               </span>
            </td>
            
            <td class="px-4 py-6 text-center font-black text-slate-800 text-lg">{{ s.total_score || 0 }}</td>
            
            <td class="px-4 py-6 text-center">
              <span :class="s.challenges_done >= 3 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'" 
                    class="px-3 py-1 rounded-full text-[10px] font-black border border-white shadow-sm">
                {{ s.challenges_done }}{{ selectedChapterId === 'all' ? '' : '/3' }}
              </span>
            </td>

            <td class="px-8 py-6 text-center">
               <span :class="getAvgColor(calculateAvg(s))" 
                     class="inline-block min-w-[55px] px-3 py-2 rounded-xl font-black text-sm border-2 border-white shadow-md transition-transform group-hover:scale-110">
                  {{ calculateAvg(s) }}
               </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Search } from 'lucide-vue-next';

const chapters = ref([]);
const grades = ref([]);
const selectedChapterId = ref('all');
const search = ref('');

const fetchChapters = async () => {
  try {
    const res = await axios.get('/api/admin/chapters');
    chapters.value = res.data;
    fetchGrades();
  } catch (e) { console.error("Lỗi tải chương"); }
};

const fetchGrades = async () => {
  try {
    const res = await axios.get(`/api/admin/grades/${selectedChapterId.value}`);
    grades.value = res.data;
  } catch (e) { console.error("Lỗi tải điểm"); }
};

const calculateAvg = (s) => {
  if (!s.total_score || s.challenges_done === 0) return '—';
  return (Number(s.total_score) / Number(s.challenges_done)).toFixed(1);
};

const getScoreColor = (score) => {
  const v = Number(score);
  if (v >= 85) return 'bg-emerald-100 text-emerald-700';
  if (v >= 65) return 'bg-blue-100 text-blue-700';
  return 'bg-rose-100 text-rose-700';
};

const getAvgColor = (avg) => {
  if (avg === '—') return 'text-slate-300 bg-slate-50';
  const v = parseFloat(avg);
  if (v >= 85) return 'bg-emerald-50 text-emerald-600';
  if (v >= 65) return 'bg-blue-50 text-blue-600';
  return 'bg-rose-50 text-rose-600';
};

const filteredGrades = computed(() => {
  const q = search.value.toLowerCase();
  return grades.value.filter(s => 
    s.full_name?.toLowerCase().includes(q) || 
    s.class_name?.toLowerCase().includes(q) ||
    s.email?.toLowerCase().includes(q)
  );
});

onMounted(fetchChapters);
</script>