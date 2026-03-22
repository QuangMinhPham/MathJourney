<template>
  <div class="space-y-6 font-sans pb-10">
    <div class="flex items-center gap-4 mb-8">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-2xl text-white shadow-lg shadow-orange-200">
        <UploadCloud class="w-7 h-7" />
      </div>
      <div>
        <h2 class="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Upload Đề bài</h2>
        <p class="text-slate-500 text-sm font-bold">Quản lý và tải lên tài liệu học tập</p>
      </div>
    </div>

    <div class="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-12 shadow-2xl border-4 border-white">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-10 right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div class="text-7xl animate-bounce">🚧</div>
        
        <div class="flex-1 text-center md:text-left">
          <h3 class="text-2xl md:text-3xl font-black text-white italic uppercase mb-3">
            Tính năng đang được phát triển{{ dotsStr }}
          </h3>
          <p class="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
            Chúng tôi đang xây dựng hệ thống <b class="text-white">Upload Đề bài thông minh</b> — cho phép giáo viên tải lên, phân loại và xuất bản tài liệu trực tiếp. Tính năng này sẽ sớm cập bến Math Journey!
          </p>

          <div class="mt-8 max-w-md mx-auto md:mx-0">
            <div class="flex justify-between items-end mb-2">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiến độ hoàn thiện</span>
              <span class="text-lg font-black text-yellow-400">{{ Math.round(progress) }}%</span>
            </div>
            <div class="h-3 bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/5">
              <div 
                class="h-full bg-gradient-to-r from-orange-500 to-yellow-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-500 ease-out"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mt-8 justify-center md:justify-start">
            <span v-for="(tag, i) in devTags" :key="tag" 
                  :class="i < 3 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-500 border-white/10'"
                  class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2">
              <CheckCircle v-if="i < 3" class="w-3 h-3" />
              <Circle v-else class="w-3 h-3" />
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden mt-10">
      <div class="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-4">
        <div class="flex gap-1.5">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div class="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-1.5 text-[11px] text-slate-400 font-medium flex items-center gap-2 shadow-sm">
          <Lock class="w-3 h-3 text-slate-300" />
          <span>mathjourney.app/admin/upload — </span>
          <span class="text-orange-500 font-black italic uppercase">Bản xem trước giao diện</span>
        </div>
      </div>

      <div class="p-1">
        <iframe 
          class="w-full h-[520px] rounded-b-[2rem]"
          title="Upload UI Demo"
          :srcdoc="iframeSrcDoc"
        ></iframe>
      </div>
    </div>

    <div class="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl flex items-start gap-4 italic">
      <div class="text-2xl flex-shrink-0">💡</div>
      <p class="text-amber-800 text-sm leading-relaxed font-bold">
        Lưu ý cho Thuyền trưởng: Khung phía trên là bản mô phỏng giao diện đang được xây dựng. Các nút bấm và chức năng kéo thả chưa hoạt động thực tế.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { UploadCloud, CheckCircle, Circle, Lock } from 'lucide-vue-next';

// Logic cho hiệu ứng "..." và Progress bar
const dots = ref(0);
const dotsStr = ref('');
const progress = ref(0);
const devTags = ["Upload file", "Drag & Drop", "Phân loại đề", "Preview PDF", "Publish"];

let dotsInterval, progressInterval;

onMounted(() => {
  dotsInterval = setInterval(() => {
    dots.value = (dots.value + 1) % 4;
    dotsStr.value = '.'.repeat(dots.value);
  }, 500);

  progressInterval = setInterval(() => {
    if (progress.value < 87) {
      progress.value += Math.random() * 2;
    }
  }, 600);
});

onUnmounted(() => {
  clearInterval(dotsInterval);
  clearInterval(progressInterval);
});

// Nội dung HTML cho Iframe demo
const iframeSrcDoc = `
<!DOCTYPE html>
<html>
<head>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',sans-serif}
  body{background:#F8FAFC;padding:30px;color:#0F172A}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:25px}
  .card{background:#fff;border:2px solid #E2E8F0;border-radius:12px;padding:12px 15px}
  .card b{display:block;font-size:10px;color:#94A3B8;text-transform:uppercase;margin-bottom:4px;letter-spacing:0.05em}
  .card p{font-size:13px;font-weight:800}
  .drop-zone{border:3px dashed #CBD5E1;background:#F1F5F9;border-radius:20px;padding:60px;text-align:center;color:#64748B;cursor:not-allowed;margin-bottom:20px}
  .file-list{background:#fff;border:1.5px solid #E2E8F0;border-radius:15px;overflow:hidden}
  .file-item{display:flex;align-items:center;gap:15px;padding:15px 20px;border-bottom:1px solid #F1F5F9}
  .icon{width:40px;height:40px;background:#E2E8F0;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
  .progress-bar{height:6px;background:#E2E8F0;border-radius:10px;width:150px;margin-top:5px;overflow:hidden}
  .progress-fill{height:100%;background:#3B82F6;width:100%}
  .badge{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:800;background:#DCFCE7;color:#15803D}
  .btn{float:right;background:#3B82F6;color:#fff;padding:12px 30px;border-radius:12px;font-weight:900;border:none;opacity:0.5;cursor:not-allowed}
</style>
</head>
<body>
  <div class="grid">
    <div class="card"><b>Môn học</b><p>Toán học</p></div>
    <div class="card"><b>Phân loại</b><p>Kiểm tra chương</p></div>
    <div class="card"><b>Lớp</b><p>Thủy thủ lớp 4</p></div>
    <div class="card"><b>Hạn nộp</b><p>30/03/2026</p></div>
  </div>
  <div class="drop-zone">
    <div style="font-size:40px;margin-bottom:10px">📁</div>
    <p style="font-weight:800;color:#3B82F6">Kéo thả file đề bài vào đây</p>
    <p style="font-size:12px">Hỗ trợ PDF, Word, PNG (Max 10MB)</p>
  </div>
  <div class="file-list">
    <div class="file-item">
      <div class="icon">📄</div>
      <div style="flex:1"><b>de_toan_ki_1.pdf</b><div class="progress-bar"><div class="progress-fill"></div></div></div>
      <span class="badge">Sẵn sàng</span>
    </div>
  </div>
  <button class="btn" style="margin-top:20px">ĐĂNG ĐỀ BÀI</button>
</body>
</html>`;
</script>