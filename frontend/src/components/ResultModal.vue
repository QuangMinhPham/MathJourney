<script setup>
defineProps({
  show:          { type: Boolean, required: true },
  correctCount:  { type: Number, required: true },
  totalCount:    { type: Number, required: true },
  rewardAmount:  { type: Number, required: true },
  rewardEmoji:   { type: String, required: true },
  rewardName:    { type: String, required: true },
  unitLabel:     { type: String, default: 'câu' },   // 'câu' | 'cặp'
  isPerfect:     { type: Boolean, default: false },
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="overlay">
        <div class="card">

          <!-- Header -->
          <div class="header" :class="isPerfect ? 'header-gold' : 'header-blue'">
            <span class="trophy-icon">{{ isPerfect ? '🏆' : '⭐' }}</span>
            <h2 class="title">{{ isPerfect ? 'Xuất sắc!' : 'Hoàn thành!' }}</h2>
          </div>

          <!-- Body -->
          <div class="body">
            <!-- Score row -->
            <div class="score-row">
              <span class="score-label">Đúng</span>
              <span class="score-fraction">
                <span class="score-correct">{{ correctCount }}</span>
                <span class="score-sep">/</span>
                <span class="score-total">{{ totalCount }}</span>
              </span>
              <span class="score-label">{{ unitLabel }}</span>
            </div>

            <!-- Reward -->
            <div class="reward-box" :class="isPerfect ? 'reward-gold' : 'reward-blue'">
              <span class="reward-emoji">{{ rewardEmoji }}</span>
              <div class="reward-text">
                <span class="reward-amount">{{ rewardAmount }}</span>
                <span class="reward-name">{{ rewardName }}</span>
              </div>
            </div>

            <!-- Buttons slot -->
            <div class="actions">
              <slot />
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.card {
  background: #fff;
  border-radius: 28px;
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
}

/* Header */
.header {
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.header-gold { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.header-blue { background: linear-gradient(135deg, #3b82f6, #06b6d4); }

.trophy-icon { font-size: 56px; line-height: 1; }
.title {
  font-size: 1.7rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2);
  margin: 0;
}

/* Body */
.body { padding: 24px; }

.score-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}
.score-label  { font-size: 1rem;  font-weight: 700; color: #6b7280; }
.score-fraction { display: flex; align-items: baseline; gap: 2px; }
.score-correct { font-size: 2.4rem; font-weight: 900; color: #10b981; line-height: 1; }
.score-sep     { font-size: 1.6rem; font-weight: 700; color: #9ca3af; }
.score-total   { font-size: 2.4rem; font-weight: 900; color: #374151; line-height: 1; }

/* Reward */
.reward-box {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.reward-gold { background: #fffbeb; border: 2px solid #fde68a; }
.reward-blue { background: #eff6ff; border: 2px solid #bfdbfe; }

.reward-emoji  { font-size: 2.2rem; flex-shrink: 0; }
.reward-text   { display: flex; flex-direction: column; }
.reward-amount { font-size: 1.8rem; font-weight: 900; color: #1e293b; line-height: 1.1; }
.reward-name   { font-size: 0.85rem; font-weight: 700; color: #6b7280; margin-top: 2px; }

/* Actions */
.actions {
  display: flex;
  gap: 10px;
}
.actions :deep(button) {
  flex: 1;
  padding: 13px 10px;
  border: none;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
}
.actions :deep(button):active { transform: translateY(2px); }
.actions :deep(.btn-primary)   { background: #3b82f6; color: #fff; box-shadow: 0 4px 0 #1d4ed8; }
.actions :deep(.btn-secondary) { background: #f1f5f9; color: #374151; box-shadow: 0 4px 0 #cbd5e1; }
.actions :deep(.btn-home)      { background: #fbbf24; color: #fff; box-shadow: 0 4px 0 #d97706; }

/* Transition */
.modal-enter-active { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { animation: popIn 0.2s reverse ease-in; }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
