const db = require('../config/db');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    const userId = req.user.user_id; // Lấy từ middleware verifyToken
    try {
        // 1. Lấy thông tin cơ bản & Thống kê điểm
        const statsQuery = `
            SELECT 
                u.username, u.full_name, u.email,
                SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END) AS pearls,
                SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END) AS shells,
                SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END) AS treasures,
                (SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END) + 
                 SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END) + 
                 SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END) * 3) AS totalScore
            FROM users u
            LEFT JOIN user_progress up ON u.user_id = up.user_id
            LEFT JOIN challenges c ON up.challenge_id = c.challenge_id
            WHERE u.user_id = ?
            GROUP BY u.user_id
        `;

        // 2. Tính toán thứ hạng (Rank)
        const rankQuery = `
            SELECT COUNT(*) + 1 AS rank_position 
            FROM leaderboard 
            WHERE total_score > (SELECT total_score FROM leaderboard WHERE user_id = ?)
        `;

        // 3. Lấy 4 hoạt động gần đây nhất
        const activityQuery = `
            SELECT 
                c.title, 
                up.score AS points, 
                DATE_FORMAT(up.attempt_date, '%d/%m/%Y %H:%i') AS date
            FROM user_progress up
            JOIN challenges c ON up.challenge_id = c.challenge_id
            WHERE up.user_id = ?
            ORDER BY up.attempt_date DESC
            LIMIT 4
        `;

        const [stats] = await db.execute(statsQuery, [userId]);
        const [rank] = await db.execute(rankQuery, [userId]);
        const [activities] = await db.execute(activityQuery, [userId]);

        const user = stats[0];
        const rankPos = rank[0].rank_position;

        // Giả lập logic Title và Badges dựa trên dữ liệu thật
        const response = {
            userInfo: {
                name: user.full_name || user.username,
                email: user.email,
                avatar: rankPos === 1 ? "🏴‍☠️" : (rankPos <= 3 ? "⚓" : "⛵"),
                rank: rankPos,
                title: rankPos === 1 ? "Đô Đốc Hải Quân" : (rankPos <= 3 ? "Thuyền Trưởng" : "Thủy Thủ")
            },
            achievements: {
                totalScore: Number(user.totalScore || 0),
                pearls: Number(user.pearls || 0),
                shells: Number(user.shells || 0),
                treasures: Number(user.treasures || 0),
                streak: 5,
                completedLessons: activities.length
            },
            recentActivities: activities,
            badges: [
                { id: 1, name: "Thợ Săn Huyền Thoại", icon: "👑", rarity: "legendary", unlocked: user.totalScore > 1000 },
                { id: 2, name: "Bậc Thầy Đại Số", icon: "🧮", rarity: "epic", unlocked: user.pearls > 200 },
                { id: 3, name: "Khám Phá Viên", icon: "🗺️", rarity: "common", unlocked: true }
            ]
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

const updateName = async (req, res) => {
    const { name } = req.body;
    try {
        await db.execute('UPDATE users SET full_name = ? WHERE user_id = ?', [name, req.user.user_id]);
        res.json({ message: "Cập nhật tên thành công" });
    } catch (e) { res.status(500).send(e); }
};

module.exports = { getProfile, updateName };