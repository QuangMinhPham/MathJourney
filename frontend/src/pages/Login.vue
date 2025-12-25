<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// === STATE ===
// true = Đang ở màn hình Login (Checked), false = Đang ở màn hình Signup
const isLoginMode = ref(false); 
const isLoading = ref(false);
const showSuccessPopup = ref(false);
const loginError = ref('');

// Dữ liệu Form
const signupForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const loginForm = reactive({
  email: '',
  password: ''
});

// === LOGIC UI ===
const passwordMatch = computed(() => {
  if (signupForm.confirmPassword === '') return { text: '', class: '' };
  return signupForm.password === signupForm.confirmPassword 
    ? { text: '✓ Mật khẩu khớp', class: 'password-match success' }
    : { text: '✗ Mật khẩu không khớp', class: 'password-match error' };
});

// === XỬ LÝ ĐĂNG KÝ ===
const handleSignup = async () => {
  if (isLoading.value) return;
  if (signupForm.password !== signupForm.confirmPassword) {
    alert('❌ Mật khẩu xác nhận không khớp!');
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetch('/api/auth/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password
      })
    });

    if (!response.ok) {
      const text = await response.text();
      alert("❌ " + text);
      return;
    }
    showSuccessPopup.value = true;
  } catch (error) {
    alert("⚠️ Lỗi kết nối: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

const closePopup = () => {
  showSuccessPopup.value = false;
  isLoginMode.value = true; // Chuyển sang Login mode
  Object.assign(signupForm, { name: '', email: '', password: '', confirmPassword: '' });
};

// === XỬ LÝ ĐĂNG NHẬP ===
const handleLogin = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  loginError.value = '';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { result = text; }

    if (!response.ok) {
      if (typeof result === 'string' && result.includes("Sai mật khẩu")) loginError.value = "Mật khẩu không đúng!";
      else if (typeof result === 'string' && result.includes("không tồn tại")) loginError.value = "Tài khoản không tồn tại!";
      else loginError.value = result.message || "Đăng nhập thất bại!";
      return;
    }

    localStorage.setItem('token', result.token);
    if (result.URL_directLink) window.location.href = result.URL_directLink;
    else router.push('/');
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
      <input type="checkbox" id="chk" v-model="isLoginMode" aria-hidden="true">

      <div class="signup">
        <div class="form-side-content">
          <form @submit.prevent="handleSignup" class="form-container">
            <h2 class="form-title">Tạo Tài Khoản</h2>
            <p class="form-subtitle">Đăng ký để bắt đầu hành trình học tập</p>

            <div class="input-group">
              <label>Họ và tên</label>
              <input type="text" v-model="signupForm.name" placeholder="Nhập tên của bạn" required>
            </div>
            <div class="input-group">
              <label>Email</label>
              <input type="email" v-model="signupForm.email" placeholder="example@email.com" required>
            </div>
            <div class="input-group">
              <label>Mật khẩu</label>
              <input type="password" v-model="signupForm.password" placeholder="Tối thiểu 6 ký tự" required minlength="6">
            </div>
            <div class="input-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" v-model="signupForm.confirmPassword" placeholder="Nhập lại mật khẩu" required>
              <div :class="passwordMatch.class">{{ passwordMatch.text }}</div>
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? 'Đang xử lý...' : 'Đăng Ký' }}
            </button>
            <label for="chk" class="switch-link">Đã có tài khoản? <span>Đăng nhập ngay</span></label>
          </form>
        </div>
      </div>

      <div class="login">
        <div class="form-side-content">
          <form @submit.prevent="handleLogin" class="form-container">
            <h2 class="form-title">Chào Mừng Trở Lại</h2>
            <p class="form-subtitle">Đăng nhập để tiếp tục học tập</p>

            <div v-if="loginError" class="error-message">{{ loginError }}</div>

            <div class="input-group">
              <label>Email</label>
              <input type="email" v-model="loginForm.email" placeholder="example@email.com" required>
            </div>
            <div class="input-group">
              <label>Mật khẩu</label>
              <input type="password" v-model="loginForm.password" placeholder="Nhập mật khẩu" required>
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? 'Đang xử lý...' : 'Đăng Nhập' }}
            </button>
            <label for="chk" class="switch-link">Chưa có tài khoản? <span>Đăng ký ngay</span></label>
          </form>
        </div>
      </div>

      <div class="decorative-side">
        <div class="logo">🌊</div>
        <h2>MathJourney</h2>
        <p>Khám phá đại dương tri thức cùng chúng tôi. Hành trình chinh phục toán học bắt đầu từ đây!</p>
        
        <div class="features">
          <div class="feature-item"><span class="icon">🏆</span><span class="text">Xếp hạng và thi đấu</span></div>
          <div class="feature-item"><span class="icon">📚</span><span class="text">Bài học phong phú</span></div>
          <div class="feature-item"><span class="icon">💎</span><span class="text">Kiếm phần thưởng</span></div>
        </div>
      </div>
    </div>

    <div v-if="showSuccessPopup" class="popup">
      <h3>🎉 Đăng ký thành công!</h3>
      <p>Bạn có thể đăng nhập ngay để tiếp tục.</p>
      <button @click="closePopup">Đồng ý</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

