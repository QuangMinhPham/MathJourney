const db = require('../config/db');

const getProfile = async (req, res) => {
    const userId = req.user.user_id; // Lấy từ middleware verifyToken
    try {
        // 1. Lấy thông tin cơ bản & Thống kê điểm từ các bảng liên quan
        const statsQuery = `
            SELECT 
                u.username, u.full_name, u.email,
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

        // 2. Logic tính toán Thứ hạng (Rank) chuyên nghiệp
        const checkRankQuery = `SELECT total_score FROM leaderboard WHERE user_id = ?`;
        
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
        const [rankRecord] = await db.execute(checkRankQuery, [userId]);
        const [activities] = await db.execute(activityQuery, [userId]);

        const user = stats[0];
        
        // Mặc định là chưa xếp hạng
        let rankPos = "Chưa xếp hạng";

        // Nếu người dùng đã có điểm trong bảng xếp hạng
        if (rankRecord.length > 0) {
            const userScore = rankRecord[0].total_score;
            // Đếm xem có bao nhiêu người điểm cao hơn mình
            const [rankResult] = await db.execute(
                `SELECT COUNT(*) + 1 AS pos FROM leaderboard WHERE total_score > ?`, 
                [userScore]
            );
            rankPos = rankResult[0].pos;
        }

        const response = {
            userInfo: {
                name: user.full_name || user.username,
                email: user.email,
                // Logic Avatar & Title dựa trên rankPos
                avatar: rankPos === 1 ? "🏴‍☠️" : (typeof rankPos === 'number' && rankPos <= 3 ? "⚓" : "⛵"),
                rank: rankPos,
                title: rankPos === 1 ? "Đô Đốc Hải Quân" : (typeof rankPos === 'number' && rankPos <= 3 ? "Thuyền Trưởng" : "Thủy Thủ")
            },
            achievements: {
                totalScore: Number(user.totalScore || 0),
                pearls: Number(user.pearls || 0),
                shells: Number(user.shells || 0),
                treasures: Number(user.treasures || 0),
                streak: 5, // Dữ liệu giả định
                completedLessons: activities.length
            },
            recentActivities: activities,
            badges: [
                { id: 1, name: "Thợ Săn Kho Báu", icon: "👑", rarity: "legendary", unlocked: Number(user.totalScore) > 1000 },
                { id: 2, name: "Bậc Thầy Đại Số", icon: "🧮", rarity: "epic", unlocked: Number(user.pearls) > 200 },
                { id: 3, name: "Thủy Thủ Tập Sự", icon: "🗺️", rarity: "common", unlocked: true }
            ]
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Lỗi Controller:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tải thông tin" });
    }
};

const updateName = async (req, res) => {
    const { name } = req.body;
    try {
        await db.execute('UPDATE users SET full_name = ? WHERE user_id = ?', [name, req.user.user_id]);
        res.json({ message: "Cập nhật tên thành công" });
    } catch (e) { 
        res.status(500).json({ message: "Lỗi khi cập nhật tên" }); 
    }
};

module.exports = { getProfile, updateName };