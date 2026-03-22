const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth');

router.get('/chapters', verifyToken, adminController.getChapters);
router.get('/challenges/:chapterId', verifyToken, adminController.getChallengesByChapter);
router.get('/questions/:challengeId', verifyToken, adminController.getQuestionsContent);
router.post('/update-questions', verifyToken, adminController.updateQuestions); 
router.get('/students', verifyToken, adminController.getAllStudents);
router.put('/update-student', verifyToken, adminController.updateStudent);
router.delete('/delete-student/:id', verifyToken, adminController.deleteStudent);
router.get('/grades/:chapterId', verifyToken, adminController.getGradesReport);

module.exports = router;