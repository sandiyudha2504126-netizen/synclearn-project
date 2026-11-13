const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'synclearn_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Mengekspor versi promise agar bisa memakai await dbPool.query(...)
module.exports = pool.promise();