const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/auth'); 

// Cấu hình lưu trữ ảnh Avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/avatars'); // Lưu vào frontend/public/images/avatars qua Docker volume
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.user_id}${ext}`); // Tên file là id_user
  }
});
const upload = multer({ storage });

router.get('/', verifyToken, profileController.getProfile);
router.put('/update', verifyToken, profileController.updateBasicInfo);
router.post('/change-password', verifyToken, profileController.changePassword);
router.post('/avatar', verifyToken, upload.single('avatar'), profileController.updateAvatarInDb);

module.exports = router;