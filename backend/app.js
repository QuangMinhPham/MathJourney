require('dotenv').config();
const path = require('path');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// === 1. IMPORT ROUTES (Theo đúng tên file trong ảnh của bạn) ===
const authRoutes = require('./routes/authRoute');
const lessonRoutes = require("./routes/lessons");

// Các loại thử thách
const quiz = require ("./routes/questions")
const challengeRoutes = require("./routes/challengeRoutes"); 
const matchingRoutes = require('./routes/matching');
const shortAnswerRoutes = require("./routes/shortAnswerRoute"); 

// Các tính năng khác
const scoreRoutes = require("./routes/scores");
const aiRoutes = require("./routes/ai_routes");     
const chatRoutes = require("./routes/chat_routes"); 

// const uploadRouter = require("./routes/upload"); // Tạm tắt nếu chưa dùng
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const progressRoutes = require('./routes/progressRoutes');
const db = require('./config/db');

// === 2. CONFIG APP ===
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Cấu hình static files (để hiển thị ảnh upload)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "public")));

// === 3. ĐỊNH NGHĨA ROUTES ===

// Auth & Profile
app.use('/api/auth', authRoutes);
app.use("/api/profile", profileRoutes);

// Bài học & Điểm số
app.use('/api/lessons', lessonRoutes);
app.use("/api/scores", scoreRoutes);

// AI & Chat
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);

// === 4. ROUTES THỬ THÁCH (Quan trọng: Sắp xếp từ cụ thể đến chung) ===
app.use("/api",quiz)

// Route cho game Nối (Challenge 2) -> /api/challenges/matching/:id
app.use('/api/challenges/matching', matchingRoutes);

// Route cho game Điền từ (Challenge 3) -> /api/challenges/short-answer/:id
app.use("/api/challenges/short-answer", shortAnswerRoutes);

// Route cho game Quiz (Challenge 1) -> /api/challenges/:id
// (Đặt cuối cùng để không bị "ăn" mất các route con ở trên)
app.use("/api/challenges", challengeRoutes);
// Route Bảng xếp hạng
app.use("/api/leaderboard", leaderboardRoutes);

// Route Upload (Nếu dùng)
// app.use("/api/upload", uploadRouter);
// Route Admin
app.use("/api/admin", adminRoutes);

// Route Progress (lịch sử câu hỏi)
app.use("/api/progress", progressRoutes);

// === 5. MIGRATION ===
db.execute(`
  CREATE TABLE IF NOT EXISTS user_question_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    question_id INT NOT NULL,
    question_text TEXT,
    correct_answer TEXT,
    user_answer TEXT,
    is_correct TINYINT(1) DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_question (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )
`)
  .then(() => console.log('✅ Migration: bảng user_question_answers sẵn sàng'))
  .catch(err => console.error('Migration error:', err.message));

// === 6. START SERVER ===

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 http://localhost:${PORT}`);
});