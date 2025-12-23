const express = require("express");
const router = express.Router();
const { generateChallenge } = require("../controllers/ai_controller");

// Endpoint: POST /api/ai/generate
router.post("/generate", generateChallenge);

module.exports = router;
