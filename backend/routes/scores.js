const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Import kết nối DB
const { verifyToken } = require("../middlewares/auth"); // Import middleware vừa tạo

// === 1. LƯU ĐIỂM & CẬP NHẬT BXH ===
router.post("/save", verifyToken, async (req, res) => {
  try {
    const { chapter_id, challenge_id, score } = req.body;
    const user_id = req.user.user_id; // Lấy từ token sau khi qua middleware

    // A. Kiểm tra và cập nhật điểm trong bảng user_progress
    const [existing] = await db.query(
      "SELECT score FROM user_progress WHERE user_id=? AND challenge_id=?",
      [user_id, challenge_id]
    );

    if (existing.length > 0) {
      // Nếu đã chơi rồi, chỉ cập nhật nếu điểm mới cao hơn
      if (score > existing[0].score) {
        await db.query(
          "UPDATE user_progress SET score=?, completed=1, attempt_date=NOW() WHERE user_id=? AND challenge_id=?",
          [score, user_id, challenge_id]
        );
      }
    } else {
      // Nếu chưa chơi, thêm mới
      await db.query(
        "INSERT INTO user_progress (user_id, chapter_id, challenge_id, score, completed) VALUES (?, ?, ?, ?, 1)",
        [user_id, chapter_id, challenge_id, score]
      );
    }

    // B. Tính lại TỔNG ĐIỂM của user này (Cộng điểm cao nhất của từng challenge)
    const [totalRes] = await db.query(`
      SELECT SUM(max_score) AS total_score
      FROM (
        SELECT MAX(score) AS max_score
        FROM user_progress
        WHERE user_id=?
        GROUP BY challenge_id
      ) AS user_scores
    `, [user_id]);

    const newTotalScore = totalRes[0]?.total_score || 0;

    // C. Cập nhật bảng Leaderboard
    const [leaderEntry] = await db.query(
      "SELECT leaderboard_id FROM leaderboard WHERE user_id=?",
      [user_id]
    );

    if (leaderEntry.length > 0) {
      await db.query(
        "UPDATE leaderboard SET total_score=?, last_updated=NOW() WHERE user_id=?",
        [newTotalScore, user_id]
      );
    } else {
      await db.query(
        "INSERT INTO leaderboard (user_id, total_score) VALUES (?, ?)",
        [user_id, newTotalScore]
      );
    }

    res.json({ 
      success: true, 
      message: "✅ Đã lưu điểm thành công!", 
      total_score: newTotalScore 
    });

  } catch (err) {
    console.error("❌ Lỗi lưu điểm:", err);
    res.status(500).json({ success: false, error: "Lỗi server khi lưu điểm" });
  }
});

// === 2. LẤY BẢNG XẾP HẠNG ===
router.get("/leaderboard", async (req, res) => {
  try {
    // Lấy Top 50 người cao điểm nhất
    const [rows] = await db.query(`
      SELECT 
        u.username,
        u.full_name,
        l.total_score
      FROM leaderboard l
      JOIN users u ON l.user_id = u.user_id
      ORDER BY l.total_score DESC, l.last_updated ASC
      LIMIT 50
    `);

    // Format dữ liệu đẹp cho Frontend
    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      name: row.full_name || row.username,
      score: row.total_score,
      // Tạo avatar ngẫu nhiên dựa trên tên user
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username}&backgroundColor=b6e3f4`
    }));

    res.json({ 
      success: true, 
      data: leaderboard 
    });

  } catch (err) {
    console.error("❌ Lỗi lấy BXH:", err);
    res.status(500).json({ success: false, error: "Lỗi server khi lấy BXH" });
  }
});

module.exports = router;