require('dotenv').config();
const mysql = require('mysql2');

// Cấu hình thông số kết nối - Bạn đang đặt tên biến là 'db'
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Kết nối database thất bại:', err.message);
  } else {
    console.log('✅ Kết nối database thành công!');
    connection.release();
  }
});
// SỬA TẠI ĐÂY: Đổi pool.promise() thành db.promise()
module.exports = db.promise();