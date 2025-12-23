<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// === STATE ===
const isLoggedIn = ref(false);
const username = ref("Người chơi");
const avatar = ref("/images/default_avatar.jpg");
const showMenu = ref(false); // Trạng thái ẩn/hiện menu logout
const videoRef = ref(null);

// === LOGIC KHỞI TẠO ===
onMounted(() => {
  checkLoginStatus();
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

// Kiểm tra token trong localStorage
const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Decode JWT đơn giản (lấy phần payload ở giữa)
      const payload = JSON.parse(atob(token.split('.')[1]));
      username.value = payload.username || "Người chơi";
      
      // Lấy avatar từ localStorage hoặc dùng mặc định
      const savedAvatar = localStorage.getItem('avatar');
      // Kiểm tra nếu avatar là đường dẫn tương đối thì thêm dấu / để Vue hiểu
      if (savedAvatar) {
        avatar.value = savedAvatar.startsWith('http') || savedAvatar.startsWith('/') 
          ? savedAvatar 
          : `/${savedAvatar}`;
      }
      
      isLoggedIn.value = true;
    } catch (err) {
      console.warn("Token lỗi:", err);
      logout();
    }
  }
};

// Logic ẩn/hiện video khi tab bị ẩn để tiết kiệm tài nguyên
const handleVisibilityChange = () => {
  if (document.hidden) {
    videoRef.value?.pause();
  } else {
    videoRef.value?.play().catch(() => {});
  }
};

// === ACTIONS ===
const toggleMenu = (event) => {
  // Ngăn sự kiện click lan ra ngoài để không kích hoạt handleClickOutside ngay lập tức
  event.stopPropagation();
  showMenu.value = !showMenu.value;
};

const handleClickOutside = () => {
  // Bấm ra ngoài thì đóng menu
  if (showMenu.value) {
    showMenu.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("avatar");
  isLoggedIn.value = false;
  showMenu.value = false;
  router.push('/login');
};

// Điều hướng
const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="home-page">
    <video ref="videoRef" class="bg-video" autoplay muted loop playsinline poster="/images/homepage_background.png">
      <source src="/images/background.mp4" type="video/mp4">
    </video>

    <div class="toolbar">
      <div class="titlegame">
        <img src="/images/icon.png" alt="Icon" style="height:50px;">
        <div class="titlegame_name">ĐẢO GIẤU VÀNG</div>
      </div>

      <div class="auth-section">
        
        <div v-if="isLoggedIn" class="user-info" @click="toggleMenu">
          <span class="user-name">👋Hi, {{ username }} </span>
          <img :src="avatar" alt="Avatar" @error="$event.target.src='/images/default_avatar.jpg'">
          
          <div v-if="showMenu" class="logout-menu">
            <button @click.stop="navigateTo('/profile')">👤 Thông tin cá nhân</button>
            <button @click.stop="navigateTo('/leaderboard')">🏆 Thành tích</button>
            <button id="logout-btn" @click.stop="logout">🚪 Đăng xuất</button>
          </div>
        </div>

        <div v-else class="sign_btn">
          <button class="signin-btn" @click="navigateTo('/login')">Sign In</button>
          <button class="signup-btn" @click="navigateTo('/login')">Sign Up</button>
        </div>

      </div>
    </div>

    <div class="options-btn">
      <div @click="navigateTo('/lessons')" class="option-btn">
        🏝️ Truy Tìm Kho Báu
      </div>
      <div @click="navigateTo('/leaderboard')" class="option-btn">
        🏆 Bảng Xếp Hạng
      </div>
      <div @click="navigateTo('/chat')" class="option-btn">
        📜 Hướng Dẫn 
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

/* Reset cơ bản cho component này */
* { box-sizing: border-box; }

.home-page {
  height: 100vh;
  width: 100vw;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
  position: relative;
}

/* --- VIDEO NỀN --- */
.bg-video {
  position: fixed;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: -2;
  pointer-events: none;
}

/* Lớp phủ tối để text dễ đọc */
.home-page::before {
  content: "";
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: -1;
  pointer-events: none;
}

/* --- TOOLBAR --- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 1000px;
  max-width: 95%;
  height: 65px;
  margin: 20px auto 0;
  border-radius: 50px;
  border: 1px solid black;
  box-shadow: 5px 6px 5px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, rgba(49, 173, 209, 0.75), rgba(243, 211, 67, 0.75));
  padding: 0 40px;
  position: relative;
  z-index: 10;
}

.titlegame {
  display: flex;
  align-items: center;
  gap: 10px;
}

.titlegame_name {
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #000;
}

/* --- NÚT ĐĂNG NHẬP / ĐĂNG KÝ --- */
.sign_btn {
  display: flex;
  gap: 10px;
}

.signin-btn, .signup-btn {
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  color: black;
  background-color: rgba(24, 218, 252, 0.55);
  border-radius: 20px;
  border: 1px solid black;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.signin-btn:hover, .signup-btn:hover {
  transform: scale(1.05);
  color: #ffd700;
}

/* --- MENU CHÍNH --- */
.options-btn {
  height: calc(100% - 150px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 25px;
  z-index: 5;
  position: relative;
}

.option-btn {
  background-color: rgba(0, 0, 0, 0.65);
  padding: 18px 25px;
  border-radius: 25px;
  font-size: 25px;
  font-weight: bold;
  width: 350px;
  text-align: center;
  color: white;
  border: 1px solid black;
  box-shadow: 0 5px 5px rgba(0,0,0,0.45);
  transition: all 0.3s;
  cursor: pointer;
  user-select: none;
}

.option-btn:hover {
  color: rgb(255, 234, 0);
  transform: scale(1.05);
  background-color: rgba(0, 0, 0, 0.8);
}

/* --- USER INFO AREA --- */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
  background: rgba(255, 255, 255, 0.3);
  padding: 5px 15px;
  border-radius: 30px;
  transition: 0.2s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.5);
}

.user-info img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
  background-color: #fff;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

/* --- LOGOUT DROPDOWN --- */
.logout-menu {
  position: absolute;
  top: 60px;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  min-width: 220px;
  animation: fadeIn 0.3s ease;
  z-index: 100;
  border: 1px solid #ddd;
}

.logout-menu button {
  background: none;
  border: none;
  text-align: left;
  padding: 12px 15px;
  font-size: 16px;
  font-weight: 600;
  color: #222;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  display: block;
  width: 100%;
}

.logout-menu button:hover {
  background-color: #f0f0f0;
  color: #007bff;
}

#logout-btn {
  margin-top: 5px;
  background-color: #ffeff0;
  color: #d32f2f;
}

#logout-btn:hover {
  background-color: #ffdbdc;
  color: #b71c1c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Mobile */
@media (max-width: 600px) {
  .toolbar {
    padding: 0 15px;
    height: auto;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 10px;
    border-radius: 20px;
  }
  
  .titlegame {
    margin-top: 10px;
  }

  .options-btn {
    height: auto;
    margin-top: 50px;
  }

  .option-btn {
    width: 90%;
    font-size: 20px;
  }
}
</style>