import { reactive } from 'vue';

let loadingTimer = null;

export const globalState = reactive({
  isLoading: false,
  
  // Chỉ hiện loading nếu quá trình kéo dài hơn 'delay' ms
  showLoading(delay = 300) {
    // Xóa timer cũ nếu có để tránh chồng chéo
    if (loadingTimer) clearTimeout(loadingTimer);
    
    loadingTimer = setTimeout(() => {
      this.isLoading = true;
    }, delay);
  },
  
  hideLoading() {
    // Xóa timer và tắt loading
    if (loadingTimer) clearTimeout(loadingTimer);
    this.isLoading = false;
  }
});