input::placeholder {
  color: rgba(0, 0, 0, 0.826); /* trắng mờ */
}

.login-page {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; font-family: 'Inter', sans-serif;
}

.bg-video {
  position: fixed; inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: -2; pointer-events: none;
}

.main {
  width: 900px; height: 600px;
  overflow: hidden; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative; backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
  /* opacity: 0.8; */
}

#chk { display: none; }

/* --- FORM SIDES --- */
.signup, .login {
  position: absolute; width: 50%; height: 100%;
  transition: .8s ease-in-out;
}

.signup {   
  left: 50%; 
  z-index: -1;
  opacity: 0;
}

.login {
  left: 50%; 
  z-index: 2;
  opacity: 1;
}

.form-side-content {
  padding: 50px 40px; height: 100%; overflow-y: auto;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
}

/* --- DECORATIVE SIDE (KHỐI CHE TRƯỢT) --- */
.decorative-side {
  position: absolute;
  width: 50%; height: 100%;
  left: 0; /* Mặc định nằm bên phải */
  background: rgba(0, 0, 0, 0.9);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px; text-align: center;
  transition: .8s ease-in-out;
  z-index: 2; /* Luôn nằm trên cùng để che */
}


/* --- LOGIC TRƯỢT (Dựa trên checkbox) --- */
#chk:checked ~ .login {
  opacity: 0;
  transform: translateX(-100%); /* Login trượt sang phải */
  z-index: -1;
}

#chk:checked ~ .signup {
  opacity: 1;
  transform: translateX(-100%); /* Signup trượt ra ngoài khung bên phải */
  z-index: 2;
}

#chk:checked ~ .decorative-side {
  transform: translateX(100%); /* Khối che trượt sang trái */
}

/* --- TRANG TRÍ & FORM STYLING (GIỮ NGUYÊN BẢN ĐẸP) --- */
.decorative-side .logo { font-size: 60px; margin-bottom: 20px; animation: float 3s infinite; }
.decorative-side h2 { color: white; font-size: 32px; font-weight: 700; margin-bottom: 15px; }
.decorative-side p { color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; max-width: 320px; }

.features { margin-top: 30px; display: flex; flex-direction: column; gap: 12px; }
.feature-item {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255, 255, 255, 0); padding: 10px 20px;
  border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.2);
}
.feature-item .text { color: white; font-size: 14px; }

.form-title { font-size: 28px; font-weight: 700; color: rgb(0, 0, 0); margin-bottom: 5px; }
.form-subtitle { font-size: 14px; color: rgb(0, 0, 0); margin-bottom: 25px; }

.input-group { margin-bottom: 15px; text-align: left; }
.input-group label { display: block; font-size: 13px; color: rgba(0, 0, 0, 0.87); margin-bottom: 5px; font-weight: 600; }
.input-group input {
  width: 100%; height: 42px; padding: 0 15px;
  background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px; color: rgb(0, 0, 0); outline: none; transition: 0.3s;
}
.input-group input:focus { border-color: white; background: rgba(255, 255, 255, 0.3); }

.submit-btn {
  width: 100%; height: 45px; margin-top: 15px;
  border-radius: 8px; border: none; background: white;
  color: #000000; font-weight: 700; cursor: pointer; transition: 0.3s;
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

.switch-link { display: block; margin-top: 20px; color: rgb(0, 0, 0); font-size: 13px; cursor: pointer; }
.switch-link span { text-decoration: underline; font-weight: 700; }

.error-message {
  background: rgba(255, 70, 70, 0.8); color: white;
  padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 15px;
  border-left: 4px solid #ff0000; animation: shake 0.3s;
}

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

/* Popup & Loading styles... (giữ nguyên như bản trước) */
.popup {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: white; padding: 30px; border-radius: 15px; text-align: center; z-index: 100;
}
.popup button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
.password-match { font-size: 12px; margin-top: 4px; }
.password-match.success { color: #4ade80; }
.password-match.error { color: #ff6b6b; }
.loading-spinner {
  display: inline-block; width: 14px; height: 14px; border: 2px solid #667eea;
  border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 5px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>