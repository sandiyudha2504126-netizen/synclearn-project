import React, { useEffect, useState } from 'react';
import api from '../services/api';

const PRESET_EMPLOYEES = [
  { hris_user_id: 'EMP-401', full_name: 'Nadia Maharani', email: 'nadia.m@synclearn.id', department: 'Engineering', role: 'learner' },
  { hris_user_id: 'EMP-402', full_name: 'Rizky Ramadhan', email: 'rizky.r@synclearn.id', department: 'Product Ops', role: 'learner' },
  { hris_user_id: 'EMP-403', full_name: 'Clarissa Tan', email: 'clarissa.t@synclearn.id', department: 'Finance', role: 'learner' },
];

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('monitoring'); // 'monitoring' | 'courses' | 'hris'
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'active'
  const [notif, setNotif] = useState({ type: '', text: '' });
  const [presetIdx, setPresetIdx] = useState(0);

  // Form 1: Penugasan Kursus
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');

  // Form 2: Buat Materi Kursus Baru
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    content_format: 'video',
    passing_threshold: 80,
    kpi_points: 20,
  });

  // Form 3: Simulasi Webhook HRIS
  const [hrisForm, setHrisForm] = useState({
    hris_user_id: '',
    full_name: '',
    email: '',
    department: 'Finance',
    role: 'learner',
  });

  const fontSans = "'Plus Jakarta Sans', -apple-system, sans-serif";
  const fontSerif = "'Instrument Serif', Georgia, serif";
  const fontMono = "'JetBrains Mono', monospace";

  const showToast = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => {
      setNotif((prev) => (prev.text === text ? { type: '', text: '' } : prev));
    }, 4500);
  };

  const loadMasterData = async () => {
    try {
      const [usersRes, coursesRes, enrollRes] = await Promise.all([
        api.get('/users'),
        api.get('/courses'),
        api.get('/enrollments'),
      ]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setAllEnrollments(enrollRes.data);

      if (usersRes.data.length > 0 && !selectedUserId) {
        setSelectedUserId(usersRes.data[0].user_id);
      }
      if (coursesRes.data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesRes.data[0].course_id);
      }
    } catch (err) {
      console.error('Gagal memuat data master:', err);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/enrollments', {
        user_id: Number(selectedUserId),
        course_id: Number(selectedCourseId),
        due_date: dueDate,
      });
      showToast('success', res.data.message);
      loadMasterData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menugaskan kursus.');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', courseForm);
      showToast('success', res.data.message);
      setCourseForm({ title: '', description: '', content_format: 'video', passing_threshold: 80, kpi_points: 20 });
      loadMasterData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal membuat materi kursus.');
    }
  };

  const handleSimulateWebhook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/webhooks/hris/user-created', hrisForm);
      showToast('success', res.data.message);
      setHrisForm({ hris_user_id: '', full_name: '', email: '', department: 'Finance', role: 'learner' });
      loadMasterData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menyinkronkan karyawan HRIS.');
    }
  };

  const handleQuickFillHris = () => {
    const sample = PRESET_EMPLOYEES[presetIdx % PRESET_EMPLOYEES.length];
    const randomSuffix = Math.floor(10 + Math.random() * 89);
    setHrisForm({
      ...sample,
      hris_user_id: `${sample.hris_user_id}-${randomSuffix}`,
      email: sample.email.replace('@', `${randomSuffix}@`),
    });
    setPresetIdx((prev) => prev + 1);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Hapus penugasan kursus ini?')) return;
    try {
      const res = await api.delete(`/enrollments/${enrollmentId}`);
      showToast('success', res.data.message);
      loadMasterData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus penugasan.');
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Hapus materi "${title}" beserta seluruh penugasannya?`)) return;
    try {
      const res = await api.delete(`/courses/${courseId}`);
      showToast('success', res.data.message);
      setSelectedCourseId('');
      loadMasterData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus materi kursus.');
    }
  };

  const handleExportAuditCsv = () => {
    const headers = ['ID_HRIS', 'Nama_Karyawan', 'Departemen', 'Materi', 'Status', 'Skor', 'Poin_KPI'];
    const rows = filteredEnrollments.map((r) => [
      r.hris_user_id,
      `"${r.full_name}"`,
      r.department,
      `"${r.course_title}"`,
      r.status === 'completed' ? 'LULUS' : 'AKTIF',
      r.score ?? 0,
      r.status === 'completed' ? r.kpi_points : 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_KPI_SyncLearn_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Laporan Audit KPI berhasil diunduh dalam format CSV.');
  };

  // Kalkulasi Analitik KPI & Departemen
  const completedEnrollments = allEnrollments.filter((e) => e.status === 'completed');
  const totalKpiDistributed = completedEnrollments.reduce((sum, e) => sum + (e.kpi_points || 0), 0);
  const completionRate = allEnrollments.length > 0 ? Math.round((completedEnrollments.length / allEnrollments.length) * 100) : 0;

  const deptStatsMap = allEnrollments.reduce((acc, row) => {
    const dept = row.department || 'Umum';
    if (!acc[dept]) acc[dept] = { dept, total: 0, completed: 0, kpi: 0 };
    acc[dept].total += 1;
    if (row.status === 'completed') {
      acc[dept].completed += 1;
      acc[dept].kpi += row.kpi_points || 0;
    }
    return acc;
  }, {});
  const deptStats = Object.values(deptStatsMap);

  const filteredEnrollments = allEnrollments.filter((row) => {
    const matchText =
      row.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && row.status === 'completed') ||
      (statusFilter === 'active' && row.status !== 'completed');
    return matchText && matchStatus;
  });

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #d6d2c7',
    background: '#faf9f6',
    color: '#141413',
    fontSize: '13px',
    fontFamily: fontSans,
    boxSizing: 'border-box',
  };

  const navItemStyle = (tabKey) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 14px',
    marginBottom: '6px',
    borderRadius: '10px',
    border: 'none',
    background: activeTab === tabKey ? '#141413' : 'transparent',
    color: activeTab === tabKey ? '#f6f5f1' : '#4a4741',
    fontWeight: activeTab === tabKey ? '700' : '500',
    fontSize: '13px',
    fontFamily: fontSans,
    cursor: 'pointer',
    textAlign: 'left',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', color: '#141413', fontFamily: fontSans }}>
      {/* SIDEBAR KIRI */}
      <aside
        style={{
          width: '265px',
          flexShrink: 0,
          background: 'rgba(239, 237, 231, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid #dcd8ce',
          padding: '26px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div style={{ padding: '0 8px 22px', borderBottom: '1px solid #dcd8ce', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: '#141413',
                  color: '#f6f5f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fontSerif,
                  fontSize: '17px',
                  fontStyle: 'italic',
                }}
              >
                S
              </div>
              <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.03em' }}>SyncLearn.</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: fontMono,
                fontSize: '10px',
                color: '#0f5132',
                fontWeight: '700',
                marginTop: '10px',
                background: 'rgba(5, 150, 105, 0.12)',
                padding: '4px 9px',
                borderRadius: '999px',
              }}
            >
              <span className="live-dot" />
              HR ADMIN CONSOLE
            </div>
          </div>

          <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#858077', padding: '0 10px 8px', letterSpacing: '0.05em' }}>
            NAVIGASI OPERASIONAL
          </div>

          <nav>
            <button onClick={() => setActiveTab('monitoring')} style={navItemStyle('monitoring')}>
              <span>Monitoring KPI</span>
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: '11px',
                  background: activeTab === 'monitoring' ? 'rgba(255,255,255,0.16)' : '#e4e0d6',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                {allEnrollments.length}
              </span>
            </button>
            <button onClick={() => setActiveTab('courses')} style={navItemStyle('courses')}>
              <span>Penugasan & Katalog</span>
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: '11px',
                  background: activeTab === 'courses' ? 'rgba(255,255,255,0.16)' : '#e4e0d6',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                {courses.length}
              </span>
            </button>
            <button onClick={() => setActiveTab('hris')} style={navItemStyle('hris')}>
              <span>Sinkronisasi HRIS</span>
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: '11px',
                  background: activeTab === 'hris' ? 'rgba(255,255,255,0.16)' : '#e4e0d6',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                {users.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Kartu Profil Admin */}
        <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #dcd8ce' }}>
          <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#059669', fontWeight: '700', marginBottom: '4px' }}>
            SESI TERVERIFIKASI
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700' }}>{user.full_name}</div>
          <div style={{ fontFamily: fontMono, fontSize: '11px', color: '#6e6a63', marginBottom: '12px' }}>
            {user.hris_user_id} • {user.department}
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '9px',
              background: '#f6f5f1',
              border: '1px solid #d6d2c7',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Keluar Akun →
          </button>
        </div>
      </aside>

      {/* AREA KERJA UTAMA */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: '1140px' }}>
        {/* Header Executive Metrik */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '26px' }}>
          <div className="editorial-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
            <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#6e6a63' }}>KARYAWAN AKTIF</div>
            <div style={{ fontFamily: fontSerif, fontSize: '32px', marginTop: '4px' }}>{users.length}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Tersinkron dari HRIS</div>
          </div>

          <div className="editorial-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
            <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#6e6a63' }}>MODUL SELESAI</div>
            <div style={{ fontFamily: fontSerif, fontSize: '32px', marginTop: '4px' }}>
              {completedEnrollments.length}{' '}
              <span style={{ fontFamily: fontMono, fontSize: '13px', color: '#858077' }}>/ {allEnrollments.length}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6e6a63' }}>Penugasan tervalidasi</div>
          </div>

          <div className="editorial-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
            <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#6e6a63' }}>TINGKAT KELULUSAN</div>
            <div style={{ fontFamily: fontSerif, fontSize: '32px', marginTop: '4px' }}>{completionRate}%</div>
            <div style={{ width: '100%', height: '5px', background: '#e5e2d9', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${completionRate}%`, height: '100%', background: '#059669', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          <div style={{ background: '#141413', color: '#f6f5f1', padding: '18px 20px', borderRadius: '12px' }}>
            <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#34d399' }}>TOTAL KPI TERSINKRON</div>
            <div style={{ fontFamily: fontSerif, fontSize: '32px', color: '#ffffff', marginTop: '4px' }}>
              +{totalKpiDistributed} <span style={{ fontFamily: fontMono, fontSize: '13px', color: '#34d399' }}>pts</span>
            </div>
            <div style={{ fontSize: '11px', color: '#a8a29e' }}>Siap audit rapor kuartalan</div>
          </div>
        </div>

        {/* Toast Notifikasi */}
        {notif.text && (
          <div
            className="page-transition-wrapper"
            style={{
              padding: '13px 18px',
              borderRadius: '10px',
              marginBottom: '22px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: notif.type === 'error' ? '#fef2f2' : '#ecfdf5',
              color: notif.type === 'error' ? '#991b1b' : '#0f5132',
              border: `1px solid ${notif.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            }}
          >
            <span>{notif.type === 'error' ? '⚠ ' : '✓ '} {notif.text}</span>
            <button
              onClick={() => setNotif({ type: '', text: '' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* WRAPPER TRANSISI HALUS ANTAR TAB */}
        <div key={activeTab} className="page-transition-wrapper">
          {/* TAB 1: MONITORING KPI */}
          {activeTab === 'monitoring' && (
            <section>
              {/* Ringkasan Performa per Departemen */}
              {deptStats.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: fontMono, fontSize: '11px', color: '#6e6a63', marginBottom: '10px', fontWeight: '700' }}>
                    DISTRIBUSI KPI PER DEPARTEMEN
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                    {deptStats.map((d) => {
                      const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                      return (
                        <div
                          key={d.dept}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #dcd8ce',
                            borderRadius: '10px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px' }}>{d.dept}</span>
                            <span style={{ fontFamily: fontMono, fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                              +{d.kpi} pts
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#efede7', borderRadius: '999px', overflow: 'hidden', marginBottom: '6px' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#059669' }} />
                          </div>
                          <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#6e6a63' }}>
                            {d.completed}/{d.total} modul tuntas ({pct}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Header Tabel & Kontrol Filter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
                <div>
                  <h1 style={{ fontFamily: fontSerif, fontSize: '28px', fontWeight: '400', margin: '0 0 2px' }}>
                    Laporan Progres & Sinkronisasi KPI
                  </h1>
                  <p style={{ fontSize: '13px', color: '#6e6a63', margin: 0 }}>
                    Audit kelulusan kuis evaluasi dan status sinkronisasi poin ke HRIS secara real-time.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  {/* Filter Pil */}
                  <div style={{ display: 'flex', background: '#efede7', padding: '3px', borderRadius: '8px', border: '1px solid #dcd8ce' }}>
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'completed', label: 'Lulus' },
                      { id: 'active', label: 'Aktif' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        style={{
                          padding: '6px 11px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: statusFilter === f.id ? '#141413' : 'transparent',
                          color: statusFilter === f.id ? '#ffffff' : '#5c5852',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Cari nama, divisi, materi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 13px',
                      borderRadius: '8px',
                      border: '1px solid #d6d2c7',
                      background: '#ffffff',
                      fontSize: '13px',
                      width: '210px',
                    }}
                  />

                  <button
                    onClick={handleExportAuditCsv}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #141413',
                      background: '#ffffff',
                      color: '#141413',
                      fontFamily: fontMono,
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    ↓ Ekspor Audit CSV
                  </button>
                </div>
              </div>

              {/* Tabel Ledger KPI */}
              <div style={{ background: '#ffffff', border: '1px solid #dcd8ce', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ background: '#efede7', fontFamily: fontMono, fontSize: '11px', color: '#5c5852' }}>
                    <tr>
                      <th style={{ padding: '14px 16px' }}>KARYAWAN</th>
                      <th style={{ padding: '14px 16px' }}>MATERI</th>
                      <th style={{ padding: '14px 16px' }}>STATUS</th>
                      <th style={{ padding: '14px 16px' }}>SKOR</th>
                      <th style={{ padding: '14px 16px' }}>KPI</th>
                      <th style={{ padding: '14px 16px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6e6a63' }}>
                          Tidak ada data penugasan yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredEnrollments.map((row) => (
                        <tr key={row.enrollment_id} style={{ borderTop: '1px solid #ebe8e0' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: '700' }}>{row.full_name}</div>
                            <div style={{ fontFamily: fontMono, fontSize: '11px', color: '#6e6a63' }}>
                              {row.hris_user_id} • {row.department}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '500' }}>{row.course_title}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontFamily: fontMono,
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '4px 9px',
                                borderRadius: '999px',
                                background: row.status === 'completed' ? '#ecfdf5' : '#fef3c7',
                                color: row.status === 'completed' ? '#0f5132' : '#92400e',
                              }}
                            >
                              {row.status === 'completed' ? '✓ LULUS' : '● AKTIF'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: fontMono, fontWeight: '700' }}>{row.score ?? '—'}</td>
                          <td
                            style={{
                              padding: '14px 16px',
                              fontFamily: fontMono,
                              fontWeight: '700',
                              color: row.status === 'completed' ? '#059669' : '#858077',
                            }}
                          >
                            {row.status === 'completed' ? `+${row.kpi_points}` : row.kpi_points} pts
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteEnrollment(row.enrollment_id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#b91c1c',
                                fontFamily: fontMono,
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              HAPUS
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 2: PENUGASAN & KATALOG */}
          {activeTab === 'courses' && (
            <section>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <form onSubmit={handleAssignCourse} style={{ background: '#ffffff', border: '1px solid #dcd8ce', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#6e6a63', marginBottom: '4px' }}>DISTRIBUSI MODUL</div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px' }}>Tugaskan Materi ke Karyawan</h2>
                  <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={inputStyle}>
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.full_name} ({u.hris_user_id})
                      </option>
                    ))}
                  </select>
                  <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} style={inputStyle}>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.title} (+{c.kpi_points} pts)
                      </option>
                    ))}
                  </select>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#141413',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Kirim Penugasan →
                  </button>
                </form>

                <form onSubmit={handleCreateCourse} style={{ background: '#ffffff', border: '1px solid #dcd8ce', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontFamily: fontMono, fontSize: '10px', color: '#059669', fontWeight: '700', marginBottom: '4px' }}>KURIKULUM BARU</div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px' }}>Tambah Modul ke Katalog</h2>
                  <input
                    type="text"
                    placeholder="Judul materi pelatihan"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="Deskripsi singkat"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={courseForm.content_format}
                      onChange={(e) => setCourseForm({ ...courseForm, content_format: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="video">Video</option>
                      <option value="doc">Dokumen</option>
                      <option value="quiz">Kuis</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Poin KPI"
                      value={courseForm.kpi_points}
                      onChange={(e) => setCourseForm({ ...courseForm, kpi_points: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Simpan Materi Baru
                  </button>
                </form>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #dcd8ce', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ background: '#efede7', fontFamily: fontMono, fontSize: '11px', color: '#5c5852' }}>
                    <tr>
                      <th style={{ padding: '14px 16px' }}>JUDUL MATERI</th>
                      <th style={{ padding: '14px 16px' }}>FORMAT</th>
                      <th style={{ padding: '14px 16px' }}>BOBOT KPI</th>
                      <th style={{ padding: '14px 16px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.course_id} style={{ borderTop: '1px solid #ebe8e0' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '700' }}>{c.title}</div>
                          <div style={{ fontSize: '12px', color: '#6e6a63' }}>{c.description}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: fontMono, textTransform: 'uppercase', fontSize: '11px' }}>
                          {c.content_format}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: fontMono, fontWeight: '700', color: '#059669' }}>
                          +{c.kpi_points} pts
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteCourse(c.course_id, c.title)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#b91c1c',
                              fontFamily: fontMono,
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            HAPUS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3: SINKRONISASI HRIS */}
          {activeTab === 'hris' && (
            <section style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
              <form onSubmit={handleSimulateWebhook} style={{ background: '#ffffff', border: '1px solid #dcd8ce', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: fontMono, fontSize: '10px', color: '#059669', fontWeight: '700' }}>
                    POST /WEBHOOKS/HRIS
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFillHris}
                    style={{
                      background: '#efede7',
                      border: '1px solid #d6d2c7',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontFamily: fontMono,
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Isi Data Contoh
                  </button>
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px' }}>Simulasi Karyawan Baru</h2>
                <input
                  type="text"
                  placeholder="ID HRIS (misal: EMP-401)"
                  value={hrisForm.hris_user_id}
                  onChange={(e) => setHrisForm({ ...hrisForm, hris_user_id: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={hrisForm.full_name}
                  onChange={(e) => setHrisForm({ ...hrisForm, full_name: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email perusahaan"
                  value={hrisForm.email}
                  onChange={(e) => setHrisForm({ ...hrisForm, email: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Departemen"
                  value={hrisForm.department}
                  onChange={(e) => setHrisForm({ ...hrisForm, department: e.target.value })}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Kirim Payload HRIS →
                </button>
              </form>

              <div style={{ background: '#ffffff', border: '1px solid #dcd8ce', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ background: '#efede7', fontFamily: fontMono, fontSize: '11px', color: '#5c5852' }}>
                    <tr>
                      <th style={{ padding: '14px 16px' }}>ID HRIS</th>
                      <th style={{ padding: '14px 16px' }}>NAMA</th>
                      <th style={{ padding: '14px 16px' }}>DEPARTEMEN</th>
                      <th style={{ padding: '14px 16px' }}>ROLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} style={{ borderTop: '1px solid #ebe8e0' }}>
                        <td style={{ padding: '14px 16px', fontFamily: fontMono, fontWeight: '700' }}>{u.hris_user_id}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '600' }}>{u.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#6e6a63' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{u.department}</td>
                        <td style={{ padding: '14px 16px', fontFamily: fontMono, fontSize: '11px', textTransform: 'uppercase' }}>
                          {u.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}