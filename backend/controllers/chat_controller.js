const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function chatWithAI(req, res) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Thiếu nội dung" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const prompt = `
    Bạn là một vị Thuyền Trưởng thông thái dẫn dắt học sinh tìm kho báu tri thức Toán lớp 4.
    PHONG CÁCH: Thân thiện, đầy năng lượng, sử dụng nhiều biểu tượng cảm xúc (emoji) liên quan đến biển cả, kho báu (💎, ⚓, ⛵, 💰).
    
    QUY TẮC TRÌNH BÀY:
    1. Trình bày rõ ràng, xuống dòng hợp lý. Không viết thành một khối văn bản dài.
    2. Sử dụng dấu gạch đầu dòng cho các bước giải.
    3. In đậm các con số hoặc kết quả quan trọng.
    4. Chỉ trả lời các vấn đề học tập. Nếu không liên quan, hãy nói: "⚓ Hãy hỏi ta về Toán học để tìm kho báu tri thức nhé!"

    Câu hỏi của học sinh: ${message}
    `;

    const result = await model.generateContent(prompt, { signal: controller.signal });    
    clearTimeout(timeoutId);

    let reply = result.response.text();
    res.json({ reply });
    
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.error("❌ API Gemini bị treo và đã bị ngắt.");
      return res.status(504).json({ 
        reply: "⚓ Ối! Biển động quá, tàu của ta không phản hồi kịp. Hãy thử hỏi lại câu này nhé thám hiểm nhí!" 
      });
    }

    console.error("❌ Lỗi hệ thống:", err);
    res.status(500).json({ reply: "❌ Có lỗi xảy ra trên tàu, hãy thử lại sau!" });
  }
}

module.exports = { chatWithAI };
