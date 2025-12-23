<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { marked } from 'marked';
import { 
  Compass as CompassIcon, 
  History as HistoryIcon, 
  SendHorizontal as SendIcon 
} from 'lucide-vue-next';

// --- CẤU HÌNH & TRẠNG THÁI ---
const MAX_CHAR = 500;
const HISTORY_KEY = 'math_island_history';

const messages = ref([
  { role: 'bot', text: 'Chào thám hiểm nhí! Cần Thuyền trưởng giúp gì nào? ✨' }
]);

const userInput = ref('');
const isTyping = ref(false);
const chatBox = ref(null);
const inputField = ref(null);

// Lấy lịch sử từ localStorage
const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
const history = ref(savedHistory);

const tags = ref([
  'Cách tính diện tích hình thang',
  'Giải toán bằng sơ đồ đoạn thẳng',
  'Tìm trung bình cộng lớp 4'
]);

// --- COMPUTED ---
const currentCharCount = computed(() => {
  return userInput.value.replace(/\s/g, '').length;
});

const isLimitExceeded = computed(() => {
  return currentCharCount.value > MAX_CHAR;
});

// --- METHODS ---
const handleInput = () => {
  let raw = userInput.value;
  let realCount = 0;
  let result = '';

  for (const ch of raw) {
    if (!/\s/.test(ch)) realCount++;
    if (realCount > MAX_CHAR) break;
    result += ch;
  }

  if (result !== raw) {
    userInput.value = result;
  }
  nextTick(adjustHeight);
};

const renderMarkdown = (text) => {
  marked.setOptions({ breaks: true });
  return marked.parse(text);
};

const adjustHeight = () => {
  const el = inputField.value;
  if (!el) return;
  el.style.height = '40px';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

const handleEnter = (e) => {
  if (!e.shiftKey) {
    sendMessage();
  } else {
    nextTick(adjustHeight);
  }
};

const fillInput = (text) => {
  userInput.value = text;
  nextTick(() => {
    inputField.value?.focus();
    adjustHeight();
  });
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLimitExceeded.value) return;

  // Cập nhật lịch sử
  const existingIndex = history.value.indexOf(text);
  if (existingIndex !== -1) history.value.splice(existingIndex, 1);
  history.value.unshift(text);
  if (history.value.length > 3) history.value.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value));

  messages.value.push({ role: 'user', text });
  userInput.value = '';
  
  nextTick(() => {
    adjustHeight();
    scrollToBottom();
  });

  isTyping.value = true;
  try {
    // Gọi đến API backend của dự án
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    messages.value.push({ role: 'bot', text: data.reply });
  } catch (err) {
    messages.value.push({ role: 'bot', text: "❌ Lỗi kết nối hải trình rồi!" });
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};
</script>

<template>
  <div class="smart-input-page">
    <div id="app-container">
      <aside class="sidebar">
        <h1>🏝️ ĐẢO TOÁN HỌC<br>RỰC RỠ</h1>
        
        <div class="section-title">
          <CompassIcon :size="20" /> Gợi ý học tập
        </div>
        <div class="list-container">
          <div v-for="tag in tags" :key="tag" @click="fillInput(tag)" class="item-card" :title="tag">
            📍 {{ tag }}
          </div>
        </div>

        <div class="section-title">
          <HistoryIcon :size="20" /> Câu hỏi gần đây
        </div>
        <div class="list-container">
          <div v-for="q in history" :key="q" @click="fillInput(q)" class="item-card" :title="q">
            ❓ {{ q }}
          </div>
        </div>
      </aside>

      <main class="chat-card">
        <div class="chat-box" ref="chatBox">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
            <div v-html="renderMarkdown(msg.text)"></div>
          </div>
          <div v-if="isTyping" class="typing-indicator">
            🌊 Thuyền trưởng đang giải toán...
          </div>
        </div>

        <div class="input-area-wrapper">
          <div class="input-container">
            <textarea 
              v-model="userInput" 
              @input="handleInput"
              @keydown.enter.prevent="handleEnter"
              ref="inputField"
              placeholder="Gõ câu hỏi vào đây..."
            ></textarea>
            
            <button 
              class="send-btn" 
              @click="sendMessage" 
              :disabled="isLimitExceeded || currentCharCount === 0"
            >
              <SendIcon :size="24" />
            </button>
          </div>

          <div class="word-count" :style="{ color: isLimitExceeded ? 'red' : '' }">
            {{ currentCharCount }} / 500 ký tự (không tính khoảng trắng)
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.smart-input-page {
  --primary-sky: #00d2ff;
  --accent-sun: #ffce00;
  --sidebar-width: 300px;
  --text-bold: #000000;
  --shadow-deep: 0 15px 45px rgba(0,0,0,0.2);

  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  font-family: 'Quicksand', sans-serif;
  color: var(--text-bold);
  overflow: hidden;
}

#app-container {
  width: 95%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  gap: 25px;
}

.sidebar {
  flex: 0 0 var(--sidebar-width);
  background: white;
  border-radius: 35px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-deep);
  border: 5px solid white;
}

.sidebar h1 { font-size: 1.5rem; color: #ff5722; text-align: center; margin-top: 0; font-weight: 800; }

.section-title { font-weight: 800; margin: 25px 0 10px; display: flex; align-items: center; gap: 8px; }

.item-card {
  background: #f1f5f9; padding: 12px 18px; border-radius: 18px;
  cursor: pointer; font-weight: 700; font-size: 0.9rem;
  border: 2px solid transparent; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; transition: 0.3s;
  margin-bottom: 8px;
}
.item-card:hover { background: #e0f2fe; border-color: var(--primary-sky); transform: translateX(5px); }

.chat-card {
  flex: 1; background: white; border-radius: 35px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: var(--shadow-deep); border: 5px solid white;
}

.chat-box {
  flex: 1; padding: 30px; overflow-y: auto; background: #f8fbff;
  display: flex; flex-direction: column; gap: 20px;
}

.message {
  max-width: 80%; padding: 18px 25px; border-radius: 25px;
  line-height: 1.6; font-weight: 700; font-size: 1.05rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.bot { align-self: flex-start; background: white; border-left: 8px solid var(--accent-sun); }
.user { align-self: flex-end; background: var(--primary-sky); color: white !important; }

.typing-indicator { color: #0ea5e9; font-weight: 800; }

.input-area-wrapper {
  padding: 20px 30px; background: white; border-top: 2px solid #f0f0f0;
}

.input-container {
  display: flex; align-items: flex-end; gap: 15px;
  background: #f1f5f9; padding: 10px 15px;
  border-radius: 25px; border: 2px solid #e2e8f0;
}

textarea {
  flex: 1; border: none; background: transparent;
  outline: none; font-family: inherit;
  font-weight: 700; font-size: 1.05rem; color: var(--text-bold);
  padding: 10px 5px;
  resize: none; 
  height: 40px;
  max-height: 150px;
  line-height: 1.5;
  overflow-y: auto;
}

.word-count {
  text-align: right; font-size: 0.75rem; color: #64748b;
  margin-top: 5px; margin-right: 70px;
}

.send-btn {
  background: var(--accent-sun); border: none;
  width: 50px; height: 50px; border-radius: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 0 #d4ac0d; flex-shrink: 0;
}
.send-btn:active { transform: translateY(2px); box-shadow: none; }
.send-btn:disabled { background: #cbd5e1; box-shadow: none; }

textarea::-webkit-scrollbar { width: 7px; }
textarea::-webkit-scrollbar-thumb { background: #86898e; border-radius: 10px; }
</style>