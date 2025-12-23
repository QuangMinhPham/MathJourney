// upload_controller.js
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const db = require("../config/db"); 

// ==== Multer: lưu file .docx tạm vào /uploads ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Bảo đảm thư mục lưu ảnh matching tồn tại
const MATCHING_DIR = path.join("uploads", "matching");
fs.mkdirSync(MATCHING_DIR, { recursive: true });

// --------------------------------------------------
// Chuyển .docx -> HTML và đồng thời LƯU ẢNH vào uploads/matching
// Ảnh trong docx sẽ được ghi file, và <img src="..."> sẽ trỏ tới đường dẫn vừa lưu
// --------------------------------------------------
async function docxToHtmlAndRawText(docxPath) {
  const options = {
    convertImage: mammoth.images.imgElement(async (image) => {
      // Lấy phần mở rộng ảnh từ contentType (image/png, image/jpeg, ...)
      const contentType = image.contentType || "image/png";
      const ext = contentType.split("/")[1] || "png";
      const bufferBase64 = await image.read("base64");
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const outPath = path.join(MATCHING_DIR, fileName);
      fs.writeFileSync(outPath, Buffer.from(bufferBase64, "base64"));

      // Trả về src tương đối (lưu DB cũng nên dùng dạng này)
      const webPath = outPath.replace(/\\/g, "/"); // windows safe
      return { src: `/${webPath}` };
    }),
  };

  // 1) HTML (có ảnh)
  const { value: html } = await mammoth.convertToHtml({ path: docxPath }, options);

  // 2) Raw text (để tách Bài/Dạng như bản cũ)
  const { value: raw } = await mammoth.extractRawText({ path: docxPath });

  // Làm sạch text
  const cleanText = raw.replace(/\r/g, "").replace(/\t/g, "").trim();
  return { html, cleanText };
}

// --------------------------------------------------
// Xây "dòng HTML song song" với "dòng TEXT"
// - Để khi parse Dạng 2 ta có thể nhìn HTML của đúng dòng đó,
//   phát hiện được <img> và lấy src tương ứng.
// --------------------------------------------------
function buildParallelLines(html, cleanText) {
  const $ = cheerio.load(html);

  // Tách tất cả block theo thứ tự: p, li, table rows -> quy về "dòng"
  const htmlLines = [];

  // Đoạn văn & danh sách
  $("p, li").each((_, el) => {
    const lineHtml = $(el).html() || "";
    const lineText = $(el).text().replace(/\s+/g, " ").trim();
    if (lineText) htmlLines.push({ text: lineText, html: lineHtml });
  });

  // Bảng: mỗi hàng -> một dòng, các ô nối bằng " | "
  $("table").each((_, tbl) => {
    $(tbl)
      .find("tr")
      .each((_, tr) => {
        const cells = [];
        const cellsHtml = [];
        $(tr)
          .find("th, td")
          .each((_, td) => {
            const t = $(td).text().replace(/\s+/g, " ").trim();
            const h = $(td).html() || "";
            cells.push(t);
            cellsHtml.push(h);
          });
        const lineText = cells.join(" | ").trim();
        const lineHtml = cellsHtml.join(" | ");
        if (lineText) htmlLines.push({ text: lineText, html: lineHtml });
      });
  });

  // Cũng cần full text lines (cho bộ tách Bài/Dạng)
  const textLines = cleanText.split("\n").map(s => s.trim()).filter(Boolean);

  return { textLines, htmlLines };
}

