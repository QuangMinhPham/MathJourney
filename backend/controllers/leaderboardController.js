const db = require('../config/db');

const getLeaderboard = async (req, res) => {
    try {
        const limit = 10;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const offset = (page - 1) * limit;

        // Đếm tổng học sinh có điểm để tính số trang
        const [[{ total }]] = await db.execute(`
            SELECT COUNT(DISTINCT u.user_id) AS total
            FROM users u
            JOIN user_progress up ON u.user_id = up.user_id
            WHERE u.role = 'student'
        `);

        const query = `
            SELECT
                COALESCE(u.full_name, u.username) AS name,
                SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END) AS pearls,
                SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END) AS shells,
                SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END) AS treasure,
                (
                    SUM(CASE WHEN c.type = 'quiz' THEN up.score ELSE 0 END) +
                    SUM(CASE WHEN c.type = 'matching' THEN up.score ELSE 0 END) +
                    SUM(CASE WHEN c.type = 'short_answer' THEN up.score ELSE 0 END)
                ) AS total_score,
                COUNT(DISTINCT up.challenge_id) AS completed_count,
                (SELECT COUNT(*) FROM challenges) AS total_count
            FROM users u
            JOIN user_progress up ON u.user_id = up.user_id
            JOIN challenges c ON up.challenge_id = c.challenge_id
            WHERE u.role = 'student'
            GROUP BY u.user_id, u.full_name, u.username
            ORDER BY total_score DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [results] = await db.execute(query);

        const avatars = ["🏴‍☠️", "⚓", "🧜‍♀️", "🦀", "🐙", "🐠", "🐚", "⛵"];

        const formattedResults = results.map((item, index) => ({
            ...item,
            rank: offset + index + 1,
            pearls: Number(item.pearls),
            shells: Number(item.shells),
            treasure: Number(item.treasure),
            score: Number(item.total_score),
            participation_ratio: `${item.completed_count}/${item.total_count}`,
            completion_percentage: ((item.completed_count / item.total_count) * 100).toFixed(1),
            avatar: avatars[(offset + index) % avatars.length]
        }));

        res.status(200).json({
            data: formattedResults,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Lỗi lấy bảng xếp hạng:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getLeaderboard };