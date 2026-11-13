import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Bank soal evaluasi otomatis berdasarkan topik atau default
const getQuizQuestions = (courseTitle = '') => {
  const lower = courseTitle.toLowerCase();

  if (lower.includes('keamanan') || lower.includes('security') || lower.includes('siber')) {
    return [
      {
        q: 'Apa tindakan paling aman saat menerima email mencurigakan yang meminta kredensial HRIS?',
        options: [
          'Langsung klik tautan dan ganti kata sandi',
          'Laporkan ke tim IT Security tanpa mengklik tautan atau lampiran',
          'Teruskan email tersebut ke seluruh grup departemen',
        ],
        answer: 1,
      },
      {
        q: 'Mengapa autentikasi dua faktor (2FA) wajib diaktifkan pada akun perusahaan?',
        options: [
          'Menambah lapisan verifikasi meski kata sandi bocor',
          'Mempercepat koneksi internet kantor',
          'Menghapus kebutuhan mengganti kata sandi secara berkala',
        ],
        answer: 0,
      },
      {
        q: 'Bagaimana aturan penyimpanan dokumen rahasia karyawan?',
        options: [
          'Disimpan di perangkat pribadi tanpa enkripsi',
          'Dibagikan lewat tautan publik agar mudah diakses',
          'Disimpan di repositori terenkripsi perusahaan dengan kontrol akses berbasis peran',
        ],
        answer: 2,
      },
    ];
  }

  return [
    {
      q: `Apa tujuan utama penerapan materi "${courseTitle}" dalam operasional harian?`,
      options: [
        'Meningkatkan standar kualitas kerja dan kepatuhan SOP perusahaan',
        'Menggantikan seluruh koordinasi antar departemen',
        'Menghindari pencatatan evaluasi kinerja triwulanan',
      ],
      answer: 0,
    },
    {
      q: 'Kapan poin KPI dari pelatihan ini tercatat secara resmi ke sistem HRIS?',
      options: [
        'Saat karyawan baru mendaftar tanpa mengikuti evaluasi',
        'Setelah menyelesaikan materi dan mencapai skor minimal kelulusan',
        'Secara otomatis setiap akhir tahun tanpa perlu evaluasi',
      ],
      answer: 1,
    },
    {
      q: 'Langkah terbaik jika menemukan kendala teknis saat menerapkan standar prosedur baru adalah...',
      options: [
        'Mengabaikan prosedur hingga audit berikutnya',
        'Mendokumentasikan kendala dan berkoordinasi dengan supervisor atau tim HR',
        'Mengubah kebijakan secara sepihak tanpa persetujuan',
      ],
      answer: 1,
    },
  ];
};

