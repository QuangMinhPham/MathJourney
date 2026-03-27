<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Đảm bảo đã install axios

const router = useRouter();

// === STATE ===
const isLoggedIn = ref(false);
const username = ref("Người chơi");
const avatar = ref("/images/avatars/ava3.jpg"); // Avatar mặc định
const showMenu = ref(false);
const videoRef = ref(null);
const userRole = ref("");

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

// Hàm giải mã JWT hỗ trợ Tiếng Việt (UTF-8)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Giải mã hỗ trợ ký tự đặc biệt tiếng Việt
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const checkLoginStatus = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    // 1. Giải mã hiển thị tên tạm thời từ Token (đã fix lỗi font)
    const payload = decodeJWT(token);
    if (payload) {
      username.value = payload.username || "Người chơi";
      userRole.value = payload.role || "";
      isLoggedIn.value = true;
    }

    try {
      // 2. Gọi API để lấy thông tin Avatar và Tên chính xác từ Database
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/profile'); //
      const user = response.data.userInfo;

      // Cập nhật tên và avatar mới nhất từ DB
      username.value = user.name || user.username;
      userRole.value = user.role || "";
      
      if (user.avatar) {
        // Thêm timestamp ?t= để tránh trình duyệt lưu file cũ (cache)
        avatar.value = `/images/avatars/${user.avatar}?t=${Date.now()}`;
      } else {
        avatar.value = "/images/avatars/ava3.jpg";
      }
    } catch (err) {
      console.warn("Không thể đồng bộ dữ liệu từ Server:", err);
      // Nếu token hết hạn thì logout
      if (err.response && err.response.status === 401) logout();
    }
  }
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    videoRef.value?.pause();
  } else {
    videoRef.value?.play().catch(() => {});
  }
};

const toggleMenu = (event) => {
  event.stopPropagation();
  showMenu.value = !showMenu.value;
};

const handleClickOutside = () => {
  if (showMenu.value) showMenu.value = false;
};

const logout = () => {
  localStorage.removeItem("token");
  isLoggedIn.value = false;
  showMenu.value = false;
  router.push('/login');
};

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
      <div class="titlegame" @click="navigateTo('/')" style="cursor:pointer">
        <img src="/images/icon.png" alt="Icon" style="height:50px;">
        <div class="titlegame_name">ĐẢO GIẤU VÀNG</div>
      </div>

      <div class="auth-section">
        <div v-if="isLoggedIn" class="user-info" @click="toggleMenu">
          <span class="user-name">👋 Hi, {{ username }} </span>
          <img :src="avatar" alt="Avatar" @error="$event.target.src='/images/avatars/ava3.jpg'">
          
          <div v-if="showMenu" class="logout-menu">
            <button @click.stop="navigateTo('/profile')">Thông tin cá nhân</button>
            <button v-if="userRole === 'admin' || userRole === 'teacher'" @click.stop="navigateTo('/admin')" style="color: #3563E9; font-weight: 800;">
              Trang quản lý
            </button>
            <button id="logout-btn" @click.stop="logout">Đăng xuất</button>
          </div>
        </div>

        <div v-else class="sign_btn">
          <button class="signin-btn" @click="navigateTo('/login')">Sign In</button>
          <button class="signup-btn" @click="navigateTo('/login')">Sign Up</button>
        </div>
      </div>
    </div>

    <div class="options-btn">
      <div @click="navigateTo('/lessons')" class="option-btn">Truy tìm kho báu</div>
      <div @click="navigateTo('/leaderboard')" class="option-btn">Bảng xếp hạng</div>
      <div @click="navigateTo('/chatbot')" class="option-btn">Hướng dẫn</div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Reset cơ bản cho component này */
* { box-sizing: border-box; }

.home-page {
  height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
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