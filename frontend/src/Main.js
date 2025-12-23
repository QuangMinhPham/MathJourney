import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import router từ file cấu hình

// Import CSS dùng chung
import './assets/main.css'; 

// Import FontAwesome (Nếu bạn cài qua npm)
// Nếu bạn dùng CDN ở index.html thì không cần dòng này, 
// nhưng tốt nhất nên cài: npm install @fortawesome/fontawesome-free
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = createApp(App);

// Sử dụng Router
app.use(router);

// Mount vào thẻ div#app trong index.html
app.mount('#app');