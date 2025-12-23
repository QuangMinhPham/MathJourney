const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Đảm bảo đường dẫn đúng tới file db.js
const { verifyToken } = require("../middlewares/auth"); // Sửa đường dẫn middleware

// === 1. LƯU ĐIỂM & CẬP NHẬT BXH ===
router.post("/save", verifyToken, async (req, res) => {
  try {
    const { chapter_id, challenge_id, score } = req.body;
    const user_id = req.user.user_id;

    // A. Lưu hoặc Cập nhật điểm trong user_progress
    const [existing] = await db.query(
      "SELECT score FROM user_progress WHERE user_id=? AND challenge_id=?",
      [user_id, challenge_id]
    );

    if (existing.length > 0) {
      if (score > existing[0].score) {
        await db.query(
          "UPDATE user_progress SET score=?, completed=1, attempt_date=NOW() WHERE user_id=? AND challenge_id=?",
          [score, user_id, challenge_id]
        );
      }
    } else {
      await db.query(
        "INSERT INTO user_progress (user_id, chapter_id, challenge_id, score, completed) VALUES (?, ?, ?, ?, 1)",
        [user_id, chapter_id, challenge_id, score]
      );
    }

    // B. Tính lại TỔNG ĐIỂM của user này
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
    res.status(500).json({ success: false, error: "Lỗi server" });
  }
});

// === 2. LẤY BẢNG XẾP HẠNG (Cho Frontend) ===
router.get("/leaderboard", async (req, res) => {
  try {
    // Lấy Top 50 người cao điểm nhất
    // JOIN bảng users để lấy tên hiển thị
    const [rows] = await db.query(`
      SELECT 
        l.leaderboard_id,
        u.username,
        u.full_name,
        l.total_score,
        l.last_updated
      FROM leaderboard l
      JOIN users u ON l.user_id = u.user_id
      ORDER BY l.total_score DESC, l.last_updated ASC
      LIMIT 50
    `);

    // Format dữ liệu đẹp cho Frontend
    const leaderboard = rows.map((row, index) => ({
      rank: index + 1, // Tự tính rank dựa trên thứ tự sort
      name: row.full_name || row.username, // Ưu tiên tên đầy đủ
      score: row.total_score,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username}&backgroundColor=b6e3f4`
    }));

    res.json({ 
      success: true, 
      data: leaderboard 
    });

  } catch (err) {
    console.error("❌ Lỗi lấy BXH:", err);
    res.status(500).json({ success: false, error: "Lỗi server" });
  }
});

module.exports = router;