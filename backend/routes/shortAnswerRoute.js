const express = require("express");
const router = express.Router();

// 👇 SỬA DÒNG NÀY: Chỉ dùng ../controllers/...
const shortAnswerController = require("../controllers/shortAnswerController");

/**
 * GET /api/challenges/short-answer/:chapter_id
 * (Vì bên app.js đã định nghĩa tiền tố /api/challenges/short-answer rồi)
 */
// 👇 SỬA DÒNG NÀY: Rút gọn đường dẫn
router.get("/:chapter_id", shortAnswerController.getShortAnswerChallenge);

module.exports = router;