const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdminOrTeacher } = require('../middlewares/auth');

router.get('/chapters', verifyToken, verifyAdminOrTeacher, adminController.getChapters);
router.get('/challenges/:chapterId', verifyToken, verifyAdminOrTeacher, adminController.getChallengesByChapter);
router.get('/questions/:challengeId', verifyToken, verifyAdminOrTeacher, adminController.getQuestionsContent);
router.post('/update-questions', verifyToken,verifyAdminOrTeacher, adminController.updateQuestions); 
router.get('/students', verifyToken, verifyAdminOrTeacher, adminController.getAllStudents);
router.put('/update-student', verifyToken, verifyAdminOrTeacher, adminController.updateStudent);
router.delete('/delete-student/:id', verifyToken, verifyAdminOrTeacher, adminController.deleteStudent);
router.get('/grades/:chapterId', verifyToken, verifyAdminOrTeacher, adminController.getGradesReport);
router.get('/stats', verifyToken, verifyAdminOrTeacher, adminController.getOverviewStats);

module.exports = router;