// --------------------------------------------------
// Tìm chỉ mục [start, end) của một đoạn "partText" trong mảng textLines
// Cách làm: khớp theo chuỗi các dòng đầu-cuối
// --------------------------------------------------
function locatePartInLines(textLines, partText) {
  const partLines = partText.split("\n").map(s => s.trim()).filter(Boolean);
  if (partLines.length === 0) return { start: 0, end: 0 };

  // Tìm vị trí dòng đầu tiên xuất hiện
  const first = partLines[0];
  let startIdx = -1;
  for (let i = 0; i < textLines.length; i++) {
    if (textLines[i] === first) {
      // Thử kiểm tra match tiếp theo vài dòng (nếu có)
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return { start: 0, end: 0 };

  // Ước lượng endIdx = startIdx + partLines.length
  const endIdx = Math.min(textLines.length, startIdx + partLines.length);
  return { start: startIdx, end: endIdx };
}

// --------------------------------------------------
// Controller chính
// --------------------------------------------------
const uploadDocx = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Không có file nào được tải lên" });

    const { html, cleanText } = await docxToHtmlAndRawText(req.file.path);

    // Chuẩn bị "song song" lines để map text <-> html
    const { textLines, htmlLines } = buildParallelLines(html, cleanText);

    // Tách file thành từng "Bài x: ..."
    const chapterBlocks = cleanText.split(/(?=Bài\s*\d+)/i).filter(b => b.trim().length > 0);

    for (const chapter of chapterBlocks) {
      // Lấy title chương
      const chapterTitleMatch = chapter.match(/Bài\s*\d+[:：]?\s*(.+)?/i);
      const chapterTitle = chapterTitleMatch ? chapterTitleMatch[0].trim() : "Bài không rõ tên";

      const [chapterRes] = await db.query(
        "INSERT INTO chapters (title, description, order_index) VALUES (?, ?, ?)",
        [chapterTitle, null, 1]
      );
      const chapterId = chapterRes.insertId;

      // Cắt các Dạng trong mỗi Bài
      const parts = chapter.split(/(?=Dạng\s*\d+)/i);

      for (const part of parts) {
        // Tìm khoảng dòng của "part" này trong textLines, lấy slice htmlLines tương ứng
        const range = locatePartInLines(textLines, part);
        const htmlSlice = htmlLines.slice(range.start, range.end);

        if (part.startsWith("Dạng 1")) {
          const [challengeRes] = await db.query(
            "INSERT INTO challenges (chapter_id, title, type, description, order_index) VALUES (?, ?, 'quiz', ?, 1)",
            [chapterId, "Dạng 1", "Trắc nghiệm chọn đáp án"]
          );
          await parseQuiz(part, challengeRes.insertId);
        } else if (part.startsWith("Dạng 2")) {
          const [challengeRes] = await db.query(
            "INSERT INTO challenges (chapter_id, title, type, description, order_index) VALUES (?, ?, 'matching', ?, 2)",
            [chapterId, "Dạng 2", "Nối cặp tương ứng"]
          );
          await parseMatching(part, challengeRes.insertId, htmlSlice);
        } else if (part.startsWith("Dạng 3")) {
          const [challengeRes] = await db.query(
            "INSERT INTO challenges (chapter_id, title, type, description, order_index) VALUES (?, ?, 'short_answer', ?, 3)",
            [chapterId, "Dạng 3", "Trả lời ngắn"]
          );
          await parseShort(part, challengeRes.insertId);
        }
      }
    }

    res.json({ message: "✅ Import xong tài liệu, đã lưu cả ảnh matching (nếu có)!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =====================
// CÁC HÀM PHỤ
// =====================

async function parseQuiz(text, challengeId) {
  const questions = text.split(/Câu\s*\d+[:：]/i).slice(1);

  for (const q of questions) {
    const [questionPart] = q.trim().split(/\n/);
    const questionText = (questionPart || "").trim();

    const optionMatches = q.match(/[ABCD]\.\s*.+/g) || [];
    const answerMatch = q.match(/Đáp án[:：]?\s*([A-D])/i);
    const correct = answerMatch ? answerMatch[1].toUpperCase() : null;

    const [qRes] = await db.query(
      "INSERT INTO questions (challenge_id, question_text) VALUES (?, ?)",
      [challengeId, questionText]
    );
    const qId = qRes.insertId;

    for (const opt of optionMatches) {
      const letter = opt.trim()[0];
      const textOpt = opt.substring(2).trim();
      await db.query(
        "INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
        [qId, textOpt, letter === correct]
      );
    }
  }
}

/**
 * Parse Dạng 2 (NỐI).
 * - Dòng cặp dạng: "<left> | <right>"
 * - Có thêm mảng htmlSlice: song song với phần text của Dạng 2,
 *   để phát hiện <img> bên trái/phải và lấy src (đã lưu file ở bước convert).
 */
async function parseMatching(text, challengeId, htmlSlice) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Dòng ứng viên cặp "trái | phải" trong phần text
  const pairTextLines = lines.filter(l => l.includes("|") && !/^Hòm\b/i.test(l));

  // Dòng đáp án "1 - a", "2 - b", ...
  const answerLines = lines.filter(l => /\d+\s*[-–]\s*[a-z]/i.test(l));
  const answers = answerLines
    .map(line => {
      const m = line.match(/(\d+)\s*[-–]\s*([a-z])/i);
      return m ? { index: parseInt(m[1], 10) - 1, match: m[2].toLowerCase() } : null;
    })
    .filter(Boolean);

  // Tạo 1 câu hỏi cha cho cả cụm nối
  const [qRes] = await db.query(
    "INSERT INTO questions (challenge_id, question_text) VALUES (?, ?)",
    [challengeId, "Câu nối tương ứng"]
  );
  const qId = qRes.insertId;

  // Ánh xạ textLine -> htmlLine trong phần slice (dựa trên nội dung text khớp)
  // Lấy tất cả htmlLines (text/html) trong phạm vi "Dạng 2" đã tính ở ngoài
  // Sau đó khớp bằng text để tìm html tương ứng từng pair
  function findHtmlForTextLine(t) {
    // tìm dòng html đầu tiên có text giống hệt (sau khi chuẩn hóa khoảng trắng)
    const norm = (s) => s.replace(/\s+/g, " ").trim();
    const target = norm(t);
    const found = htmlSlice.find(h => norm(h.text) === target);
    return found ? found.html : "";
  }

  for (let i = 0; i < pairTextLines.length; i++) {
    const textLine = pairTextLines[i];
    const htmlLine = findHtmlForTextLine(textLine) || "";

    // Tách trái | phải ở TEXT
    const [leftTextRaw, rightTextRaw] = textLine.split("|").map(s => s.trim());

    // Tách trái | phải ở HTML (đã ghép bằng " | " khi là table; còn nếu p/li thường cũng khớp)
    const [leftHtmlRaw = "", rightHtmlRaw = ""] = htmlLine.split("|");

    // Kiểm tra có ảnh không
    const extractImgSrc = (fragHtml) => {
      const $frag = cheerio.load(`<div>${fragHtml || ""}</div>`);
      const img = $frag("img").first();
      if (img.length) {
        // mammoth đã thay src thành đường dẫn file vừa lưu ở bước convert
        const src = img.attr("src") || "";
        // Lưu dạng không có domain, ví dụ: /uploads/matching/xxx.png
        return src.startsWith("/") ? src.slice(1) : src; // cắt "/" đầu để DB lưu "uploads/..."
      }
      return null;
    };

    const leftImg = extractImgSrc(leftHtmlRaw);
    const rightImg = extractImgSrc(rightHtmlRaw);

    const left_text = leftImg ? null : leftTextRaw;
    const right_text = rightImg ? null : rightTextRaw;

    const correctMatch = answers.find(a => a.index === i)?.match || "";

    await db.query(
      `INSERT INTO matching_pairs 
       (question_id, left_text, left_image_url, right_text, right_image_url, correct_match)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        qId,
        left_text,
        leftImg ? leftImg : null, // ví dụ: "uploads/matching/xxx.png"
        right_text,
        rightImg ? rightImg : null,
        correctMatch,
      ]
    );
  }
}

async function parseShort(text, challengeId) {
  const questions = text.split(/Câu\s*\d+[:：]/i).slice(1);

  for (const q of questions) {
    const lines = q.split("\n").map(l => l.trim()).filter(l => l);
    const questionText = lines[0] || "";
    const ansMatch = q.match(/Đáp án[:：]?\s*(.+)/i);
    const answer = ansMatch ? ansMatch[1].trim() : "";

    const [qRes] = await db.query(
      "INSERT INTO questions (challenge_id, question_text) VALUES (?, ?)",
      [challengeId, questionText]
    );
    const qId = qRes.insertId;

    await db.query(
      "INSERT INTO short_answers (question_id, correct_answer) VALUES (?, ?)",
      [qId, answer]
    );
  }
}

module.exports = { upload, uploadDocx };
