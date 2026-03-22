<template>
  <div class="space-y-6 font-sans pb-10">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-black text-slate-800 italic uppercase flex items-center gap-3">
          <Users class="w-10 h-10 text-blue-600"/> Quản lý Tài Khoản
        </h2>
        <p class="text-slate-500 font-bold ml-13">Hệ thống quản lý tài khoản học sinh Math Journey</p>
      </div>
      <div class="flex gap-4">
        <div class="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm text-center min-w-[120px]">
          <p class="text-[10px] font-black text-slate-400 uppercase">Tổng cộng</p>
          <p class="text-2xl font-black text-blue-600">{{ students.length }}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm text-center min-w-[120px]">
          <p class="text-[10px] font-black text-slate-400 uppercase">Hoạt động</p>
          <p class="text-2xl font-black text-green-600">{{ students.filter(s => s.status === 'active').length }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input v-model="search" type="search" placeholder="Tìm tên, lớp hoặc email..." autocomplete="off"
               class="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold outline-none transition-all">
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
          <tr>
            <th class="px-8 py-5">#</th>
            <th class="px-6 py-5">Tên</th>
            <th class="px-6 py-5">Lớp học</th>
            <th class="px-6 py-5">Email & SĐT</th>
            <th class="px-6 py-5">Trạng thái</th>
            <th class="px-8 py-5 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(s, i) in filteredStudents" :key="s.user_id" class="hover:bg-blue-50/50 transition-all group">
            <td class="px-8 py-5 font-black text-slate-300 italic">#{{ i + 1 }}</td>
            <td class="px-6 py-5">
              <div class="flex items-center gap-4">
                <img :src="s.avatar ? `/images/avatars/${s.avatar}` : '/images/avatars/ava3.jpg'" 
                     class="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover">
                <div>
                  <p class="font-black text-slate-800">{{ s.full_name || 'Chưa đặt tên' }}</p>
                  <p class="text-[10px] font-bold text-blue-500 uppercase italic">@{{ s.username }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-5 font-black text-slate-600 uppercase">{{ s.class_name || 'N/A' }}</td>
            <td class="px-6 py-5">
              <p class="text-sm font-bold text-slate-700">{{ s.email }}</p>
              <p class="text-[10px] text-slate-400 font-medium">{{ s.phone || 'Chưa cập nhật SĐT' }}</p>
            </td>
            <td class="px-6 py-5">
              <span :class="s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                    class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border-2 border-white shadow-sm">
                {{ s.status === 'active' ? 'Hoạt động' : 'Nghỉ học' }}
              </span>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openEdit(s)" class="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:scale-110 transition-all"><Edit2 class="w-4 h-4"/></button>
                <button @click="handleDelete(s.user_id)" class="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 class="w-4 h-4"/></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-4 border-white">
        <div class="bg-gradient-to-r from-slate-900 to-blue-900 p-10 text-white relative">
          <div class="flex items-center gap-6">
            <div class="relative">
              <img :src="editing.avatar ? `/images/avatars/${editing.avatar}` : '/images/avatars/ava3.jpg'" 
                   class="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-2xl object-cover">
              <div class="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-black shadow-lg">★</div>
            </div>
            <div>
              <h3 class="text-3xl font-black italic uppercase tracking-tight">{{ editing.full_name || 'Hồ sơ mới' }}</h3>
              <p class="text-blue-300 font-black uppercase tracking-widest text-xs">Thủy thủ hạng chuyên nghiệp</p>
            </div>
          </div>
          <button @click="showModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-white transition-all"><X class="w-8 h-8"/></button>
        </div>

        <div class="flex bg-slate-50 border-b-2 border-slate-100">
          <button @click="activeTab = 'info'" :class="activeTab === 'info' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'" class="flex-1 py-5 font-black uppercase text-xs tracking-widest transition-all">👤 Thông tin cơ bản</button>
          <button @click="activeTab = 'account'" :class="activeTab === 'account' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'" class="flex-1 py-5 font-black uppercase text-xs tracking-widest transition-all">🔐 Tài khoản & Bảo mật</button>
        </div>

        <div class="p-10 max-h-[50vh] overflow-y-auto bg-white">
          <div v-if="activeTab === 'info'" class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="label">Họ và Tên Thủy Thủ</label>
              <input v-model="editing.full_name" type="text" class="input" placeholder="Nhập họ tên...">
            </div>
            <div>
              <label class="label">Email Liên Hệ</label>
              <input v-model="editing.email" type="email" class="input">
            </div>
            <div>
              <label class="label">Số Điện Thoại</label>
              <input v-model="editing.phone" type="text" class="input">
            </div>
            <div>
              <label class="label">Lớp Học</label>
              <input v-model="editing.class_name" type="text" class="input">
            </div>
            <div>
              <label class="label">Ngày Sinh</label>
              <input v-model="editing.dob" type="date" class="input">
            </div>
            <div>
              <label class="label">Giới Tính</label>
              <select v-model="editing.gender" class="input">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label class="label">Trạng Thái Thủy Thủ</label>
              <select v-model="editing.status" class="input">
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã nghỉ học</option>
              </select>
            </div>
          </div>

          <div v-if="activeTab === 'account'" class="space-y-6">
            <div style="position: absolute; opacity: 0; height: 0; width: 0; overflow: hidden;" aria-hidden="true">
                <input type="text" name="fake_username" tabindex="-1">
                <input type="password" name="fake_password" tabindex="-1">
            </div>

            <div>
                <label class="label">Tên đăng nhập (Username)</label>
                <input v-model="editing.username" type="text" class="input" autocomplete="none">
            </div>
            <div class="relative">
              <label class="label text-orange-600">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
              <div class="flex gap-2">
                <input v-model="editing.password" :type="showPass ? 'text' : 'password'" class="input flex-1 font-mono tracking-widest text-orange-600 border-orange-100">
                <button @click="showPass = !showPass" class="px-4 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200">{{ showPass ? '🙈' : '👁' }}</button>
              </div>
              <button @click="genPass" class="mt-3 text-[10px] font-black text-blue-500 uppercase hover:underline">🔄 Tạo mật khẩu ngẫu nhiên</button>
            </div>
          </div>
        </div>

        <div class="p-10 bg-slate-50 flex gap-4 border-t-2 border-slate-100">
          <button @click="save" class="flex-2 bg-blue-600 text-white py-5 px-10 rounded-2xl font-black italic uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Lưu Hồ Sơ Thủy Thủ</button>
          <button @click="showModal = false" class="flex-1 bg-white border-2 border-slate-200 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs hover:bg-slate-100 transition-all">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Users, Search, Edit2, Trash2, X, ShieldCheck } from 'lucide-vue-next';

const students = ref([]);
const search = ref('');
const showModal = ref(false);
const editing = ref({});
const activeTab = ref('info');
const showPass = ref(false);

const fetchStudents = async () => {
  const res = await axios.get('/api/admin/students');
  students.value = res.data;
};

const filteredStudents = computed(() => {
  const q = search.value.toLowerCase();
  return students.value.filter(s => 
    s.full_name?.toLowerCase().includes(q) || 
    s.class_name?.toLowerCase().includes(q) ||
    s.username?.toLowerCase().includes(q)
  );
});

const openEdit = (student) => {
  editing.value = { ...student, password: '' }; // Reset password field khi mở modal
  activeTab.value = 'info';
  showModal.value = true;
};

const genPass = () => {
  editing.value.password = 'Sailor@' + Math.floor(1000 + Math.random() * 9000);
  showPass.value = true;
};

const save = async () => {
  try {
    await axios.put('/api/admin/update-student', editing.value);
    alert("✅ Đã cập nhật hồ sơ thành công!");
    showModal.value = false;
    fetchStudents();
  } catch (e) { alert("Lỗi khi lưu dữ liệu"); }
};

const handleDelete = async (id) => {
  if (confirm("⚠️ Chú ý: Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể khôi phục!")) {
    await axios.delete(`/api/admin/delete-student/${id}`);
    fetchStudents();
  }
};

onMounted(fetchStudents);
</script>

<style scoped>
.label { @apply block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1; }
.input { @apply w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner; }
</style>