<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { marked } from 'marked';
import {
  Compass as CompassIcon,
  History as HistoryIcon,
  SendHorizontal as SendIcon,
  BookOpen as BookIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon
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

const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
const history = ref(savedHistory);

const MAX_HISTORY_TURNS = 16;
const conversationHistory = ref([]);

const tags = ref([
  'Cách tính diện tích hình thang',
  'Giải toán bằng sơ đồ đoạn thẳng',
  'Tìm trung bình cộng lớp 4'
]);

// --- RIGHT SIDEBAR STATE ---
const progressData = ref([]); // [{chapter_id, chapter_title, challenges:[{...}]}]
const expandedChapters = ref(new Set());
const expandedChallenges = ref(new Set());
const selectedQuestion = ref(null);

const challengeTypeLabel = (type) => {
  if (type === 'quiz') return 'Trắc nghiệm';
  if (type === 'matching') return 'Nối cặp';
  if (type === 'short_answer') return 'Điền từ';
  return type;
};

const fetchProgress = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/progress/my-progress', {
      headers: { Authorization: `Bearer ${token}` }
    });
    progressData.value = await res.json();
  } catch (e) {
    console.error('Lỗi tải lịch sử:', e);
  }
};

const toggleChapter = (id) => {
  if (expandedChapters.value.has(id)) expandedChapters.value.delete(id);
  else expandedChapters.value.add(id);
  expandedChapters.value = new Set(expandedChapters.value);
};

const toggleChallenge = (id) => {
  if (expandedChallenges.value.has(id)) expandedChallenges.value.delete(id);
  else expandedChallenges.value.add(id);
  expandedChallenges.value = new Set(expandedChallenges.value);
};

const selectQuestion = (q, challenge, chapter) => {
  selectedQuestion.value = selectedQuestion.value?.question_id === q.question_id ? null : { ...q, challenge, chapter };
};

const askSelectedQuestion = () => {
  if (!selectedQuestion.value) return;
  const q = selectedQuestion.value;
  const displayText = `Hỏi ${q.chapter.chapter_title} - ${q.challenge.challenge_title} (${challengeTypeLabel(q.challenge.challenge_type)})`;
  const realMessage = `Câu hỏi: ${q.question_text}\nĐáp án đúng: ${q.correct_answer}\nĐáp án tôi đã chọn: ${q.user_answer}\nHãy giải thích tại sao đáp án đúng là như vậy và tôi đã sai ở đâu.`;

  sendMessageWithContent(displayText, realMessage);
  selectedQuestion.value = null;
};

// --- COMPUTED ---
const currentCharCount = computed(() => userInput.value.replace(/\s/g, '').length);
const isLimitExceeded = computed(() => currentCharCount.value > MAX_CHAR);

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
  if (result !== raw) userInput.value = result;
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
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
};

const handleEnter = (e) => {
  if (!e.shiftKey) sendMessage();
  else nextTick(adjustHeight);
};

const fillInput = (text) => {
  userInput.value = text;
  nextTick(() => { inputField.value?.focus(); adjustHeight(); });
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLimitExceeded.value) return;

  const existingIndex = history.value.indexOf(text);
  if (existingIndex !== -1) history.value.splice(existingIndex, 1);
  history.value.unshift(text);
  if (history.value.length > 3) history.value.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value));

  await sendMessageWithContent(text, text);
};

const sendMessageWithContent = async (displayText, realMessage) => {
  userInput.value = '';
  nextTick(() => { adjustHeight(); scrollToBottom(); });

  messages.value.push({ role: 'user', text: displayText });
  scrollToBottom();

  isTyping.value = true;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: realMessage,
        history: conversationHistory.value.slice(-MAX_HISTORY_TURNS),
      })
    });
    const data = await res.json();
    const botReply = data.reply;

    messages.value.push({ role: 'bot', text: botReply });
    conversationHistory.value.push(
      { role: 'user', parts: [{ text: realMessage }] },
      { role: 'model', parts: [{ text: botReply }] }
    );
  } catch (err) {
    messages.value.push({ role: 'bot', text: '❌ Lỗi kết nối hải trình rồi!' });
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  fetchProgress();
});
</script>

