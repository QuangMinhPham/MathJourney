const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateChallenge(req, res) {
  const { challenge_type, topic, material_text } = req.body;

  try {
    let prompt = "";

    if (challenge_type === "quiz") {
      prompt = `
        Dựa trên nội dung sau về "${topic}":
        ${material_text}

        Hãy tạo 5 câu hỏi trắc nghiệm dưới dạng JSON:
        [
          { "question": "Câu hỏi", "options": ["A", "B", "C", "D"], "correct": "1" }
        ]
          (từ 1 đến 4 tương ứng với A B C D)
      `;
    } else if (challenge_type === "matching") {
      prompt = `
        Dựa trên nội dung sau về "${topic}":
        ${material_text}

        Hãy tạo 5 cặp nối (matching) dưới dạng JSON:
        [
          { "left": "Khái niệm", "right": "Định nghĩa", "correct_match": "A-1" }
        ]
      `;
    } else if (challenge_type === "short_answer") {
      prompt = `
        Dựa trên nội dung sau về "${topic}":
        ${material_text}

        Hãy tạo 5 câu hỏi trả lời ngắn dưới dạng JSON:
        [
          { "question": "Câu hỏi ngắn", "answer": "Câu trả lời đúng" }
        ]
      `;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Đã sửa tên model
        generationConfig: {
        responseMimeType: "application/json", // Yêu cầu trả về JSON
        },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Lấy phần JSON ra khỏi đoạn text trả về
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.json({ success: true, challenge_type, data: parsed });
  } catch (err) {
    console.error("❌ Lỗi generateChallenge (Gemini):", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { generateChallenge };
