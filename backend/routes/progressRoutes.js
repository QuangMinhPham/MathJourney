const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// POST /api/progress/save-answers
// Body: { challenge_id, answers: [{question_id, question_text, correct_answer, user_answer, is_correct}] }
router.post('/save-answers', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { challenge_id, answers } = req.body;
    if (!challenge_id || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Thiếu dữ liệu' });
    }

    for (const a of answers) {
      await db.execute(
        `INSERT INTO user_question_answers
          (user_id, challenge_id, question_id, question_text, correct_answer, user_answer, is_correct, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
          correct_answer = VALUES(correct_answer),
          user_answer = VALUES(user_answer),
          is_correct = VALUES(is_correct),
          answered_at = NOW()`,
        [user_id, challenge_id, a.question_id, a.question_text || '', a.correct_answer || '', a.user_answer || '', a.is_correct ? 1 : 0]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi save-answers:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/progress/my-progress
// Trả về: danh sách chapter -> challenge -> câu hỏi đã làm (với kết quả đúng/sai)
router.get('/my-progress', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Lấy tất cả câu hỏi đã trả lời của user, kèm chapter/challenge info
    const [rows] = await db.execute(
      `SELECT
        ch.chapter_id, ch.title AS chapter_title,
        c.challenge_id, c.title AS challenge_title, c.type AS challenge_type,
        uqa.question_id, uqa.question_text, uqa.correct_answer,
        uqa.user_answer, uqa.is_correct, uqa.answered_at
       FROM user_question_answers uqa
       JOIN challenges c ON uqa.challenge_id = c.challenge_id
       JOIN chapters ch ON c.chapter_id = ch.chapter_id
       WHERE uqa.user_id = ?
       ORDER BY ch.chapter_id ASC, c.challenge_id ASC, uqa.question_id ASC`,
      [user_id]
    );

    // Nhóm theo chapter -> challenge -> questions
    const chaptersMap = new Map();
    for (const row of rows) {
      if (!chaptersMap.has(row.chapter_id)) {
        chaptersMap.set(row.chapter_id, {
          chapter_id: row.chapter_id,
          chapter_title: row.chapter_title,
          challenges: new Map()
        });
      }
      const chapter = chaptersMap.get(row.chapter_id);
      if (!chapter.challenges.has(row.challenge_id)) {
        chapter.challenges.set(row.challenge_id, {
          challenge_id: row.challenge_id,
          challenge_title: row.challenge_title,
          challenge_type: row.challenge_type,
          questions: []
        });
      }
      chapter.challenges.get(row.challenge_id).questions.push({
        question_id: row.question_id,
        question_text: row.question_text,
        correct_answer: row.correct_answer,
        user_answer: row.user_answer,
        is_correct: !!row.is_correct
      });
    }

    // Chuyển Map thành array
    const result = [...chaptersMap.values()].map(ch => ({
      ...ch,
      challenges: [...ch.challenges.values()]
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Lỗi my-progress:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
