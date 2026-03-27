<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-500 p-6 font-sans relative overflow-hidden">
    <div v-if="data" class="max-w-6xl mx-auto relative z-10">
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
          <User class="w-10 h-10" /> Hồ Sơ Thủy Thủ
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT COLUMN -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Avatar & Rank -->
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300 text-center">
            <div class="relative inline-block group cursor-pointer" @click="$refs.fileInput.click()">
              <img :src="data.userInfo.avatar ? `/images/avatars/${data.userInfo.avatar}` : '/images/avatars/ava3.jpg'"
                   class="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover mx-auto">
              <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera class="text-white w-8 h-8" />
              </div>
              <input type="file" ref="fileInput" class="hidden" @change="handleAvatarUpload" accept="image/*">
            </div>
            <div class="mt-4">
              <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg inline-block text-xl">
                {{ data.userInfo.title }}
              </div>
              <p class="text-blue-700 font-extrabold mt-3 text-2xl drop-shadow-sm italic">Hạng #{{ data.userInfo.rank }}</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="bg-white/90 backdrop-blur rounded-3xl p-6 border-4 border-cyan-300 shadow-xl">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp class="text-blue-600" /> Thống Kê
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between p-3 bg-pink-50 rounded-xl"><span>Ngọc Trai</span><span class="font-bold text-pink-600">{{ data.achievements.pearls }}</span></div>
              <div class="flex justify-between p-3 bg-pink-50 rounded-xl"><span>Vỏ sò</span><span class="font-bold text-pink-600">{{ data.achievements.shells }}</span></div>
              <div class="flex justify-between p-3 bg-pink-50 rounded-xl"><span>Kho Báu</span><span class="font-bold text-pink-600">{{ data.achievements.treasures }}</span></div>
              <div class="flex justify-between p-3 bg-blue-50 rounded-xl"><span>Tổng Điểm</span><span class="font-bold text-blue-600">{{ data.achievements.totalScore }}</span></div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Badges -->
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Medal class="text-yellow-600" /> Huy Hiệu Thành Tích
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="badge in data.badges" :key="badge.id"
                @click="openBadgeDetail(badge)"
                :class="['relative p-4 rounded-2xl border-4 text-center cursor-pointer transition-all hover:scale-105 shadow-md',
                        badge.unlocked ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}` : 'bg-gray-200 grayscale']">
                <div class="text-5xl mb-2">{{ badge.icon }}</div>
                <p class="text-sm font-bold" :class="badge.unlocked ? 'text-white shadow-sm' : 'text-gray-500'">{{ badge.name }}</p>
                <div v-if="!badge.unlocked" class="absolute top-2 right-2"><Lock class="w-4 h-4 text-gray-400" /></div>
              </div>
            </div>
          </div>

          <!-- ── SETTINGS PANEL ── -->
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold flex items-center gap-2">
                <Settings class="text-gray-600" /> Cài Đặt
              </h3>
              <!-- Edit toggle button -->
              <button
                v-if="!isEditing"
                @click="startEdit"
                class="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md transition-all"
              >
                <Pencil class="w-4 h-4" /> Chỉnh sửa
              </button>
              <span v-else class="text-sm font-bold text-orange-500 bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-full">
                ✏️ Đang chỉnh sửa...
              </span>
            </div>

            <!-- VIEW MODE -->
            <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="field in viewFields" :key="field.key"
                   class="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{{ field.label }}</span>
                <span class="font-semibold text-gray-800 text-base">{{ field.value || '—' }}</span>
              </div>
            </div>

            <!-- EDIT MODAL OVERLAY -->
            <div v-if="isEditing" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Họ và Tên -->
                <div class="md:col-span-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Họ và Tên</label>
                  <input v-model="editForm.name"
                    class="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none text-gray-800 font-medium transition-colors"
                    placeholder="Nhập họ và tên..." />
                </div>

                <!-- Tên đăng nhập -->
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tên đăng nhập</label>
                  <input v-model="editForm.username"
                    class="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none text-gray-800 font-medium transition-colors"
                    placeholder="Nhập tên đăng nhập..." />
                </div>

                <!-- Email -->
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                  <input v-model="editForm.email" type="email"
                    class="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none text-gray-800 font-medium transition-colors"
                    placeholder="email@school.vn" />
                </div>

                <!-- Số điện thoại -->
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Số điện thoại</label>
                  <input v-model="editForm.phone" type="tel"
                    class="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none text-gray-800 font-medium transition-colors"
                    placeholder="0901234567" />
                </div>

                <!-- Lớp học -->
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Lớp học</label>
                  <input v-model="editForm.class"
                    class="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none text-gray-800 font-medium transition-colors"
                    placeholder="VD: 10A1" />
                </div>

                <!-- Ngày sinh -->
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ngày sinh</label>
                  <input v-model="editForm.dob" type="date"
                    class="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 outline-none text-gray-800 font-medium transition-colors" />
                </div>

                <!-- Giới tính -->
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Giới tính</label>
                  <div class="flex gap-3 mt-1">
                    <button v-for="g in ['Nam','Nữ','Khác']" :key="g"
                      @click="editForm.gender = g"
                      :class="['flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all',
                               editForm.gender === g
                                 ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                 : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300']">
                      {{ g }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t-2 border-dashed border-gray-200 pt-4">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock class="w-3.5 h-3.5" /> Bảo mật
                </p>
                <button @click="showPassModal = true"
                  class="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
                  <KeyRound class="w-5 h-5" /> Đổi Mật Khẩu
                </button>
              </div>

              <!-- Action buttons -->
              <div class="flex gap-3 pt-2">
                <button @click="cancelEdit"
                  class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all border-2 border-gray-200">
                  Huỷ bỏ
                </button>
                <button @click="saveAllInfo"
                  :disabled="isSaving"
                  class="flex-2 flex-grow-[2] py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  <Save class="w-5 h-5" />
                  {{ isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi' }}
                </button>
              </div>

              <!-- Success toast inline -->
              <div v-if="saveSuccess"
                class="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-2xl text-green-700 font-bold">
                <CheckCircle class="w-5 h-5 text-green-500" /> Cập nhật thông tin thành công!
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-cyan-300">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar class="text-purple-600" /> Hoạt Động Gần Đây
            </h3>
            <div class="space-y-3">
              <div v-if="data.recentActivities.length === 0"
                class="flex items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-semibold">
                Chưa có hoạt động nào gần đây
              </div>
              <div v-for="act in data.recentActivities" :key="act.date"
                class="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div>
                  <p class="font-bold text-gray-800">{{ act.title }}</p>
                  <p class="text-sm text-gray-600">{{ act.date }}</p>
                </div>
                <span class="px-3 py-1 bg-green-500 text-white rounded-full font-bold text-sm">+{{ act.points }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── BADGE DETAIL MODAL ── -->
    <div v-if="selectedBadge" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="selectedBadge = null">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-8 border-cyan-200 text-center relative">
        <button @click="selectedBadge = null" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        <div class="text-7xl mb-4">{{ selectedBadge.icon }}</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedBadge.name }}</h2>
        <div class="my-6">
          <div class="flex justify-between text-sm font-bold mb-2 text-blue-800">
            <span>Tiến trình hiện tại:</span>
            <span>{{ selectedBadge.current }} / {{ selectedBadge.target }} {{ selectedBadge.unit }}</span>
          </div>
          <div class="w-full bg-gray-200 h-6 rounded-full overflow-hidden border-2 border-gray-300 shadow-inner">
            <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
                 :style="{ width: Math.min((selectedBadge.current / selectedBadge.target) * 100, 100) + '%' }"></div>
          </div>
        </div>
        <div v-if="selectedBadge.unlocked" class="bg-green-100 text-green-700 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-green-200">
          <CheckCircle class="w-6 h-6" /> Đã hoàn thành thành tựu này
        </div>
        <p v-else class="text-gray-500 font-bold italic bg-gray-50 p-3 rounded-xl border">Cố gắng thêm một chút nữa để mở khóa nhé!</p>
      </div>
    </div>

    <!-- ── CHANGE PASSWORD MODAL ── -->
    <div v-if="showPassModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-orange-300">
        <h2 class="text-2xl font-bold mb-5 flex items-center gap-2">
          <Lock class="text-orange-500" /> Đổi Mật Khẩu
        </h2>
        <div class="space-y-3 mb-6">
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Mật khẩu cũ</label>
            <input v-model="pass.old" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-gray-50 focus:border-orange-400 transition-colors" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Mật khẩu mới</label>
            <input v-model="pass.new" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-gray-50 focus:border-orange-400 transition-colors" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Xác nhận mật khẩu mới</label>
            <input v-model="pass.confirm" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none bg-gray-50 focus:border-orange-400 transition-colors" />
          </div>
          <p v-if="passError" class="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg border border-red-200">{{ passError }}</p>
        </div>
        <div class="flex gap-3">
          <button @click="handleChangePass" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all shadow-md">Lưu</button>
          <button @click="showPassModal = false; passError = ''" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import {
  User, Save, TrendingUp, Medal, Camera, Lock, X,
  CheckCircle, Settings, Calendar, Pencil, KeyRound
} from 'lucide-vue-next';

// ── State ────────────────────────────────────────────────────────────
const data         = ref(null);
const selectedBadge = ref(null);
const showPassModal = ref(false);
const isEditing    = ref(false);
const isSaving     = ref(false);
const saveSuccess  = ref(false);
const passError    = ref('');

const pass = ref({ old: '', new: '', confirm: '' });

const editForm = ref({
  name:     '',
  username: '',
  email:    '',
  phone:    '',
  class:    '',
  dob:      '',
  gender:   '',
});

// ── Computed: view-mode fields list ─────────────────────────────────
const viewFields = computed(() => {
  if (!data.value) return [];
  const u = data.value.userInfo;
  return [
    { key: 'name',     label: 'Họ và Tên',       value: u.name     },
    { key: 'username', label: 'Tên đăng nhập',   value: u.username },
    { key: 'email',    label: 'Email',            value: u.email    },
    { key: 'phone',    label: 'Số điện thoại',   value: u.phone    },
    { key: 'class',    label: 'Lớp học',          value: u.class    },
    { key: 'dob',      label: 'Ngày sinh',        value: u.dob      },
    { key: 'gender',   label: 'Giới tính',        value: u.gender   },
  ];
});

// ── Edit helpers ─────────────────────────────────────────────────────
function startEdit() {
  const u = data.value.userInfo;
  editForm.value = {
    name:     u.name     || '',
    username: u.username || '',
    email:    u.email    || '',
    phone:    u.phone    || '',
    class:    u.class    || '',
    dob:      u.dob      || '',
    gender:   u.gender   || '',
  };
  saveSuccess.value = false;
  isEditing.value   = true;
}

function cancelEdit() {
  isEditing.value   = false;
  saveSuccess.value = false;
}

async function saveAllInfo() {
  isSaving.value = true;
  try {
    await axios.put('/api/profile/update', {
      full_name:  editForm.value.name,
      username:   editForm.value.username,
      email:      editForm.value.email,
      phone:      editForm.value.phone,
      class_name: editForm.value.class,
      dob:        editForm.value.dob,
      gender:     editForm.value.gender,
    });
    // Sync back into local data
    Object.assign(data.value.userInfo, editForm.value);
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
      isEditing.value   = false;
    }, 1800);
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi khi cập nhật thông tin');
  } finally {
    isSaving.value = false;
  }
}

// ── Avatar ───────────────────────────────────────────────────────────
const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('avatar', file);
  try {
    const res = await axios.post('/api/profile/avatar', fd);
    data.value.userInfo.avatar = res.data.filename;
  } catch (e) {
    alert('Lỗi khi tải ảnh lên');
  }
};

// ── Password ─────────────────────────────────────────────────────────
const handleChangePass = async () => {
  passError.value = '';
  if (!pass.value.old || !pass.value.new || !pass.value.confirm) {
    passError.value = 'Vui lòng điền đầy đủ các trường.';
    return;
  }
  if (pass.value.new !== pass.value.confirm) {
    passError.value = 'Mật khẩu mới và xác nhận không khớp!';
    return;
  }
  try {
    await axios.post('/api/profile/change-password', {
      oldPassword: pass.value.old,
      newPassword: pass.value.new,
    });
    showPassModal.value = false;
    pass.value = { old: '', new: '', confirm: '' };
    alert('Đã đổi mật khẩu thành công!');
  } catch (e) {
    passError.value = e.response?.data?.message || 'Lỗi khi đổi mật khẩu';
  }
};

// ── Badges ───────────────────────────────────────────────────────────
const getRarityColor = (rarity) => {
  if (rarity === 'legendary') return 'from-yellow-400 to-orange-500 border-yellow-300';
  if (rarity === 'epic')      return 'from-purple-400 to-pink-500 border-purple-300';
  return 'from-blue-400 to-cyan-500 border-blue-300';
};

const openBadgeDetail = (badge) => { selectedBadge.value = badge; };

// ── Mount ────────────────────────────────────────────────────────────
onMounted(async () => {
  const res = await axios.get('/api/profile');
  data.value = res.data;
});
</script>