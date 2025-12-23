// controllers/shortAnswerController.js
const db = require("../config/db"); 

const getShortAnswerChallenge = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    // 1. Tìm challenge_id của loại short_answer trong chapter này
    const [challenges] = await db.query(
      "SELECT challenge_id, title, description FROM challenges WHERE chapter_id = ? AND type = 'short_answer' LIMIT 1",
      [chapter_id]
    );

    if (challenges.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thử thách trả lời ngắn trong chương này." });
    }

    const challenge = challenges[0];

    // 2. Lấy câu hỏi và đáp án đúng
    const [questions] = await db.query(
      `SELECT q.question_id, q.question_text, q.image_url, sa.correct_answer 
       FROM questions q
       JOIN short_answers sa ON q.question_id = sa.question_id
       WHERE q.challenge_id = ?
       ORDER BY q.order_index ASC`,
      [challenge.challenge_id]
    );

    res.json({
      challenge_id: challenge.challenge_id,
      title: challenge.title,
      description: challenge.description,
      questions: questions.map(q => ({
        ...q,
        // Frontend cần biết độ dài để render dấu gạch dưới
        // Ta gửi luôn đáp án để check client-side cho nhanh (game học tập), 
        // hoặc nếu muốn bảo mật thì chỉ gửi length và hash.
        correct_answer: q.correct_answer.trim()
      }))
    });

  } catch (err) {
    console.error("❌ Lỗi getShortAnswerChallenge:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getShortAnswerChallenge };