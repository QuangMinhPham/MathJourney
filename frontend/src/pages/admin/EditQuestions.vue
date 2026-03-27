<template>
  <div class="max-w-6xl mx-auto pb-20">
    <div class="flex items-center gap-4 mb-8">
      <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg italic font-black">✏</div>
      <div>
        <h2 class="text-2xl font-black text-slate-800 italic uppercase tracking-tight">Sửa Đề và Đáp án</h2>
        <p class="text-slate-500 text-sm">Cập nhật nội dung bài học từ hệ thống</p>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">📖 Chọn Bài học</label>
          <select v-model="selectedChapter" @change="fetchChallenges" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500">
            <option value="">— Chọn bài học —</option>
            <option v-for="ch in chapters" :key="ch.chapter_id" :value="ch.chapter_id">{{ ch.title }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">🔖 Chọn Dạng bài</label>
          <select v-model="selectedChallenge" :disabled="!challenges.length" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none disabled:opacity-50">
            <option value="">— Chọn dạng bài —</option>
            <option v-for="c in challenges" :key="c.challenge_id" :value="c.challenge_id">{{ c.title }} ({{ c.type }})</option>
          </select>
        </div>
      </div>

      <!-- Sửa tên & ảnh bài học (hiện ra sau khi chọn bài) -->
      <div v-if="selectedChapter" class="mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-4">

        <!-- Tên bài học -->
        <div>
          <label class="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">✏️ Tên Bài Học</label>
          <div class="flex gap-3">
            <input v-model="editingChapterTitle"
              class="flex-1 bg-white border-2 border-amber-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-amber-400 transition-colors"
              placeholder="Nhập tên bài học..." />
            <button @click="saveChapterTitle" :disabled="isSavingTitle"
              class="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
              <Save class="w-4 h-4" /> {{ isSavingTitle ? 'Đang lưu...' : 'Lưu tên' }}
            </button>
          </div>
          <p v-if="titleSaveMsg" class="mt-2 text-sm font-bold" :class="titleSaveMsg.ok ? 'text-green-600' : 'text-red-500'">
            {{ titleSaveMsg.text }}
          </p>
        </div>

        <!-- Ảnh minh họa -->
        <div>
          <label class="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">🖼️ Ảnh Minh Họa</label>
          <div class="flex items-center gap-4">
            <!-- Preview ảnh hiện tại -->
            <div class="w-24 h-16 rounded-xl overflow-hidden border-2 border-amber-200 bg-slate-100 flex-shrink-0">
              <img v-if="currentChapterImage && !imageLoadError"
                :key="currentChapterImage"
                :src="currentChapterImage"
                class="w-full h-full object-cover"
                @error="imageLoadError = true"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">Chưa có</div>
            </div>
            <!-- Nút chọn file -->
            <div class="flex-1">
              <input type="file" ref="chapterImageInput" class="hidden" accept="image/*" @change="handleChapterImageUpload" />
              <button @click="chapterImageInput.click()" :disabled="isUploadingImage"
                class="bg-white border-2 border-amber-300 hover:border-amber-500 text-amber-700 font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
                <ImageIcon class="w-4 h-4" /> {{ isUploadingImage ? 'Đang tải...' : 'Chọn ảnh mới' }}
              </button>
            </div>
          </div>
          <p v-if="imageSaveMsg" class="mt-2 text-sm font-bold" :class="imageSaveMsg.ok ? 'text-green-600' : 'text-red-500'">
            {{ imageSaveMsg.text }}
          </p>
        </div>

      </div>

      <button @click="loadQuestions" :disabled="!selectedChallenge || loading" class="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-xl shadow-xl transition-all">
        {{ loading ? '⏳ ĐANG TẢI...' : ' LOAD DỮ LIỆU' }}
      </button>
    </div>

    <div v-if="questions.length || currentType === 'matching'" class="space-y-6">
      
      <div v-if="currentType === 'matching'" class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
         <div class="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <span class="text-teal-600 font-black italic">BẢNG NỐI CẶP (MATCHING)</span>
            <span class="bg-teal-100 text-teal-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">5 cặp nối</span>
         </div>
         <div class="p-8">
            <div class="grid grid-cols-11 gap-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
               <div class="col-span-5 text-center">Vế trái (Câu hỏi)</div>
               <div class="col-span-1"></div>
               <div class="col-span-4 text-center">Vế phải (Đáp án)</div>
               <div class="col-span-1 text-center">Nối</div>
            </div>
            <div v-for="(p, pi) in questions[0]?.pairs" :key="pi" class="grid grid-cols-11 gap-3 items-center mb-4">
               <div class="col-span-5">
                  <input v-model="p.left_text" class="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 focus:border-teal-400 outline-none" placeholder="// Nội dung vế trái...">
               </div>
               <div class="col-span-1 text-center text-teal-400 font-black text-xl">⇢</div>
               <div class="col-span-4">
                  <input v-model="p.right_text" class="w-full p-3 bg-teal-50 border-2 border-teal-100 rounded-xl font-bold text-slate-700 focus:border-teal-400 outline-none" placeholder="// Nội dung vế phải...">
               </div>
               <div class="col-span-1">
                  <input v-model="p.correct_match" class="w-full p-3 text-center bg-green-50 border-2 border-green-100 rounded-xl font-black text-green-700 uppercase" maxlength="1" placeholder="a">
               </div>
            </div>
         </div>
      </div>

      <template v-else>
        <div v-for="(q, index) in questions" :key="index" class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:border-blue-300 transition-all">
          <div class="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
            <span class="text-blue-600 font-black italic">CÂU HỎI {{ index + 1 }}</span>
            <span v-if="!q.question_id" class="text-orange-500 text-[10px] font-bold uppercase italic">Mới / Chưa thêm</span>
          </div>
          
          <div class="p-6">
            <textarea v-model="q.question_text" rows="2" 
              class="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 focus:border-blue-400 outline-none mb-6"
              placeholder="// Câu hỏi này chưa được thêm vào hệ thống..."></textarea>
            
            <div v-if="currentType === 'quiz' && q.options" class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div v-for="(opt, oi) in q.options" :key="oi" :class="['flex items-center gap-3 p-4 rounded-2xl border-2 transition-all', opt.is_correct ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50']">
                  <input type="radio" :name="'correct_'+index" :checked="opt.is_correct" @change="setCorrect(q, opt)" class="w-5 h-5 accent-green-600">
                  <input v-model="opt.option_text" class="bg-transparent flex-1 font-bold text-slate-700 outline-none" placeholder="Nhập đáp án...">
               </div>
            </div>

            <div v-if="currentType === 'short_answer' && q.short_answers" class="space-y-2">
               <div v-for="(ans, ai) in q.short_answers" :key="ai">
                  <input v-model="ans.correct_answer" class="w-full p-4 bg-green-50 border-2 border-green-100 rounded-2xl font-black text-green-700 outline-none" placeholder="Đáp án chính xác...">
               </div>
            </div>
          </div>
        </div>
      </template>

      <div class="sticky bottom-6 flex justify-end">
        <button @click="saveToDb" class="bg-green-500 hover:bg-green-600 text-white font-black py-5 px-14 rounded-2xl shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
          <Save class="w-6 h-6"/> LƯU THAY ĐỔI
        </button>
      </div>
    </div>
  </div>    
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Save, Image as ImageIcon } from 'lucide-vue-next';