<template>
  <div class="smart-input-page">
    <div id="app-container">

      <!-- SIDEBAR TRÁI: Gợi ý -->
      <aside class="sidebar sidebar-left">
        <h1>🏝️ ĐẢO TOÁN HỌC<br>RỰC RỠ</h1>

        <div class="section-title">
          <CompassIcon :size="18" /> Gợi ý học tập
        </div>
        <div class="list-container">
          <div v-for="tag in tags" :key="tag" @click="fillInput(tag)" class="item-card" :title="tag">
            📍 {{ tag }}
          </div>
        </div>

        <div class="section-title">
          <HistoryIcon :size="18" /> Câu hỏi gần đây
        </div>
        <div class="list-container">
          <div v-for="q in history" :key="q" @click="fillInput(q)" class="item-card" :title="q">
            ❓ {{ q }}
          </div>
        </div>
      </aside>

      <!-- CHAT CHÍNH -->
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

      <!-- SIDEBAR PHẢI: Lịch sử bài tập -->
      <aside class="sidebar sidebar-right">
        <div class="right-header">
          <BookIcon :size="18" />
          <span>Bài tập đã làm</span>
        </div>

        <div v-if="progressData.length === 0" class="empty-progress">
          Chưa có bài tập nào.<br>Hãy luyện tập trước nhé!
        </div>

        <div class="progress-list">
          <div v-for="chapter in progressData" :key="chapter.chapter_id" class="chapter-block">
            <!-- Chapter header -->
            <div class="chapter-header" @click="toggleChapter(chapter.chapter_id)">
              <component :is="expandedChapters.has(chapter.chapter_id) ? ChevronDownIcon : ChevronRightIcon" :size="14" />
              <span class="chapter-title">{{ chapter.chapter_title }}</span>
            </div>

            <!-- Challenges -->
            <div v-if="expandedChapters.has(chapter.chapter_id)">
              <div v-for="challenge in chapter.challenges" :key="challenge.challenge_id" class="challenge-block">
                <div class="challenge-header" @click="toggleChallenge(challenge.challenge_id)">
                  <component :is="expandedChallenges.has(challenge.challenge_id) ? ChevronDownIcon : ChevronRightIcon" :size="12" />
                  <span class="challenge-badge" :class="challenge.challenge_type">{{ challengeTypeLabel(challenge.challenge_type) }}</span>
                  <span class="challenge-title">{{ challenge.challenge_title }}</span>
                </div>

                <!-- Questions -->
                <div v-if="expandedChallenges.has(challenge.challenge_id)" class="questions-list">
                  <div
                    v-for="q in challenge.questions"
                    :key="q.question_id"
                    class="question-item"
                    :class="{
                      'wrong': !q.is_correct,
                      'correct': q.is_correct,
                      'selected': selectedQuestion?.question_id === q.question_id
                    }"
                    @click="selectQuestion(q, challenge, chapter)"
                  >
                    <span class="q-icon">{{ q.is_correct ? '✅' : '❌' }}</span>
                    <span class="q-text">{{ q.question_text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút hỏi câu được chọn -->
        <div v-if="selectedQuestion" class="ask-panel">
          <div class="ask-preview">
            <div class="ask-label">Câu hỏi đã chọn:</div>
            <div class="ask-question-text">{{ selectedQuestion.question_text }}</div>
            <div class="ask-answers">
              <span class="correct-ans">✅ {{ selectedQuestion.correct_answer }}</span>
              <span class="user-ans" :class="{ 'is-wrong': !selectedQuestion.is_correct }">
                👤 {{ selectedQuestion.user_answer }}
              </span>
            </div>
          </div>
          <button class="ask-btn" @click="askSelectedQuestion">
            💬 Hỏi câu này
          </button>
        </div>
      </aside>

    </div>
  </div>
</template>

<style scoped>
.smart-input-page {
  --primary-sky: #00d2ff;
  --accent-sun: #ffce00;
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
  width: 98%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  gap: 16px;
}

/* ===== SIDEBAR CHUNG ===== */
.sidebar {
  background: white;
  border-radius: 28px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-deep);
  overflow: hidden;
}

/* ===== SIDEBAR TRÁI ===== */
.sidebar-left {
  flex: 0 0 260px;
  max-width: 260px;
}

.sidebar-left h1 {
  font-size: 1.2rem;
  color: #ff5722;
  text-align: center;
  margin-top: 0;
  font-weight: 800;
  line-height: 1.3;
}

.section-title {
  font-weight: 800;
  margin: 16px 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.list-container { flex-shrink: 0; }

.item-card {
  background: #f1f5f9;
  padding: 10px 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.82rem;
  border: 2px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: 0.3s;
  margin-bottom: 6px;
}
.item-card:hover {
  background: #e0f2fe;
  border-color: var(--primary-sky);
  transform: translateX(4px);
}

/* ===== CHAT CARD ===== */
.chat-card {
  flex: 1;
  background: white;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-deep);
  min-width: 0;
}

.chat-box {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 80%;
  padding: 14px 20px;
  border-radius: 20px;
  line-height: 1.6;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.bot { align-self: flex-start; background: white; border-left: 6px solid var(--accent-sun); }
.user { align-self: flex-end; background: var(--primary-sky); color: white !important; }

.typing-indicator { color: #0ea5e9; font-weight: 800; }

.input-area-wrapper {
  padding: 16px 24px;
  background: white;
  border-top: 2px solid #f0f0f0;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-bold);
  padding: 8px 4px;
  resize: none;
  height: 40px;
  max-height: 150px;
  line-height: 1.5;
  overflow-y: auto;
}

.word-count {
  text-align: right;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 4px;
  margin-right: 60px;
}

.send-btn {
  background: var(--accent-sun);
  border: none;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 #d4ac0d;
  flex-shrink: 0;
}
.send-btn:active { transform: translateY(2px); box-shadow: none; }
.send-btn:disabled { background: #cbd5e1; box-shadow: none; }

textarea::-webkit-scrollbar { width: 6px; }
textarea::-webkit-scrollbar-thumb { background: #86898e; border-radius: 10px; }

/* ===== SIDEBAR PHẢI ===== */
.sidebar-right {
  flex: 0 0 280px;
  max-width: 280px;
  gap: 0;
}

.right-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  color: #1e40af;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.empty-progress {
  text-align: center;
  color: #94a3b8;
  font-size: 0.82rem;
  padding: 20px 10px;
  font-weight: 600;
  line-height: 1.6;
}

.progress-list {
  flex: 1;
  overflow-y: auto;
  padding-top: 8px;
}
.progress-list::-webkit-scrollbar { width: 4px; }
.progress-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.chapter-block { margin-bottom: 4px; }

.chapter-header {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 10px;
  background: #f1f5f9;
  transition: background 0.2s;
  font-size: 0.78rem;
  font-weight: 700;
}
.chapter-header:hover { background: #dbeafe; }

.chapter-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.challenge-block { margin-left: 12px; margin-top: 3px; }

.challenge-header {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: background 0.2s;
  font-size: 0.75rem;
  font-weight: 600;
}
.challenge-header:hover { background: #f8fafc; }

.challenge-badge {
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  flex-shrink: 0;
}
.challenge-badge.quiz { background: #dbeafe; color: #1d4ed8; }
.challenge-badge.matching { background: #fef3c7; color: #b45309; }
.challenge-badge.short_answer { background: #d1fae5; color: #065f46; }

.challenge-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #475569;
}

.questions-list { margin-left: 10px; margin-top: 2px; }

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: 2px;
  font-size: 0.75rem;
}
.question-item:hover { background: #f8fafc; }
.question-item.correct { background: #f0fdf4; }
.question-item.wrong { background: #fff1f2; }
.question-item.selected { border-color: #3b82f6; background: #eff6ff !important; }

.q-icon { flex-shrink: 0; font-size: 0.75rem; }
.q-text {
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  color: #374151;
  font-weight: 600;
}

/* ===== ASK PANEL ===== */
.ask-panel {
  flex-shrink: 0;
  border-top: 2px solid #e2e8f0;
  padding-top: 10px;
  margin-top: 6px;
}

.ask-preview {
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 2px solid #dbeafe;
}

.ask-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.ask-question-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ask-answers {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.72rem;
  font-weight: 700;
}

.correct-ans { color: #16a34a; }
.user-ans { color: #374151; }
.user-ans.is-wrong { color: #dc2626; }

.ask-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 0 #1e3a8a;
}
.ask-btn:active { transform: translateY(2px); box-shadow: none; }
.ask-btn:hover { background: linear-gradient(135deg, #2563eb, #1e40af); }
</style>
