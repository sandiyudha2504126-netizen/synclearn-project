const express = require('express');
const router = express.Router();
const dbPool = require('../config/db');

// 1. GET /api/users - Mengambil semua data karyawan
router.get('/users', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM users ORDER BY user_id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Gagal mengambil data karyawan', error: error.message });
  }
});

// 2. GET /api/courses - Mengambil semua materi kursus
router.get('/courses', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM courses ORDER BY course_id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Gagal mengambil data kursus', error: error.message });
  }
});

// 3. POST /api/courses - Admin HR membuat materi kursus baru
router.post('/courses', async (req, res) => {
  const { title, description, content_format, passing_threshold, kpi_points } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Judul materi kursus wajib diisi.' });
  }

  try {
    const [result] = await dbPool.query(
      'INSERT INTO courses (title, description, content_format, passing_threshold, kpi_points) VALUES (?, ?, ?, ?, ?)',
      [
        title,
        description || '',
        content_format || 'doc',
        Number(passing_threshold) || 80,
        Number(kpi_points) || 10,
      ]
    );
    res.status(201).json({
      message: `Materi "${title}" berhasil ditambahkan ke katalog!`,
      course_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Gagal membuat materi kursus', error: error.message });
  }
});

// 4. GET /api/enrollments - Monitoring progres belajar & skor KPI seluruh karyawan
router.get('/enrollments', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.enrollment_id,
        e.status,
        e.score,
        e.due_date,
        e.is_kpi_synced,
        e.completed_at,
        u.user_id,
        u.hris_user_id,
        u.full_name,
        u.department,
        c.course_id,
        c.title AS course_title,
        c.kpi_points
      FROM enrollments e
      JOIN users u ON e.user_id = u.user_id
      JOIN courses c ON e.course_id = c.course_id
      ORDER BY e.enrollment_id DESC
    `;
    const [rows] = await dbPool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all enrollments:', error);
    res.status(500).json({ message: 'Gagal mengambil data monitoring progres', error: error.message });
  }
});

// 5. GET /api/enrollments/user/:userId - Mengambil progres kursus karyawan tertentu
router.get('/enrollments/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT 
        e.enrollment_id,
        e.status,
        e.score,
        e.due_date,
        e.is_kpi_synced,
        c.course_id,
        c.title,
        c.description,
        c.content_format,
        c.passing_threshold,
        c.kpi_points
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.user_id = ?
    `;
    const [rows] = await dbPool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({ message: 'Gagal mengambil data progres belajar', error: error.message });
  }
});

// 6. POST /api/enrollments - Admin HR menugaskan kursus baru ke karyawan
router.post('/enrollments', async (req, res) => {
  const { user_id, course_id, due_date } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ message: 'Karyawan dan kursus wajib dipilih.' });
  }

  try {
    const [existing] = await dbPool.query(
      'SELECT enrollment_id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Kursus ini sudah ditugaskan ke karyawan tersebut.' });
    }

    const [result] = await dbPool.query(
      'INSERT INTO enrollments (user_id, course_id, status, due_date) VALUES (?, ?, ?, ?)',
      [user_id, course_id, 'enrolled', due_date || null]
    );

    res.status(201).json({
      message: 'Kursus berhasil ditugaskan ke karyawan!',
      enrollment_id: result.insertId,
    });
  } catch (error) {
    console.error('Error assigning course:', error);
    res.status(500).json({ message: 'Gagal menugaskan kursus', error: error.message });
  }
});

// 7. PUT /api/enrollments/:enrollmentId/complete - Menyelesaikan kursus & sinkronisasi KPI
router.put('/enrollments/:enrollmentId/complete', async (req, res) => {
  const { enrollmentId } = req.params;
  const { score } = req.body;
  try {
    const query = `
      UPDATE enrollments 
      SET status = 'completed', score = ?, is_kpi_synced = TRUE, completed_at = NOW() 
      WHERE enrollment_id = ?
    `;
    await dbPool.query(query, [score, enrollmentId]);
    res.json({ message: 'Kursus selesai dan poin KPI berhasil disinkronkan!' });
  } catch (error) {
    console.error('Error completing course:', error);
    res.status(500).json({ message: 'Gagal memperbarui status kursus', error: error.message });
  }
});

// 8. POST /api/webhooks/hris/user-created - Simulasi Webhook dari sistem HRIS
router.post('/webhooks/hris/user-created', async (req, res) => {
  const { hris_user_id, full_name, email, department, role } = req.body;
  try {
    const query = `
      INSERT INTO users (hris_user_id, full_name, email, department, role) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await dbPool.query(query, [
      hris_user_id,
      full_name,
      email,
      department || 'General',
      role || 'learner',
    ]);
    res.status(201).json({
      message: `Karyawan ${full_name} berhasil disinkronkan dari HRIS!`,
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Error syncing HRIS user:', error);
    res.status(500).json({ message: 'Gagal menyinkronkan data HRIS', error: error.message });
  }
});

// 9. DELETE /api/courses/:courseId - Menghapus materi kursus beserta data penugasannya
router.delete('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    await dbPool.query('DELETE FROM enrollments WHERE course_id = ?', [courseId]);
    const [result] = await dbPool.query('DELETE FROM courses WHERE course_id = ?', [courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materi kursus tidak ditemukan.' });
    }

    res.json({ message: 'Materi kursus dan seluruh penugasan terkait berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Gagal menghapus materi kursus', error: error.message });
  }
});

// 10. DELETE /api/enrollments/:enrollmentId - Menghapus/membatalkan penugasan kursus karyawan
router.delete('/enrollments/:enrollmentId', async (req, res) => {
  const { enrollmentId } = req.params;
  try {
    const [result] = await dbPool.query('DELETE FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data penugasan tidak ditemukan.' });
    }

    res.json({ message: 'Penugasan kursus berhasil dihapus!' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ message: 'Gagal menghapus penugasan kursus', error: error.message });
  }
});

module.exports = router;