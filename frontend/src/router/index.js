import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Lessons from '../pages/Lessons.vue';
import Challenges from '../pages/Challenges.vue';
import Challenge1 from '../pages/Challenge1.vue';
import Challenge2 from '../pages/Challenge2.vue';
import Challenge3 from '../pages/Challenge3.vue';
// import ChallengeAI from '../pages/ChallengeAI.vue';
// import Chat from '../pages/Chat.vue';
import Leaderboard from '../pages/LeaderBoard.vue';
import ChatBot from '../pages/ChatBot.vue';
import Login from '../pages/Login.vue';
import Profile from '../pages/Profile.vue';

import DashboardLayout from '../layoutPage/DashboardLayout.vue';
import DashboardOverview from '../pages/admin/DashboardOverview.vue';
import EditQuestions from '../pages/admin/EditQuestions.vue';
import StudentsManagement from '../pages/admin/StudentsManagement.vue';
import GradesManagement from '../pages/admin/GradesManagement.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/lessons', component: Lessons },
  { path: '/leaderboard', component: Leaderboard },
  
  // Cấu hình đường dẫn cho danh sách thử thách của từng chương
  { path: '/lessons/:chapterId/challenges', component: Challenges },

  // Cấu hình đường dẫn động cho từng trò chơi cụ thể
  // :chapterId và :challengeId là các tham số động
  { path: '/lessons/:chapterId/challenge-1', component: Challenge1 },
  { path: '/lessons/:chapterId/challenge-2', component: Challenge2 },
  { path: '/lessons/:chapterId/challenge-3', component: Challenge3 },

  {path: '/profile', component: Profile},
  {path: '/chatbot', component: ChatBot },
  {path: '/admin', component: DashboardLayout,
    children: [{ path: '', component: DashboardOverview, meta: { title: 'Tổng quan hệ thống' } },
               { path: 'edit-questions', component: EditQuestions, meta: { title: 'Chỉnh sửa đề thi' } },
               { path: 'students', component: StudentsManagement, meta: { title: 'Quản lý học sinh' } },
               { path: 'grades', component: GradesManagement, meta: { title: 'Báo cáo điểm số' } }
    ]
  }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});