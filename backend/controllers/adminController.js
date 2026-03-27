const db = require('../config/db');
const bcrypt = require('bcrypt');

const getChapters = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT chapter_id, title, image FROM chapters ORDER BY chapter_id');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: "Lỗi DB" }); }
};

const getChallengesByChapter = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT challenge_id, title, type FROM challenges WHERE chapter_id = ?', [req.params.chapterId]);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: "Lỗi DB" }); }
};

const getQuestionsContent = async (req, res) => {
    const challengeId = req.params.challengeId;
    try {
        const [challenge] = await db.execute('SELECT type FROM challenges WHERE challenge_id = ?', [challengeId]);
        const type = challenge[0].type;
        
        // Lấy danh sách câu hỏi
        const [qs] = await db.execute('SELECT * FROM questions WHERE challenge_id = ? ORDER BY order_index', [challengeId]);
        
        for (let q of qs) {
            if (type === 'quiz') {
                const [opts] = await db.execute('SELECT * FROM options WHERE question_id = ?', [q.question_id]);
                q.options = opts;
            } else if (type === 'matching') {
                const [pairs] = await db.execute('SELECT * FROM matching_pairs WHERE question_id = ?', [q.question_id]);
                q.pairs = pairs;
            } else if (type === 'short_answer') {
                const [ans] = await db.execute('SELECT * FROM short_answers WHERE question_id = ?', [q.question_id]);
                q.short_answers = ans;
            }
        }
        res.json({ type, questions: qs });
    } catch (e) { res.status(500).json({ message: "Lỗi lấy dữ liệu" }); }
};

const updateQuestions = async (req, res) => {
    const { challenge_id, type, questions } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (let i = 0; i < questions.length; i++) {
            let q = questions[i];
            
            // Đối với Dạng 2 (matching), chúng ta cho phép question_text rỗng
            const isMatching = (type === 'matching');
            if (!isMatching && (!q.question_text || q.question_text.trim() === "")) continue;

            let qId = q.question_id;
            if (qId) {
                await connection.execute('UPDATE questions SET question_text = ? WHERE question_id = ?', [q.question_text || '', qId]);
            } else {
                const [result] = await connection.execute(
                    'INSERT INTO questions (challenge_id, question_text, order_index) VALUES (?, ?, ?)', 
                    [challenge_id, q.question_text || '', i + 1]
                );
                qId = result.insertId;
            }

            // Xử lý bảng con
            if (type === 'quiz' && q.options) {
                for (let opt of q.options) {
                    if (opt.option_id) {
                        await connection.execute('UPDATE options SET option_text = ?, is_correct = ? WHERE option_id = ?', [opt.option_text, opt.is_correct, opt.option_id]);
                    } else if (opt.option_text) {
                        await connection.execute('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [qId, opt.option_text, opt.is_correct]);
                    }
                }
            } else if (type === 'matching' && q.pairs) {
                for (let p of q.pairs) {
                    // Chỉ lưu nếu có ít nhất 1 vế có dữ liệu
                    if (p.left_text || p.right_text) {
                        if (p.pair_id) {
                            await connection.execute('UPDATE matching_pairs SET left_text = ?, right_text = ?, correct_match = ? WHERE pair_id = ?', [p.left_text, p.right_text, p.correct_match, p.pair_id]);
                        } else {
                            await connection.execute('INSERT INTO matching_pairs (question_id, left_text, right_text, correct_match) VALUES (?, ?, ?, ?)', [qId, p.left_text, p.right_text, p.correct_match]);
                        }
                    }
                }
            } else if (type === 'short_answer' && q.short_answers) {
                for (let a of q.short_answers) {
                    if (a.answer_id) {
                        await connection.execute('UPDATE short_answers SET correct_answer = ? WHERE answer_id = ?', [a.correct_answer, a.answer_id]);
                    } else if (a.correct_answer) {
                        await connection.execute('INSERT INTO short_answers (question_id, correct_answer) VALUES (?, ?)', [qId, a.correct_answer]);
                    }
                }
            }
        }

        await connection.commit();
        res.json({ message: "✅ Đã lưu vào database thành công!" });
    } catch (e) {
        await connection.rollback();
        console.error(e);
        res.status(500).json({ message: "Lỗi khi lưu dữ liệu" });
    } finally { connection.release(); }
};

const getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT user_id, username, full_name, email, phone, class_name, 
                   DATE_FORMAT(dob, '%Y-%m-%d') as dob, gender, status, avatar, created_at 
            FROM users WHERE role = 'student' ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: "Lỗi tải danh sách" }); }
};

const updateStudent = async (req, res) => {
    const { user_id, full_name, email, phone, class_name, dob, gender, status, password, username } = req.body;
    try {
        // 1. Cập nhật thông tin cơ bản
        await db.execute(
            `UPDATE users SET full_name=?, email=?, phone=?, class_name=?, dob=?, gender=?, status=?, username=? WHERE user_id=?`,
            [full_name, email, phone, class_name, dob, gender, status, username, user_id]
        );

        // 2. Nếu giáo viên đổi mật khẩu mới (kiểm tra độ dài để tránh rỗng)
        if (password && password.length > 0 && !password.startsWith('$2b$')) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);
        }

        res.json({ message: "✅ Đã lưu hồ sơ thủy thủ!" });
    } catch (e) { res.status(500).json({ message: "Lỗi cập nhật dữ liệu" }); }
};