const chapters = ref([]);
const challenges = ref([]);
const questions = ref([]);
const currentType = ref('');
const selectedChapter = ref('');
const selectedChallenge = ref('');
const loading = ref(false);
const editingChapterTitle = ref('');
const isSavingTitle = ref(false);
const titleSaveMsg = ref(null);
const currentChapterImage = ref('');
const imageLoadError = ref(false);
const isUploadingImage = ref(false);
const imageSaveMsg = ref(null);
const chapterImageInput = ref(null); // template ref — bound via ref="chapterImageInput"

onMounted(async () => {
  const res = await axios.get('/api/admin/chapters');
  chapters.value = res.data;
});

const fetchChallenges = async () => {
  if (!selectedChapter.value) return;
  const res = await axios.get(`/api/admin/challenges/${selectedChapter.value}`);
  challenges.value = res.data;
  selectedChallenge.value = '';
  questions.value = [];
  currentType.value = '';
  titleSaveMsg.value = null;
  imageSaveMsg.value = null;
  imageLoadError.value = false;
  // Điền sẵn tên và ảnh bài học hiện tại
  const chapter = chapters.value.find(c => c.chapter_id === selectedChapter.value);
  editingChapterTitle.value = chapter ? chapter.title : '';
  currentChapterImage.value = chapter?.image ? `/images/chapters/${chapter.image}` : '';
};

const handleChapterImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  isUploadingImage.value = true;
  imageSaveMsg.value = null;
  const fd = new FormData();
  fd.append('image', file);
  try {
    const res = await axios.post(`/api/admin/chapter-image/${selectedChapter.value}`, fd);
    const filename = res.data.filename;
    // Cập nhật preview và cache trong danh sách chapters
    imageLoadError.value = false;
    currentChapterImage.value = `/images/chapters/${filename}?t=${Date.now()}`;
    const chapter = chapters.value.find(c => c.chapter_id === selectedChapter.value);
    if (chapter) chapter.image = filename;
    imageSaveMsg.value = { ok: true, text: '✅ Đã cập nhật ảnh minh họa!' };
  } catch {
    imageSaveMsg.value = { ok: false, text: 'Lỗi khi tải ảnh lên' };
  } finally {
    isUploadingImage.value = false;
    e.target.value = ''; // reset input để có thể chọn lại cùng file
  }
};

const saveChapterTitle = async () => {
  if (!editingChapterTitle.value.trim()) return;
  isSavingTitle.value = true;
  titleSaveMsg.value = null;
  try {
    await axios.put(`/api/admin/update-chapter/${selectedChapter.value}`, { title: editingChapterTitle.value });
    // Cập nhật lại tên trong danh sách dropdown
    const chapter = chapters.value.find(c => c.chapter_id === selectedChapter.value);
    if (chapter) chapter.title = editingChapterTitle.value.trim();
    titleSaveMsg.value = { ok: true, text: '✅ Đã cập nhật tên bài học!' };
  } catch (e) {
    titleSaveMsg.value = { ok: false, text: e.response?.data?.message || 'Lỗi khi lưu tên bài học' };
  } finally {
    isSavingTitle.value = false;
  }
};

// Hàm tạo cấu trúc câu hỏi trống
const createEmptyQuestion = (type) => {
  const q = { question_id: null, question_text: '', order_index: null };
  if (type === 'quiz') {
    q.options = Array.from({ length: 4 }, () => ({ option_id: null, option_text: '', is_correct: false }));
  } else if (type === 'matching') {
    // Dạng 2: Có mảng pairs chứa 5 cặp
    q.pairs = Array.from({ length: 5 }, () => ({ pair_id: null, left_text: '', right_text: '', correct_match: '' }));
  } else if (type === 'short_answer') {
    q.short_answers = [{ answer_id: null, correct_answer: '' }];
  }
  return q;
};

const loadQuestions = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`/api/admin/questions/${selectedChallenge.value}`);
    currentType.value = res.data.type;
    let data = res.data.questions;

    if (currentType.value === 'matching') {
        // Dạng 2: Phải đảm bảo có đúng 1 question object và 5 pairs
        if (data.length === 0) {
            data = [createEmptyQuestion('matching')];
        } else {
            // Nếu đã có question nhưng thiếu cặp, bù cho đủ 5
            while (data[0].pairs.length < 5) {
                data[0].pairs.push({ pair_id: null, left_text: '', right_text: '', correct_match: '' });
            }
        }
    } else {
        // Dạng 1 (10 câu) & Dạng 3 (5 câu)
        const targetCount = currentType.value === 'quiz' ? 10 : 5;
        while (data.length < targetCount) {
            data.push(createEmptyQuestion(currentType.value));
        }
    }
    
    questions.value = data;
  } catch (e) { alert("Lỗi tải"); }
  loading.value = false;
};

const setCorrect = (q, selected) => {
  q.options.forEach(o => o.is_correct = (o === selected));
};

const saveToDb = async () => {
  try {
    const res = await axios.post('/api/admin/update-questions', { 
        challenge_id: selectedChallenge.value,
        type: currentType.value, 
        questions: questions.value 
    });
    alert(res.data.message);
    loadQuestions(); // Load lại để cập nhật ID thực từ DB
  } catch (e) { alert("Lỗi khi lưu dữ liệu!"); }
};
</script>