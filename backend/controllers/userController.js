const db = require('../config/db');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    const userId = req.user.id; // Lấy từ token/session
    try {
        const query = `
            SELECT 
                u.user_id, u.username, u.full_name, u.email,
                SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END) AS pearls,
                SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END) AS shells,
                SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END) AS treasure,
                (SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END) + 
                 SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END) + 
                 SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END) * 3) AS total_score,
                (SELECT COUNT(*) + 1 FROM (
                    SELECT user_id, (SUM(score)) as total FROM user_progress GROUP BY user_id
                ) AS t WHERE t.total > (SELECT SUM(score) FROM user_progress WHERE user_id = u.user_id)) as rank_pos
            FROM users u
            LEFT JOIN user_progress up ON u.user_id = up.user_id
            LEFT JOIN challenges c ON up.challenge_id = c.challenge_id
            WHERE u.user_id = ?
            GROUP BY u.user_id;
        `;
        const [results] = await db.execute(query, [userId]);
        
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        // Giả lập huy hiệu và hoạt động gần đây (Bạn có thể tạo bảng riêng nếu cần)
        const profileData = {
            ...results[0],
            title: results[0].rank_pos === 1 ? "Đô Đốc Hải Quân" : (results[0].rank_pos <= 3 ? "Thuyền Trưởng" : "Thủy Thủ"),
            avatar: results[0].rank_pos === 1 ? "🏴‍☠️" : "⚓",
            streak: 5, // Mock data
            badges: [
                { id: 1, name: "Thợ Săn", icon: "👑", rarity: "legendary", unlocked: results[0].total_score > 500 },
                { id: 2, name: "Tân Thủ", icon: "🗺️", rarity: "common", unlocked: true }
            ]
        };

        res.status(200).json(profileData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateName = async (req, res) => {
    const { full_name } = req.body;
    await db.execute('UPDATE users SET full_name = ? WHERE user_id = ?', [full_name, req.user.id]);
    res.json({ message: "Updated successfully" });
};

module.exports = { getProfile, updateName };