const deleteStudent = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE user_id = ?', [req.params.id]);
        res.json({ message: "🗑 Đã xóa tài khoản vĩnh viễn" });
    } catch (e) { res.status(500).json({ message: "Không thể xóa học sinh này" }); }
};

const getGradesReport = async (req, res) => {
    const { chapterId } = req.params;
    try {
        let query;
        let params = [];

        if (chapterId === 'all') {
            // CHẾ ĐỘ TOÀN BỘ: Cộng dồn điểm từng loại từ tất cả các chương
            query = `
                SELECT 
                    u.user_id, u.full_name, u.email, u.class_name,
                    SUM(CASE WHEN c.type = 'quiz' THEN up.score END) as score1,
                    SUM(CASE WHEN c.type = 'matching' THEN up.score END) as score2,
                    SUM(CASE WHEN c.type = 'short_answer' THEN up.score END) as score3,
                    IFNULL(SUM(up.score), 0) as total_score,
                    COUNT(up.progress_id) as challenges_done
                FROM users u
                LEFT JOIN user_progress up ON u.user_id = up.user_id
                LEFT JOIN challenges c ON up.challenge_id = c.challenge_id
                WHERE u.role = 'student'
                GROUP BY u.user_id, u.full_name, u.email, u.class_name
                ORDER BY u.user_id ASC
            `;
        } else {
            // CHẾ ĐỘ THEO BÀI: Chỉ lấy điểm 3 thử thách thuộc chương đó
            query = `
                SELECT 
                    u.user_id, u.full_name, u.email, u.class_name,
                    MAX(CASE WHEN c.type = 'quiz' AND up.chapter_id = ? THEN up.score END) as score1,
                    MAX(CASE WHEN c.type = 'matching' AND up.chapter_id = ? THEN up.score END) as score2,
                    MAX(CASE WHEN c.type = 'short_answer' AND up.chapter_id = ? THEN up.score END) as score3,
                    IFNULL(SUM(CASE WHEN up.chapter_id = ? THEN up.score ELSE 0 END), 0) as total_score,
                    COUNT(CASE WHEN up.chapter_id = ? THEN up.progress_id END) as challenges_done
                FROM users u
                LEFT JOIN user_progress up ON u.user_id = up.user_id AND up.chapter_id = ?
                LEFT JOIN challenges c ON up.challenge_id = c.challenge_id
                WHERE u.role = 'student'
                GROUP BY u.user_id, u.full_name, u.email, u.class_name
                ORDER BY u.user_id ASC
            `;
            params = [chapterId, chapterId, chapterId, chapterId, chapterId, chapterId];
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (e) {
        console.error("Lỗi Backend:", e);
        res.status(500).json({ message: "Lỗi tải báo cáo" });
    }
};

const getOverviewStats = async (req, res) => {
    try {
        // Đếm tổng học sinh
        const [[{ totalStudents }]] = await db.execute(
            "SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'"
        );
        // Đếm bài nộp trong ngày hôm nay
        const [[{ submissionsToday }]] = await db.execute(
            "SELECT COUNT(*) as submissionsToday FROM user_progress WHERE DATE(attempt_date) = CURDATE()"
        );
        // Đếm số thử thách hiện có
        const [[{ activeChallenges }]] = await db.execute(
            "SELECT COUNT(*) as activeChallenges FROM challenges"
        );
        // Đếm tổng số giáo viên
        const [[{ totalTeachers }]] = await db.execute(
            "SELECT COUNT(*) as totalTeachers FROM users WHERE role = 'teacher'"
        );

        res.json({
            totalStudents,
            submissionsToday,
            activeChallenges,
            totalTeachers
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi tải thống kê hệ thống" });
    }
};

const updateChapter = async (req, res) => {
    const { chapterId } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Tên bài học không được để trống!" });
    try {
        await db.execute('UPDATE chapters SET title = ? WHERE chapter_id = ?', [title.trim(), chapterId]);
        res.json({ message: "✅ Đã cập nhật tên bài học!" });
    } catch (e) {
        console.error("Lỗi updateChapter:", e);
        res.status(500).json({ message: "Lỗi cập nhật tên bài học" });
    }
};

const updateChapterImage = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Không có file ảnh!" });
    try {
        await db.execute('UPDATE chapters SET image = ? WHERE chapter_id = ?', [req.file.filename, req.params.chapterId]);
        res.json({ filename: req.file.filename });
    } catch (e) {
        console.error("Lỗi updateChapterImage:", e);
        res.status(500).json({ message: "Lỗi lưu ảnh bài học" });
    }
};

module.exports = { getChapters, getChallengesByChapter, getQuestionsContent, updateQuestions, getAllStudents, updateStudent, deleteStudent, getGradesReport, getOverviewStats, updateChapter, updateChapterImage };