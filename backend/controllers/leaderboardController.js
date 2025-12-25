const db = require('../config/db');

const getLeaderboard = async (req, res) => {
    try {
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
                -- Đếm số thử thách khác nhau mà người dùng này đã tham gia
                COUNT(DISTINCT up.challenge_id) AS completed_count,
                -- Lấy tổng số thử thách có trong hệ thống
                (SELECT COUNT(*) FROM challenges) AS total_count
            FROM users u
            JOIN user_progress up ON u.user_id = up.user_id
            JOIN challenges c ON up.challenge_id = c.challenge_id
            GROUP BY u.user_id, u.full_name, u.username
            ORDER BY total_score DESC
            LIMIT 10;
        `;

        const [results] = await db.execute(query);
        
        const avatars = ["🏴‍☠️", "⚓", "🧜‍♀️", "🦀", "🐙", "🐠", "🐚", "⛵"];
        
        const formattedResults = results.map((item, index) => ({
            ...item,
            id: index + 1,
            // Chuyển thành số để tránh lỗi nối chuỗi ở Frontend
            pearls: Number(item.pearls),
            shells: Number(item.shells),
            treasure: Number(item.treasure),
            score: Number(item.total_score),
            // Tạo chuỗi hiển thị tỉ lệ (ví dụ: "5/23")
            participation_ratio: `${item.completed_count}/${item.total_count}`,
            // Tính phần trăm thực tế (ví dụ: 21.7)
            completion_percentage: ((item.completed_count / item.total_count) * 100).toFixed(1),
            avatar: avatars[index % avatars.length]
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error("Lỗi lấy bảng xếp hạng:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getLeaderboard };