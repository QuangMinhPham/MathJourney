require('dotenv').config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Kiểm tra nếu thiếu SECRET để báo lỗi ngay khi khởi động server
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        // Đồng nhất key trả về là 'message' thay vì 'error' để Frontend dễ xử lý
        return res.status(401).json({ message: "Thiếu token xác thực" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verify error:", err.message);
            return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
        }

        req.user = decoded; // Payload chứa user_id, username, role từ database
        next();
    });
}

const verifyAdminOrTeacher = (req, res, next) => {
    // Middleware này LUÔN phải chạy SAU verifyToken
    if (!req.user) {
        return res.status(401).json({ message: "Bạn cần đăng nhập!" });
    }

    const { role } = req.user;
    if (role === 'admin' || role === 'teacher') {
        next();
    } else {
        // Mã 403: Có token nhưng quyền không đủ
        res.status(403).json({ message: "Truy cập bị từ chối! Khu vực dành riêng cho quản trị viên." });
    }
};

module.exports = { verifyToken, verifyAdminOrTeacher };