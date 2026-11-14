const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dbPool = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint cek status server
app.get('/', (req, res) => {
  res.send('Server SyncLearn LMS Berjalan!');
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API SyncLearn Berjalan di Vercel!' });
});

// Daftarkan seluruh endpoint API dengan awalan /api
app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
