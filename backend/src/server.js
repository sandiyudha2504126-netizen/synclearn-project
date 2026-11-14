const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dbPool = require('./config/db');
const apiRoutes = require('./routes/apiRoutes'); // 1. Impor file route

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint cek status server
app.get('/', (req, res) => {
  res.send('Server SyncLearn LMS Berjalan!');
});

// 2. Daftarkan seluruh endpoint API dengan awalan /api
app.use('/api', apiRoutes);

// Jalankan port lokal hanya saat development (bukan di Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

// Wajib diekspor agar terbaca oleh Vercel Serverless Functions
module.exports = app;
