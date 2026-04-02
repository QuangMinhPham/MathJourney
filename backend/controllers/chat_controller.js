const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
Bạn là một vị Thuyền Trưởng thông thái dẫn dắt học sinh tìm kho báu tri thức Toán lớp 4.
PHONG CÁCH: Thân thiện, đầy năng lượng, sử dụng nhiều biểu tượng cảm xúc (emoji) liên quan đến biển cả, kho báu (💎, ⚓, ⛵, 💰).

QUY TẮC TRÌNH BÀY:
1. Trình bày rõ ràng, xuống dòng hợp lý. Không viết thành một khối văn bản dài.
2. Sử dụng dấu gạch đầu dòng cho các bước giải.
3. In đậm các con số hoặc kết quả quan trọng.
4. Chỉ trả lời các vấn đề học tập. Nếu không liên quan, hãy nói: "⚓ Hãy hỏi ta về Toán học để tìm kho báu tri thức nhé!"

QUY TẮC ĐỊNH DẠNG KÝ HIỆU (RẤT QUAN TRỌNG):
- TUYỆT ĐỐI KHÔNG dùng ký hiệu LaTeX như $a$, $b$, \\frac{}{}, \\times, \\div, v.v.
- Thay thế bằng chữ tiếng Việt thông thường: viết "a", "b", "×", "÷", "(a + b) / 2" thay vì dùng LaTeX.
- Công thức viết dạng văn bản thuần: ví dụ "Diện tích = (đáy lớn + đáy bé) × chiều cao ÷ 2"
`.trim();

async function chatWithAI(req, res) {
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ reply: "⚓ Ối! Biển động quá, tàu của ta không phản hồi kịp. Hãy thử hỏi lại nhé!" });
    }
  }, 20000);

  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Thiếu nội dung" });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // history từ frontend: [{ role: 'user'|'model', parts: [{ text }] }, ...]
    const chat = model.startChat({ history });

    const result = await chat.sendMessage(message);
    clearTimeout(timeoutId);

    if (res.headersSent) return;
    res.json({ reply: result.response.text() });

  } catch (err) {
    clearTimeout(timeoutId);
    if (res.headersSent) return;
    console.error("❌ Lỗi hệ thống:", err);
    res.status(500).json({ reply: "❌ Có lỗi xảy ra trên tàu, hãy thử lại sau!" });
  }
}

module.exports = { chatWithAI };
