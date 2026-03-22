<template>
  <div>
    <div class="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-8 mb-8 text-white flex justify-between items-center shadow-xl relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-2xl font-black mb-2 italic">Chào mừng trở lại! 👋</h2>
        <p class="text-blue-100 text-sm">Hệ thống đang hoạt động ổn định. Bạn có 5 thông báo mới từ học sinh.</p>
      </div>
      <div class="text-7xl opacity-20 relative z-10 italic">🎓</div>
      <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="s in stats" :key="s.lbl" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <span class="text-3xl mb-4 block group-hover:scale-110 transition-transform">{{ s.icon }}</span>
        <div class="text-3xl font-black text-slate-800">{{ s.val }}</div>
        <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{{ s.lbl }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { icon: '👥', val: '284', lbl: 'Tổng học sinh' },
  { icon: '✅', val: '67', lbl: 'Bài nộp hôm nay' },
  { icon: '📋', val: '18', lbl: 'Thử thách đang mở' },
  { icon: '👨‍🏫', val: '5', lbl: 'Giáo viên online' }
];
</script>