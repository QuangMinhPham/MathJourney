require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 👇 QUAN TRỌNG: Sửa dòng này để khớp với file config/db.js đã tạo trước đó
// Nếu file db.js export pool.promise() trực tiếp thì không dùng dấu { }
const db = require("../config/db"); 

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_tam_thoi";
const saltRounds = 10;

// ====================== SIGNUP ======================
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).send("Thiếu thông tin đăng ký!");
    }

    // Hash password
    const hash = await bcrypt.hash(password, saltRounds);

    // Insert vào DB
    const sql = "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'student')";
    // Lưu ý: bảng users của bạn dùng cột 'username' làm email đăng nhập, 
    // nên ta map email vào username, và name vào full_name
    const [result] = await db.query(sql, [email, hash, name]);

    console.log("✅ User registered, ID:", result.insertId);
    res.status(201).send("Đăng ký thành công!");
  } catch (err) {
    console.error("❌ Error signup:", err.message);
    res.status(500).send("Lỗi đăng ký: " + err.message);
  }
};

// ====================== LOGIN ======================
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm user theo email (cột username trong DB)
    const sql = "SELECT * FROM users WHERE username = ?";
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    // Tạo Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.username, // mapping username thành email
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("✅ Login success:", user.role);

    // Trả về JSON cho Vue.js xử lý
    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      username: user.username,
      role: user.role,
      avatar: user.avatar // Trả thêm avatar nếu có
    });

  } catch (err) {
    console.error("❌ Error login:", err.message);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

// ====================== AUTHENTICATE MIDDLEWARE (Dùng sau này) ======================
function authenticateToken(req, res, next) {
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).send("Access denied");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
}

// Export các hàm cần thiết
module.exports = {
  signup,
  login,
  authenticateToken
};