const db = require('../config/db');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    const userId = req.user.user_id;
    try {
        // Thêm u.phone, u.class_name, u.dob, u.gender vào câu lệnh SELECT 
        const statsQuery = `
            SELECT u.username, u.full_name, u.email, u.avatar, u.role, 
                   u.phone, u.class_name, u.dob, u.gender,
                COALESCE(SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END), 0) AS pearls,
                COALESCE(SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END), 0) AS shells,
                COALESCE(SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END), 0) AS treasures,
                COALESCE(SUM(up.score), 0) AS totalScore
            FROM users u
            LEFT JOIN user_progress up ON u.user_id = up.user_id
            LEFT JOIN challenges c ON up.challenge_id = c.challenge_id
            WHERE u.user_id = ?
            GROUP BY u.user_id
        `;

        const activityQuery = `
            SELECT CONCAT(ch.title, ' - ', c.title) AS activity_name, 
                   up.score AS points, DATE_FORMAT(up.attempt_date, '%d/%m/%Y %H:%i') AS date
            FROM user_progress up
            JOIN challenges c ON up.challenge_id = c.challenge_id
            JOIN chapters ch ON up.chapter_id = ch.chapter_id
            WHERE up.user_id = ? ORDER BY up.attempt_date DESC LIMIT 4
        `;

        const [stats] = await db.execute(statsQuery, [userId]);
        const [activities] = await db.execute(activityQuery, [userId]);
        const user = stats[0];

        const [rankRecord] = await db.execute(`SELECT total_score FROM leaderboard WHERE user_id = ?`, [userId]);
        let rankPos = "N/A";
        if (rankRecord.length > 0) {
            const [rankResult] = await db.execute(`SELECT COUNT(*) + 1 AS pos FROM leaderboard WHERE total_score > ?`, [rankRecord[0].total_score]);
            rankPos = rankResult[0].pos;
        }

        const totalPoints = Number(user.totalScore || 0);
        const pearlCount = Number(user.pearls || 0);
        const shellCount = Number(user.shells || 0);

        res.status(200).json({
            userInfo: {
                username: user.username,
                name: user.full_name || user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                // Bổ sung các trường còn thiếu vào phản hồi JSON 
                phone: user.phone || '',
                class: user.class_name || '', // Map class_name từ DB sang class cho Frontend 
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '', 
                gender: user.gender || 'Chưa xác định',
                rank: rankPos,
                title: rankPos === 1 ? "Đô Đốc Hải Quân" : (rankPos <= 3 ? "Thuyền Trưởng" : "Thủy Thủ")
            },
            achievements: { totalScore: totalPoints, pearls: pearlCount, shells: shellCount, treasures: Number(user.treasures || 0) },
            recentActivities: activities.map(a => ({ title: a.activity_name, date: a.date, points: a.points })),
            badges: [
                { id: 1, name: "Thợ Săn Kho Báu", icon: "👑", rarity: "legendary", current: totalPoints, target: 1000, unlocked: totalPoints >= 1000, unit: "điểm tổng" },
                { id: 2, name: "Bậc Thầy Giải Đố", icon: "🧮", rarity: "epic", current: pearlCount, target: 200, unlocked: pearlCount >= 200, unit: "ngọc trai" },
                { id: 3, name: "Thủy Thủ Chăm Chỉ", icon: "🗺️", rarity: "common", current: activities.length, target: 10, unlocked: activities.length >= 10, unit: "bài học" }
            ]
        });
    } catch (error) {
        console.error("Lỗi getProfile:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const [user] = await db.execute('SELECT password FROM users WHERE user_id = ?', [req.user.user_id]);
        const match = await bcrypt.compare(oldPassword, user[0].password);
        if (!match) return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashed, req.user.user_id]);
        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (e) { res.status(500).json({ message: "Lỗi đổi mật khẩu" }); }
};

const updateAvatarInDb = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Không có file!" });
    try {
        await db.execute('UPDATE users SET avatar = ? WHERE user_id = ?', [req.file.filename, req.user.user_id]);
        res.json({ filename: req.file.filename });
    } catch (e) { res.status(500).json({ message: "Lỗi lưu avatar" }); }
};

const updateAllProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; // Lấy từ middleware verifyToken
        const { full_name, username, email, phone, class_name, dob, gender } = req.body;

        // Kiểm tra xem username mới có bị trùng với người khác không
        const [existing] = await db.execute(
            'SELECT user_id FROM users WHERE username = ? AND user_id != ?', 
            [username, userId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "Tên đăng nhập này đã có người sử dụng!" });
        }

        // Thực hiện cập nhật
        const sql = `
            UPDATE users 
            SET full_name = ?, 
                username = ?, 
                email = ?, 
                phone = ?, 
                class_name = ?, 
                dob = ?, 
                gender = ? 
            WHERE user_id = ?
        `;
        
        await db.execute(sql, [
            full_name || null, 
            username, 
            email || null, 
            phone || null, 
            class_name || null, 
            dob || null, 
            gender || 'Nam', 
            userId
        ]);

        res.json({ message: "Hành trình của bạn đã được cập nhật thành công!" });
    } catch (e) {
        console.error("Lỗi updateAllProfile:", e.message);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
    }
};

module.exports = { getProfile, changePassword, updateAvatarInDb, updateAllProfile };