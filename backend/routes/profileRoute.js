const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Kiểm tra kĩ tên thư mục của bạn là 'middlewares' hay 'middleware'
const { verifyToken } = require('../middlewares/auth'); 

router.get('/', verifyToken, profileController.getProfile);
router.put('/name', verifyToken, profileController.updateName);

module.exports = router;