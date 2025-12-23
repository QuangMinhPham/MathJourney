<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import confetti from 'canvas-confetti';

const router = useRouter();
const players = ref([]);
const loading = ref(true);

// Tách Top 3
const top3 = computed(() => players.value.slice(0, 3));
// Các hạng còn lại
const others = computed(() => players.value.slice(3));

const fetchLeaderboard = async () => {
  try {
    const res = await fetch('/api/scores/leaderboard');
    const data = await res.json();
    
    if (data.success) {
      players.value = data.data; // Dữ liệu đã được format từ backend
      if (players.value.length > 0) launchConfetti();
    }
  } catch (error) {
    console.error("Lỗi tải BXH:", error);
  } finally {
    loading.value = false;
  }
};

const launchConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#FFFFFF'] });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#FFFFFF'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  }());
};

const goBack = () => router.push('/lessons');

onMounted(fetchLeaderboard);
</script>

<template>
  <div class="leaderboard-container">
    <div class="bg-pattern"></div>

    <div class="header">
      <button class="back-btn" @click="goBack"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
      <h1 class="title">🏆 Bảng Phong Thần 🏆</h1>
    </div>

    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <div v-else class="content-wrapper animate-pop">
      
      <div class="podium-container" v-if="top3.length > 0">
        <div class="podium-item rank-2" v-if="top3[1]">
          <div class="avatar-wrapper">
            <img :src="top3[1].avatar" alt="Rank 2">
            <div class="badge silver">2</div>
          </div>
          <div class="podium-base silver-base">
            <div class="name">{{ top3[1].name }}</div>
            <div class="score">{{ top3[1].score }} pts</div>
          </div>
        </div>

        <div class="podium-item rank-1" v-if="top3[0]">
          <div class="crown">👑</div>
          <div class="avatar-wrapper">
            <img :src="top3[0].avatar" alt="Rank 1">
            <div class="badge gold">1</div>
          </div>
          <div class="podium-base gold-base">
            <div class="name">{{ top3[0].name }}</div>
            <div class="score">{{ top3[0].score }} pts</div>
          </div>
        </div>

        <div class="podium-item rank-3" v-if="top3[2]">
          <div class="avatar-wrapper">
            <img :src="top3[2].avatar" alt="Rank 3">
            <div class="badge bronze">3</div>
          </div>
          <div class="podium-base bronze-base">
            <div class="name">{{ top3[2].name }}</div>
            <div class="score">{{ top3[2].score }} pts</div>
          </div>
        </div>
      </div>

      <div class="list-container" v-if="others.length > 0">
        <div v-for="player in others" :key="player.rank" class="list-item">
          <div class="rank">#{{ player.rank }}</div>
          <img :src="player.avatar" class="mini-avatar">
          <div class="info">
            <div class="name">{{ player.name }}</div>
          </div>
          <div class="score-pill">{{ player.score }} pts</div>
        </div>
      </div>

      <div v-if="players.length === 0" class="empty-state">
        Chưa có ai ghi danh! Hãy là người đầu tiên!
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');

.leaderboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #79f5fe, #579cfd);
  font-family: 'Fredoka', sans-serif;
  color: white; padding: 20px;
  position: relative; overflow-x: hidden;
}

.bg-pattern {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 30px 30px; pointer-events: none;
}

.header { display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 40px; }
.back-btn {
  position: absolute; left: 0;
  background: rgba(255,255,255,0.2); border: 2px solid rgba(0, 0, 0, 0.7);
  color: rgb(0, 0, 0); padding: 8px 15px; border-radius: 20px;
  cursor: pointer; font-weight:bold ; transition: 0.1s;
  font-size: 18px;
  font-family: sans-serif;
}
.back-btn:hover { background: rgb(30, 30, 30); color: #ffffff; }
.title { font-size: 2.5rem; margin: 0; text-shadow: 0 4px 0 rgba(0,0,0,0.2); text-transform: uppercase; }

/* Podium Styles */
.podium-container { display: flex; justify-content: center; align-items: flex-end; gap: 15px; margin-bottom: 40px; }
.podium-item { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 10; }
.avatar-wrapper { position: relative; margin-bottom: -15px; z-index: 20; transition: transform 0.3s; }
.podium-item:hover .avatar-wrapper { transform: translateY(-10px) scale(1.05); }
.avatar-wrapper img { width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.2); background: #fff; }
.rank-1 img { width: 110px; height: 110px; border-color: #ffd700; }
.crown { font-size: 40px; position: absolute; top: -45px; animation: float 2s infinite ease-in-out; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.badge {
  position: absolute; bottom: 0; right: 0; width: 30px; height: 30px;
  border-radius: 50%; display: flex; justify-content: center; align-items: center;
  font-weight: bold; border: 2px solid white; color: white;
}
.gold { background: #ffd700; }
.silver { background: #c0c0c0; }
.bronze { background: #cd7f32; }

.podium-base {
  width: 100px; text-align: center; color: white;
  border-radius: 15px 15px 0 0; padding: 25px 5px 10px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; justify-content: flex-end;
}
.gold-base { height: 160px; background: linear-gradient(to bottom, #ffd700, #ffb900); width: 120px; }
.silver-base { height: 120px; background: linear-gradient(to bottom, #e0e0e0, #bdbdbd); }
.bronze-base { height: 90px; background: linear-gradient(to bottom, #e6a570, #cd7f32); }
.name { font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.score { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 2px 8px; font-size: 0.8rem; }

/* List Styles */
.list-container {
  background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 20px;
  max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.list-item { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; color: #333; transition: 0.2s; }
.list-item:hover { background: #f0f4ff; transform: scale(1.02); border-radius: 10px; }
.rank { font-weight: 900; color: #8898aa; width: 40px; font-size: 1.2rem; }
.mini-avatar { width: 45px; height: 45px; border-radius: 50%; margin-right: 15px; background: #eee; }
.list-item .info { flex: 1; text-align: left; }
.list-item .name { font-size: 1.1rem; color: #2d3748; font-weight: bold; }
.score-pill { background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }

.loading-box, .empty-state { text-align: center; padding: 50px; font-size: 1.2rem; }
.spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-pop { animation: popUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Responsive */
@media (max-width: 600px) {
  .podium-container { gap: 5px; }
  .podium-base { width: 80px; }
  .gold-base { width: 90px; }
  .rank-1 img { width: 80px; height: 80px; }
  .avatar-wrapper img { width: 60px; height: 60px; }
  .title { font-size: 1.8rem; }
}
</style>