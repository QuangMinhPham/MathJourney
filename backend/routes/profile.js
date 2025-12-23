const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 👇 SỬA ĐƯỜNG DẪN Ở ĐÂY (Quan trọng)
const db = require("../config/db"); 
const { verifyToken } = require("../middlewares/auth");

// --- CẤU HÌNH UPLOAD ẢNH (Multer) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Đặt tên file: avatar-userid-timestamp.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// === 1. LẤY THÔNG TIN PROFILE ===
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const [rows] = await db.query(
      "SELECT username, full_name, role, avatar FROM users WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const user = rows[0];
    res.json({
      username: user.full_name || user.username, // Ưu tiên full_name
      email: user.username, // Trong DB cột username đang chứa email
      role: user.role,
      avatar_url: user.avatar || "images/default_avatar.jpg"
    });
  } catch (err) {
    console.error("❌ Lỗi lấy profile:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// === 2. ĐỔI TÊN HIỂN THỊ ===
router.put("/name", verifyToken, async (req, res) => {
  try {
    const { username } = req.body; // Frontend gửi lên field tên là 'username' (hiển thị)
    const user_id = req.user.user_id;

    await db.query("UPDATE users SET full_name = ? WHERE user_id = ?", [username, user_id]);
    
    res.json({ success: true, message: "Cập nhật tên thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đổi tên:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// === 3. ĐỔI MẬT KHẨU ===
router.put("/password", verifyToken, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user_id = req.user.user_id;

    // Lấy mật khẩu cũ trong DB
    const [rows] = await db.query("SELECT password FROM users WHERE user_id = ?", [user_id]);
    if (rows.length === 0) return res.status(404).json({ message: "User không tồn tại" });

    const currentHash = rows[0].password;

    // So sánh mật khẩu cũ
    // Lưu ý: Nếu DB cũ của bạn lưu password dạng text thường (chưa hash), hãy dùng: if (old_password !== currentHash)
    const isMatch = await bcrypt.compare(old_password, currentHash);
    
    // Nếu bạn đang dùng DB cũ (chưa mã hóa), hãy comment dòng trên và mở dòng dưới:
    // const isMatch = old_password === currentHash; 

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    // Cập nhật
    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [newHash, user_id]);

    res.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// === 4. ĐỔI AVATAR (Có hỗ trợ upload file hoặc link ảnh có sẵn) ===
router.put("/avatar", verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let avatarPath = "";

    // Trường hợp 1: Upload file từ máy tính
    if (req.file) {
      // Lưu đường dẫn file để frontend truy cập (VD: /uploads/avatar-123.jpg)
      // Lưu ý: Cần cấu hình static folder cho 'uploads' trong app.js
      avatarPath = `/uploads/${req.file.filename}`;
    } 
    // Trường hợp 2: Chọn avatar có sẵn (Frontend gửi string URL)
    else if (req.body.avatar_url) {
      avatarPath = req.body.avatar_url;
    } 
    else {
      return res.status(400).json({ message: "Chưa chọn ảnh!" });
    }

    await db.query("UPDATE users SET avatar = ? WHERE user_id = ?", [avatarPath, user_id]);

    res.json({ 
      success: true, 
      message: "Cập nhật avatar thành công!", 
      avatar_url: avatarPath 
    });

  } catch (err) {
    console.error("❌ Lỗi đổi avatar:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;