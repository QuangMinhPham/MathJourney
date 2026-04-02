<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// === STATE ===
// Biến isLoginMode tương ứng với checkbox #chk trong code cũ
// true = Đang ở màn hình Login, false = Đang ở màn hình Signup
const isLoginMode = ref(true); 

// Dữ liệu Form
const loginForm = ref({ email: '', password: '' });
const signupForm = ref({ name: '', email: '', password: '' });

// Trạng thái UI
const loginError = ref('');
const showSuccessPopup = ref(false);
const isLoading = ref(false);

// === LOGIC XỬ LÝ ===

// 1. Đăng ký
const handleSignup = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/api/auth/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupForm.value),
    });

    if (!response.ok) {
      const text = await response.text();
      alert("❌ " + text); // Giữ alert đơn giản hoặc có thể làm UI error đẹp hơn
      return;
    }

    // Thành công -> Hiện popup
    showSuccessPopup.value = true;
  } catch (error) {
    alert("⚠️ Lỗi kết nối đến server: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

// 2. Đóng popup đăng ký thành công -> Chuyển sang Login
const closePopup = () => {
  showSuccessPopup.value = false;
  isLoginMode.value = true; // Chuyển checkbox thành checked (Login mode)
  // Xóa form đăng ký cho sạch
  signupForm.value = { name: '', email: '', password: '' };
};

// 3. Đăng nhập
const handleLogin = async () => {
  isLoading.value = true;
  loginError.value = ''; // Reset lỗi cũ

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }

    if (!response.ok) {
      // Xử lý thông báo lỗi cụ thể
      if (typeof result === 'string' && result.includes("Sai mật khẩu")) {
        loginError.value = "Mật khẩu nhập sai!";
      } else if (typeof result === 'string' && result.includes("không tồn tại")) {
        loginError.value = "Tài khoản không tồn tại!";
      } else {
        loginError.value = result.message || "Đăng nhập thất bại!";
      }
      return;
    }

    // Thành công
    localStorage.setItem('token', result.token);
    
    // Nếu server trả về link chuyển hướng (URL_directLink)
    if (result.URL_directLink) {
      window.location.href = result.URL_directLink;
    } else {
      router.push('/'); // Chuyển về trang chủ bằng Vue Router
    }

  } catch (error) {
    loginError.value = "Không thể kết nối đến server!";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <video class="bg-video" autoplay muted loop playsinline poster="/images/background2.mp4">
      <source src="/images/background2.mp4" type="video/mp4">
    </video>

    <div class="main">  	
      <input type="checkbox" id="chk" aria-hidden="true" v-model="isLoginMode">

      <div class="signup">
        <form @submit.prevent="handleSignup">
          <div class="signup-label">Đăng Ký</div>
          <input type="text" v-model="signupForm.name" placeholder="User name" required>
          <input type="email" v-model="signupForm.email" placeholder="Email" required>
          <input type="password" v-model="signupForm.password" placeholder="Password" required>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Đang xử lý...' : 'Sign up' }}
          </button>
          <label for="chk">Đã có tài khoản? Đăng nhập ngay</label>
        </form>
      </div>

      <div class="login">
        <form @submit.prevent="handleLogin">
          <div class="signin-label">Đăng Nhập</div>
          <input type="email" v-model="loginForm.email" placeholder="Email" required>
          <input type="password" v-model="loginForm.password" placeholder="Password" required>
          
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
          
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Đang xử lý...' : 'Login' }}
          </button>
          <label for="chk">Chưa có tài khoản? Đăng ký ngay</label>
        </form>
      </div>

      <div class="img_login"></div>
    </div>

    <div v-if="showSuccessPopup" class="popup">
      <h3>🎉 Đăng ký thành công!</h3>
      <p>Bạn có thể đăng nhập ngay để tiếp tục.</p>
      <button @click="closePopup">OK</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap');

/* Reset cơ bản cho component */
.login-page {
  margin: 0; padding: 0;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh;
  font-family: 'Jost', sans-serif;
}

/* Video nền */
.bg-video {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: -2;
  pointer-events: none;
}

/* Khung chính */
.main {
  width: 700px; height: 550px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 5px 20px 50px #000;
  position: relative;
  background: white; /* Fallback */
}

#chk { display: none; }

/* --- FORM ĐĂNG KÝ --- */
.signup {
  position: absolute;
  background: rgba(0,0,0,0.5); /* Nền tối cho signup */
  width: 350px; height: 100%;
  transition: .8s ease-in-out;
  z-index: 0;
}

.signup-label {
  color: #fff; font-size: 2.3em;
  justify-content: center; display: flex;
  margin: 50px; font-weight: bold;
}

/* --- FORM ĐĂNG NHẬP --- */
.login {
  position: absolute;
  height: 100%; width: 350px;
  background: rgba(255, 255, 255, 0.9); /* Nền sáng cho login */
  transform: translateX(-350px); /* Mặc định ẩn bên trái */
  transition: .8s ease-in-out;
  z-index: -1;
}

.signin-label {
  color: #000; font-size: 2.3em;
  justify-content: center; display: flex;
  margin: 50px; font-weight: bold;
}

/* --- HIỆU ỨNG TRƯỢT (IMG_LOGIN) --- */
.img_login {
  position: absolute;
  height: 100%; width: 350px;
  background-color: rgba(255, 255, 255, 1);
  transform: translateX(350px);
  transition: .8s ease-in-out;
  z-index: 1;
}

/* --- INPUT & BUTTON --- */
label {
  color: #fff; font-size: 15px;
  justify-content: center; display: flex;
  margin: 50px; cursor: pointer;
  transition: .5s ease-in-out;
}

.login label {
  color: #000; transform: scale(.6);
}

input {
  width: 60%; height: 20px;
  background: #e0dede;
  display: block; margin: 20px auto;
  padding: 12px; border: none; outline: none;
  border-radius: 5px;
}

button {
  width: 60%; height: 40px;
  margin: 30px auto 10px;
  display: block; justify-content: center;
  color: #fff; background: rgba(0,0,0,0.8);
  font-size: 1em; font-weight: bold;
  outline: none; border: none;
  border-radius: 5px; cursor: pointer;
  transition: .2s ease-in;
}

button:hover { background: #fff; color: black; border: 1px solid #333; }
button:disabled { opacity: 0.7; cursor: not-allowed; }

/* --- LOGIC CHUYỂN ĐỔI (Dựa trên checkbox #chk) --- */
/* Khi #chk được check (Login Mode) */
#chk:checked ~ .login {
  transform: translateX(350px); /* Login trượt vào giữa từ trái */
  z-index: 2; /* Lên trên cùng */
}

#chk:checked ~ .signup {
  transform: translateX(700px); /* Signup trượt ra khỏi khung */
}

#chk:checked ~ .img_login {
  transform: translateX(0px); /* Khối che trượt về bên trái */
  background-color: rgba(0,0,0,0.6); /* Đổi màu nền khối che */
}

#chk:checked ~ .login label { transform: scale(1); }

/* --- ERROR & POPUP --- */
.error-message {
  color: red; font-size: 14px;
  margin-top: 5px; text-align: center;
  font-weight: bold;
}

.popup {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
  padding: 30px 40px;
  text-align: center; z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.popup h3 { color: #333; margin-bottom: 10px; }
.popup button {
  margin-top: 15px; width: auto; padding: 8px 25px;
  background: #4CAF50; color: white;
}
.popup button:hover { background: #45a049; color: white; border: none; }

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -60%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
</style>