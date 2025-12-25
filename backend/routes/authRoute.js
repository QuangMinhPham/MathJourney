const express = require('express');
const router = express.Router();

// Import controller từ file vừa tạo ở trên
const {
    signup,
    login
} = require('../controllers/authController.js');

// Định nghĩa route
// POST /auth/add-user (Đăng ký)
router.post('/add-user', signup);

// POST /auth/login (Đăng nhập)
router.post('/login', login);

// GET /auth/register_and_login (Route test, trả về text thay vì file HTML)
router.get('/register_and_login', (req, res) => {
    res.send("API Auth is running ready for Vue.js");
});

module.exports = router;