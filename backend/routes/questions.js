const express = require("express");
const db = require("../config/db");
const router = express.Router();

/**
 * API: Lấy toàn bộ câu hỏi cho Challenge 1 (Quiz) dựa trên ID chương
 * GET /api/:chapter_id/challenge-1
 */
router.get("/:chapter_id/challenge-1", async (req, res) => {
  try {
    const { chapter_id } = req.params;

    // BƯỚC 1: Tìm challenge_id thuộc chương này và có loại là 'quiz' (Challenge 1)
    const [challenges] = await db.query(
      "SELECT challenge_id FROM challenges WHERE chapter_id = ? AND type = 'quiz' LIMIT 1",
      [chapter_id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thử thách Quiz cho chương này" });
    }

    const challenge_id = challenges[0].challenge_id;

    // BƯỚC 2: Lấy danh sách câu hỏi dựa trên challenge_id vừa tìm được
    const [questions] = await db.query(
      "SELECT question_id, question_text FROM questions WHERE challenge_id = ? ORDER BY order_index ASC",
      [challenge_id]
    );

    // BƯỚC 3: Lấy các options (đáp án) tương ứng cho từng câu hỏi
    for (const q of questions) {
      const [opts] = await db.query(
        "SELECT option_id, option_text, is_correct FROM options WHERE question_id = ?",
        [q.question_id]
      );
      q.options = opts;
    }

    // Trả về dữ liệu đã cấu trúc lại
    res.json({
      chapter_id: parseInt(chapter_id),
      challenge_id: challenge_id,
      total_questions: questions.length,
      questions: questions,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu câu hỏi:", err);
    res.status(500).json({ error: "Lỗi server khi lấy câu hỏi" });
  }
});

module.exports = router;