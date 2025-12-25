import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './assets/main.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// TỰ ĐỘNG GỬI TOKEN TRONG MỌI REQUEST
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const app = createApp(App);
app.use(router);
app.mount('#app');