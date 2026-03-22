<template>
  <div class="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
    <aside class="w-64 bg-slate-900 flex flex-col flex-shrink-0 transition-all duration-300">
      <div class="p-6 border-b border-white/10 flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">🎓</div>
        <div>
          <h1 class="text-white font-extrabold text-sm tracking-tight">MathJourney</h1>
          <p class="text-slate-500 text-[10px] font-medium uppercase">Quản lý Giáo dục</p>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu chính</p>
        
        <router-link to="/admin" class="nav-item" active-class="active">
          <LayoutGrid class="w-4 h-4" /> <span>Tổng quan</span>
        </router-link>

        <router-link to="/admin/students" class="nav-item" active-class="active">
          <Users class="w-4 h-4" /> <span>Quản lý học sinh</span>
        </router-link>
        
        <router-link to="/admin/edit-questions" class="nav-item" active-class="active">
          <Edit3 class="w-4 h-4" /> <span>Sửa đề và đáp án</span>
        </router-link>

        <router-link to="/admin/grades" class="nav-item" active-class="active">
            <BarChart3 class="w-4 h-4" /> <span>Kết quả học tập</span>
        </router-link>

        <router-link to="/admin/upload" class="nav-item" active-class="active">
          <UploadCloud class="w-4 h-4" /> <span>Quản lý tài liệu</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-white/5 flex items-center gap-3 bg-slate-900/50">
        <div class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs">QT</div>
        <div class="overflow-hidden">
          <p class="text-slate-200 text-xs font-bold truncate">Quản trị viên</p>
          <p class="text-slate-500 text-[10px] truncate">admin@school.vn</p>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-400">🏠 Trang chủ</span>
          <span class="text-slate-300">/</span>
          <span class="font-bold text-slate-800">{{ $route.meta.title || 'Dashboard' }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
            📅 {{ currentDate }}
          </span>
          <button class="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
            <Bell class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <section class="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup>
import { LayoutGrid, Users, Edit3, UploadCloud, Bell } from 'lucide-vue-next';
const currentDate = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
</script>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 px-3 py-2.5 text-slate-400 font-semibold text-sm rounded-xl transition-all hover:bg-white/5 hover:text-slate-200;
}
.nav-item.active {
  @apply bg-blue-600/10 text-blue-400 border-l-4 border-blue-600 rounded-l-none;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>