export default function LearnerDashboard({ user, onLogout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ type: '', text: '' });

  // State Modal Kuis
  const [activeQuiz, setActiveQuiz] = useState(null); // Menyimpan objek enrollment yang sedang diuji
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null); // { score, passed, threshold }
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [enrollRes, courseRes] = await Promise.all([
        api.get(`/enrollments/user/${user.user_id}`),
        api.get('/courses'),
      ]);
      setEnrollments(enrollRes.data);
      setAllCourses(courseRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.user_id]);

  const openQuizModal = (enrollment) => {
    const generatedQuestions = getQuizQuestions(enrollment.title);
    setActiveQuiz(enrollment);
    setQuestions(generatedQuestions);
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const closeQuizModal = () => {
    setActiveQuiz(null);
    setQuestions([]);
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const handleSelectOption = (qIndex, optIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Harap jawab semua pertanyaan sebelum mengirim evaluasi.');
      return;
    }

    let correctCount = 0;
    questions.forEach((item, idx) => {
      if (selectedAnswers[idx] === item.answer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    const threshold = activeQuiz.passing_threshold || 80;
    const passed = calculatedScore >= threshold;

    setQuizResult({ score: calculatedScore, passed, threshold });

    if (passed) {
      setSubmitting(true);
      try {
        const res = await api.put(`/enrollments/${activeQuiz.enrollment_id}/complete`, {
          score: calculatedScore,
        });
        setNotif({
          type: 'success',
          text: `${res.data.message} (Skor Evaluasi: ${calculatedScore}/100)`,
        });
        loadData();
      } catch (err) {
        setNotif({
          type: 'error',
          text: 'Lulus kuis, tetapi gagal menyinkronkan poin KPI ke server.',
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const completedCount = enrollments.filter((item) => item.status === 'completed').length;
  const totalKpiEarned = enrollments
    .filter((item) => item.status === 'completed')
    .reduce((sum, item) => sum + (item.kpi_points || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#18181b', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: '56px' }}>
      {/* Top Navbar */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e4e4e7', padding: '16px 24px', marginBottom: '32px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', background: '#18181b', color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
              S
            </div>
            <div>
              <strong style={{ fontSize: '15px', color: '#18181b' }}>{user.full_name}</strong>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#71717a', marginLeft: '10px' }}>
                {user.hris_user_id} • {user.department || 'General'}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ padding: '8px 14px', background: '#ffffff', color: '#18181b', border: '1px solid #d4d4d8', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            Keluar
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 24px' }}>
        {/* Kartu Ringkasan KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#71717a' }}>TOTAL POIN KPI TERSINKRON</div>
            <div style={{ fontSize: '30px', fontFamily: 'monospace', fontWeight: '800', color: '#059669', marginTop: '6px' }}>
              +{totalKpiEarned} PTS
            </div>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#71717a' }}>MODUL DISELESAIKAN</div>
            <div style={{ fontSize: '30px', fontFamily: 'monospace', fontWeight: '800', color: '#18181b', marginTop: '6px' }}>
              {completedCount} / {enrollments.length}
            </div>
          </div>
        </div>

        {notif.text && (
          <div
            style={{
              background: notif.type === 'error' ? '#fef2f2' : '#ecfdf5',
              color: notif.type === 'error' ? '#b91c1c' : '#065f46',
              padding: '14px 18px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              border: `1px solid ${notif.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            }}
          >
            {notif.text}
          </div>
        )}

        {/* Daftar Kursus Ditugaskan */}
        <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#18181b', marginBottom: '16px' }}>
          Penugasan Pelatihan Saya
        </h2>

        {loading ? (
          <p style={{ color: '#71717a', fontSize: '14px' }}>Memuat daftar pelatihan...</p>
        ) : enrollments.length === 0 ? (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e4e4e7', color: '#71717a', fontSize: '14px', marginBottom: '36px' }}>
            Belum ada modul pelatihan yang ditugaskan untuk akun ini.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px', marginBottom: '40px' }}>
            {enrollments.map((item) => (
              <div
                key={item.enrollment_id}
                style={{
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', background: '#f4f4f5', padding: '3px 8px', borderRadius: '4px', color: '#52525b', textTransform: 'uppercase' }}>
                      {item.content_format || 'MODUL'}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: item.status === 'completed' ? '#ecfdf5' : '#fef3c7',
                        color: item.status === 'completed' ? '#059669' : '#b45309',
                        border: `1px solid ${item.status === 'completed' ? '#a7f3d0' : '#fde68a'}`,
                      }}
                    >
                      {item.status === 'completed' ? 'LULUS • SYNCED' : 'WAJIB'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#18181b' }}>{item.title}</h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#52525b', lineHeight: '1.5' }}>{item.description}</p>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#71717a', marginBottom: '14px', paddingTop: '12px', borderTop: '1px solid #f4f4f5' }}>
                    KPI: <strong>+{item.kpi_points} pts</strong> • Min. Skor: <strong>{item.passing_threshold || 80}</strong>
                  </div>

                  {item.status !== 'completed' ? (
                    <button
                      onClick={() => openQuizModal(item)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#18181b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}
                    >
                      Mulai Kuis Evaluasi →
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '9px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '700' }}>
                      SKOR AKHIR: {item.score}/100 (HRIS SYNCED)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Katalog Semua Materi */}
        <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#18181b', marginBottom: '14px' }}>
          Katalog Materi Perusahaan
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allCourses.map((course) => (
            <div key={course.course_id} style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#18181b', fontSize: '14px' }}>{course.title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#71717a' }}>{course.description}</p>
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 10px', borderRadius: '4px', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                +{course.kpi_points} KPI
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL KUIS INTERAKTIF */}
      {activeQuiz && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 50,
          }}
        >
          <div style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #e4e4e7', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e4e4e7', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#059669', fontWeight: '700', marginBottom: '4px' }}>
                  EVALUASI KELULUSAN • SYARAT MINIMAL: {activeQuiz.passing_threshold || 80}/100
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#18181b' }}>{activeQuiz.title}</h3>
              </div>
              <button
                onClick={closeQuizModal}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#71717a', cursor: 'pointer', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuiz}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {questions.map((item, qIdx) => (
                  <div key={qIdx} style={{ padding: '16px', background: '#fafaf9', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#18181b', marginBottom: '12px' }}>
                      {qIdx + 1}. {item.q}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.options.map((opt, optIdx) => {
                        const isChecked = selectedAnswers[qIdx] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              background: isChecked ? '#ecfdf5' : '#ffffff',
                              border: `1px solid ${isChecked ? '#059669' : '#e4e4e7'}`,
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              color: '#18181b',
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              checked={isChecked}
                              onChange={() => handleSelectOption(qIdx, optIdx)}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hasil Evaluasi Kuis */}
              {quizResult && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    marginBottom: '18px',
                    background: quizResult.passed ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${quizResult.passed ? '#a7f3d0' : '#fecaca'}`,
                    color: quizResult.passed ? '#065f46' : '#b91c1c',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>
                    SKOR ANDA: {quizResult.score}/100 (BATAS LULUS: {quizResult.threshold})
                  </div>
                  {quizResult.passed ? (
                    <div>Selamat! Anda lulus evaluasi dan +{activeQuiz.kpi_points} poin KPI telah disinkronkan ke HRIS.</div>
                  ) : (
                    <div>Skor belum mencapai batas minimal. Poin KPI belum disinkronkan — silakan perbaiki jawaban dan kirim ulang.</div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeQuizModal}
                  style={{ padding: '10px 16px', background: '#ffffff', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {quizResult?.passed ? 'Tutup' : 'Batal'}
                </button>
                {!quizResult?.passed && (
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '10px 20px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {submitting ? 'Menyinkronkan...' : 'Kirim Jawaban Evaluasi'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}