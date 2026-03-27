const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdminOrTeacher } = require('../middlewares/auth');

const chapterImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'public/images/chapters'),
  filename: (req, file, cb) => cb(null, `chapter_${req.params.chapterId}${path.extname(file.originalname)}`),
});
const uploadChapterImage = multer({ storage: chapterImageStorage });

router.get('/chapters', verifyToken, verifyAdminOrTeacher, adminController.getChapters);
router.get('/challenges/:chapterId', verifyToken, verifyAdminOrTeacher, adminController.getChallengesByChapter);
router.get('/questions/:challengeId', verifyToken, verifyAdminOrTeacher, adminController.getQuestionsContent);
router.post('/update-questions', verifyToken,verifyAdminOrTeacher, adminController.updateQuestions); 
router.get('/students', verifyToken, verifyAdminOrTeacher, adminController.getAllStudents);
router.put('/update-student', verifyToken, verifyAdminOrTeacher, adminController.updateStudent);
router.delete('/delete-student/:id', verifyToken, verifyAdminOrTeacher, adminController.deleteStudent);
router.get('/grades/:chapterId', verifyToken, verifyAdminOrTeacher, adminController.getGradesReport);
router.get('/stats', verifyToken, verifyAdminOrTeacher, adminController.getOverviewStats);
router.put('/update-chapter/:chapterId', verifyToken, verifyAdminOrTeacher, adminController.updateChapter);
router.post('/chapter-image/:chapterId', verifyToken, verifyAdminOrTeacher, uploadChapterImage.single('image'), adminController.updateChapterImage);

module.exports = router;