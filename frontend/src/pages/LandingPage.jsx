import React, { useState, useEffect } from 'react';

const INITIAL_LOGS = [
  {
    id: 'EVT-9041',
    time: '09:41:02',
    badge: 'HRIS_WEBHOOK',
    color: '#059669',
    actor: 'Raka Pratama (EMP-204)',
    detail: 'Staf baru masuk divisi Product Ops → Auto-enroll Onboarding K3',
    kpi: '+0 PTS',
  },
  {
    id: 'EVT-9042',
    time: '09:41:18',
    badge: 'QUIZ_PASSED',
    color: '#0284c7',
    actor: 'Nadia Kusuma (EMP-118)',
    detail: 'Skor Evaluasi Keamanan Data: 95/100 (Threshold: 80)',
    kpi: 'VERIFIED',
  },
  {
    id: 'EVT-9043',
    time: '09:41:19',
    badge: 'KPI_LOCKED',
    color: '#0f5132',
    actor: 'Nadia Kusuma (EMP-118)',
    detail: 'Bobot modul dikunci ke rapor KPI Kuartal IV',
    kpi: '+35 PTS',
  },
  {
    id: 'EVT-9044',
    time: '09:42:05',
    badge: 'AUDIT_SYNC',
    color: '#7c3aed',
    actor: 'Dimas Wijaya (EMP-089)',
    detail: 'Sertifikasi Kepatuhan SOP ditandatangani secara digital',
    kpi: '+25 PTS',
  },
];

const SIMULATED_POOL = [
  {
    badge: 'HRIS_WEBHOOK',
    color: '#059669',
    actor: 'Alya Putri (EMP-312)',
    detail: 'Sinkronisasi karyawan baru Engineering → Modul Dasar ditugaskan',
    kpi: 'ENROLLED',
  },
  {
    badge: 'QUIZ_PASSED',
    color: '#0284c7',
    actor: 'Bagas Santoso (EMP-147)',
    detail: 'Lulus Evaluasi ISO-27001 dengan skor 90/100',
    kpi: 'VERIFIED',
  },
  {
    badge: 'KPI_LOCKED',
    color: '#0f5132',
    actor: 'Bagas Santoso (EMP-147)',
    detail: 'Poin kompetensi otomatis diteruskan ke payroll & KPI HRIS',
    kpi: '+40 PTS',
  },
];

export default function LandingPage({ onEnterPortal }) {
  const fontSans = "'Plus Jakarta Sans', -apple-system, sans-serif";
  const fontSerif = "'Instrument Serif', Georgia, serif";
  const fontMono = "'JetBrains Mono', monospace";

  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [poolIndex, setPoolIndex] = useState(0);
  const [teamSize, setTeamSize] = useState(120);
  const [activeStage, setActiveStage] = useState(0);

  // Simulasi stream log webhook otomatis setiap 3.2 detik
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      const nextItem = SIMULATED_POOL[poolIndex % SIMULATED_POOL.length];
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 8);
      const newEntry = {
        ...nextItem,
        id: `EVT-${Math.floor(9045 + Math.random() * 900)}`,
        time: timeStr,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 3)]);
      setPoolIndex((prev) => prev + 1);
    }, 3200);

    return () => clearInterval(timer);
  }, [isStreaming, poolIndex]);

  const triggerManualWebhook = () => {
    const now = new Date();
    const manualEvent = {
      id: `EVT-${Math.floor(1000 + Math.random() * 8999)}`,
      time: now.toTimeString().slice(0, 8),
      badge: 'LIVE_TRIGGER',
      color: '#059669',
      actor: 'Demo Juri (EMP-999)',
      detail: 'Simulasi webhook instan berhasil diverifikasi & dikunci ke KPI',
      kpi: '+50 PTS',
    };
    setLogs((prev) => [manualEvent, ...prev.slice(0, 3)]);
  };

  // Kalkulasi penghematan waktu HR untuk kalkulator interaktif
  const savedHoursPerQuarter = Math.round(teamSize * 0.45);
  const accuracyRate = '99.98%';

  const stages = [
    {
      num: '01',
      tag: 'TAHAP 01 / ONBOARDING',
      title: 'Webhook Karyawan Masuk',
      desc: 'Saat HR menambahkan staf baru di HRIS, ID karyawan, jabatan, dan departemen langsung terdaftar otomatis tanpa entri ganda.',
      metric: '< 1.2 detik latensi sinkronisasi',
    },
    {
      num: '02',
      tag: 'TAHAP 02 / EVALUASI',
      title: 'Validasi Skor Kelulusan',
      desc: 'Karyawan wajib lulus kuis evaluasi di atas ambang batas (passing threshold) sebelum modul dinyatakan tuntas secara sah.',
      metric: 'Anti-bypass & tervalidasi sistem',
    },
    {
      num: '03',
      tag: 'TAHAP 03 / PENILAIAN',
      title: 'Distribusi Poin KPI Otomatis',
      desc: 'Bobot poin pelatihan langsung terkunci pada profil kinerja karyawan lengkap dengan stempel waktu siap audit tim HR.',
      metric: '0% selisih rekap akhir kuartal',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', color: '#141413', fontFamily: fontSans }}>
      {/* Top Bar Glassmorphic */}
      <header
        style={{
          borderBottom: '1px solid rgba(20, 20, 19, 0.1)',
          background: 'rgba(246, 245, 241, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#141413',
                color: '#f6f5f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: fontSerif,
                fontSize: '18px',
                fontStyle: 'italic',
              }}
            >
              S
            </div>
            <span style={{ fontWeight: '800', fontSize: '19px', letterSpacing: '-0.03em' }}>
              SyncLearn.
            </span>
            <span
              style={{
                fontFamily: fontMono,
                fontSize: '10px',
                color: '#0f5132',
                background: 'rgba(5, 150, 105, 0.12)',
                padding: '3px 8px',
                borderRadius: '999px',
                fontWeight: '700',
              }}
            >
              PEOPLE OPS & LMS
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '26px', fontSize: '14px' }}>
            <a href="#pipeline" style={{ color: '#4a4741', textDecoration: 'none', fontWeight: '500' }}>
              Pipeline Data
            </a>
            <a href="#perbandingan" style={{ color: '#4a4741', textDecoration: 'none', fontWeight: '500' }}>
              Mengapa SyncLearn
            </a>
            <a href="#kalkulator" style={{ color: '#4a4741', textDecoration: 'none', fontWeight: '500' }}>
              Simulasi ROI
            </a>
            <button
              onClick={onEnterPortal}
              style={{
                padding: '10px 20px',
                background: '#141413',
                color: '#f6f5f1',
                border: 'none',
                borderRadius: '999px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Masuk Workspace →
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Editorial Split: Copywriting + Live Telemetry Console */}
      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '72px 28px 64px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Kolom Kiri: Editorial Headline */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: fontMono,
                fontSize: '11px',
                color: '#0f5132',
                fontWeight: '700',
                background: '#ffffff',
                border: '1px solid #dcd8ce',
                padding: '6px 12px',
                borderRadius: '999px',
                marginBottom: '22px',
                letterSpacing: '0.03em',
              }}
            >
              <span className="live-dot" />
              TERHUBUNG LANGSUNG KE WEBHOOK HRIS PERUSAHAAN
            </div>

            <h1
              style={{
                fontFamily: fontSerif,
                fontSize: 'clamp(44px, 5.4vw, 68px)',
                fontWeight: '400',
                lineHeight: '1.03',
                letterSpacing: '-0.02em',
                margin: '0 0 22px',
                color: '#141413',
              }}
            >
              Pelatihan tim yang langsung tercatat ke{' '}
              <span style={{ fontStyle: 'italic', color: '#059669' }}>rapor KPI</span> karyawan.
            </h1>

            <p
              style={{
                fontSize: '17px',
                lineHeight: '1.65',
                color: '#4a4741',
                margin: '0 0 32px',
                maxWidth: '540px',
              }}
            >
              Tidak ada lagi ekspor CSV setiap akhir kuartal. Karyawan baru otomatis masuk dari
              HRIS, menyelesaikan evaluasi modul, dan poin kinerjanya langsung terkunci siap audit.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={onEnterPortal}
                style={{
                  padding: '15px 30px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Buka Demo Langsung →
              </button>

              <button
                onClick={triggerManualWebhook}
                style={{
                  padding: '14px 20px',
                  background: '#ffffff',
                  color: '#141413',
                  border: '1px solid #d4cfc3',
                  borderRadius: '999px',
                  fontFamily: fontMono,
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ⚡ Uji Webhook Live
              </button>
            </div>

            {/* Metrik Singkat di Bawah CTA */}
            <div
              style={{
                marginTop: '36px',
                paddingTop: '24px',
                borderTop: '1px solid #e2dfd7',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontFamily: fontSerif, fontSize: '30px', color: '#141413' }}>0 dtk</div>
                <div style={{ fontSize: '12px', color: '#6e6a63' }}>Input manual CSV</div>
              </div>
              <div>
                <div style={{ fontFamily: fontSerif, fontSize: '30px', color: '#059669' }}>100%</div>
                <div style={{ fontSize: '12px', color: '#6e6a63' }}>Tervalidasi kuis</div>
              </div>
              <div>
                <div style={{ fontFamily: fontSerif, fontSize: '30px', color: '#141413' }}>Real-time</div>
                <div style={{ fontSize: '12px', color: '#6e6a63' }}>Audit trail KPI</div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Kartu Live Telemetry HRIS-to-KPI */}
          <div
            style={{
              background: '#141413',
              color: '#f6f5f1',
              borderRadius: '18px',
              border: '1px solid #2c2b29',
              boxShadow: '0 28px 60px -15px rgba(20, 20, 19, 0.22)',
              overflow: 'hidden',
            }}
          >
            {/* Header Terminal */}
            <div
              style={{
                padding: '14px 20px',
                background: '#1c1b19',
                borderBottom: '1px solid #2c2b29',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontFamily: fontMono, fontSize: '11px', color: '#a8a29e', marginLeft: '8px' }}>
                  synclearn-webhook-stream
                </span>
              </div>

              <button
                onClick={() => setIsStreaming(!isStreaming)}
                style={{
                  background: isStreaming ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255,255,255,0.08)',
                  color: isStreaming ? '#34d399' : '#d6d3d1',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontFamily: fontMono,
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                {isStreaming ? '● LIVE STREAM' : '❚❚ PAUSED'}
              </button>
            </div>

            {/* Daftar Log Real-Time */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: idx === 0 ? 'rgba(5, 150, 105, 0.14)' : '#1c1b19',
                    border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid #292826',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                      fontFamily: fontMono,
                      fontSize: '11px',
                    }}
                  >
                    <span
                      style={{
                        background: item.color,
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '700',
                        fontSize: '10px',
                      }}
                    >
                      {item.badge}
                    </span>
                    <span style={{ color: '#a8a29e' }}>
                      {item.id} • {item.time}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '3px' }}>
                    {item.actor}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#d6d3d1', lineHeight: '1.4' }}>
                      {item.detail}
                    </span>
                    <span
                      style={{
                        fontFamily: fontMono,
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#34d399',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.kpi}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Console */}
            <div
              style={{
                padding: '12px 20px',
                background: '#191816',
                borderTop: '1px solid #2c2b29',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: fontMono,
                fontSize: '11px',
                color: '#a8a29e',
              }}
            >
              <span>ENDPOINT: POST /api/webhooks/hris</span>
              <span style={{ color: '#34d399' }}>200 OK</span>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Ledger Interaktif di Bawah Hero */}
        <div
          id="pipeline"
          style={{
            marginTop: '72px',
            background: '#ffffff',
            border: '1px solid #dcd8ce',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 30px -15px rgba(20, 20, 19, 0.08)',
          }}
        >
          <div
            style={{
              padding: '14px 24px',
              background: '#efede7',
              borderBottom: '1px solid #dcd8ce',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: fontMono,
              fontSize: '11px',
              color: '#5c5852',
            }}
          >
            <span>ARSITEKTUR ALUR DATA — HRIS_TO_KPI_PIPELINE</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f5132', fontWeight: '700' }}>
              <span className="live-dot" />
              STATUS: AKTIF
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {stages.map((stage, idx) => {
              const isSelected = activeStage === idx;
              return (
                <div
                  key={stage.num}
                  onMouseEnter={() => setActiveStage(idx)}
                  className="editorial-card"
                  style={{
                    padding: '30px',
                    borderTop: 'none',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: idx < 2 ? '1px solid #ebe8e0' : 'none',
                    background: isSelected ? '#fafaf7' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fontMono,
                        fontSize: '11px',
                        color: isSelected ? '#059669' : '#858077',
                        fontWeight: '700',
                      }}
                    >
                      {stage.tag}
                    </span>
                    <span
                      style={{
                        fontFamily: fontSerif,
                        fontSize: '24px',
                        color: isSelected ? '#059669' : '#c7c2b8',
                      }}
                    >
                      {stage.num}
                    </span>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                    {stage.title}
                  </div>
                  <p style={{ fontSize: '14px', color: '#5c5852', lineHeight: '1.6', margin: '0 0 16px' }}>
                    {stage.desc}
                  </p>
                  <div
                    style={{
                      display: 'inline-block',
                      fontFamily: fontMono,
                      fontSize: '11px',
                      color: '#0f5132',
                      background: 'rgba(5, 150, 105, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                    }}
                  >
                    ✓ {stage.metric}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabel Perbandingan Cara Lama vs SyncLearn */}
      <section id="perbandingan" style={{ maxWidth: '1180px', margin: '0 auto', padding: '40px 28px 64px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontFamily: fontMono, fontSize: '11px', color: '#059669', fontWeight: '700' }}>
            ANALISIS EFISIENSI OPERASIONAL
          </span>
          <h2 style={{ fontFamily: fontSerif, fontSize: '38px', fontWeight: '400', margin: '6px 0 8px' }}>
            Mengapa tim HR beralih dari rekap manual
          </h2>
          <p style={{ color: '#5c5852', fontSize: '15px', margin: 0 }}>
            Perbandingan alur kerja operasional pelatihan sebelum dan sesudah integrasi.
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dcd8ce',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr
                style={{
                  background: '#efede7',
                  borderBottom: '1px solid #dcd8ce',
                  fontFamily: fontMono,
                  fontSize: '11px',
                  color: '#5c5852',
                }}
              >
                <th style={{ padding: '16px 24px' }}>PROSES OPERASIONAL</th>
                <th style={{ padding: '16px 24px' }}>CARA MANUAL (SPREADSHEET)</th>
                <th style={{ padding: '16px 24px', color: '#0f5132' }}>DENGAN SYNCLEARN</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ebe8e0' }}>
                <td style={{ padding: '18px 24px', fontWeight: '600' }}>Pembuatan Akun Karyawan Baru</td>
                <td style={{ padding: '18px 24px', color: '#6e6a63' }}>
                  Admin HR menyalin nama & email satu per satu
                </td>
                <td style={{ padding: '18px 24px', fontWeight: '600', color: '#0f5132' }}>
                  ✓ Otomatis via webhook HRIS dalam hitungan detik
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ebe8e0' }}>
                <td style={{ padding: '18px 24px', fontWeight: '600' }}>Validasi Kelulusan Materi</td>
                <td style={{ padding: '18px 24px', color: '#6e6a63' }}>
                  Hanya sekadar centang "sudah baca" tanpa uji pemahaman
                </td>
                <td style={{ padding: '18px 24px', fontWeight: '600', color: '#0f5132' }}>
                  ✓ Terkunci kuis evaluasi dengan standar skor minimum
                </td>
              </tr>
              <tr>
                <td style={{ padding: '18px 24px', fontWeight: '600' }}>Perhitungan Poin KPI Kuartalan</td>
                <td style={{ padding: '18px 24px', color: '#6e6a63' }}>
                  Rekap manual rawan selisih di akhir periode
                </td>
                <td style={{ padding: '18px 24px', fontWeight: '600', color: '#0f5132' }}>
                  ✓ Tercatat real-time lengkap dengan stempel waktu
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Kalkulator Simulasi Dampak HR (Nilai Tambah untuk Juri Lomba) */}
      <section id="kalkulator" style={{ maxWidth: '1180px', margin: '0 auto', padding: '16px 28px 84px' }}>
        <div
          style={{
            background: '#141413',
            color: '#f6f5f1',
            borderRadius: '18px',
            padding: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontFamily: fontMono, fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
              SIMULATOR DAMPAK OPERASIONAL
            </span>
            <h3 style={{ fontFamily: fontSerif, fontSize: '34px', fontWeight: '400', margin: '8px 0 12px' }}>
              Hitung efisiensi waktu tim HR Anda
            </h3>
            <p style={{ color: '#a8a29e', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
              Geser jumlah karyawan di perusahaan untuk melihat estimasi jam kerja administratif yang
              dihemat setiap kuartal berkat otomatisasi SyncLearn.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: fontMono, fontSize: '12px', color: '#d6d3d1' }}>
                JUMLAH KARYAWAN AKTIF
              </span>
              <span style={{ fontFamily: fontMono, fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
                {teamSize} Karyawan
              </span>
            </div>

            <input
              type="range"
              min="25"
              max="1000"
              step="25"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: '#1f1e1c',
                border: '1px solid #2e2d2a',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div style={{ fontFamily: fontMono, fontSize: '11px', color: '#a8a29e', marginBottom: '6px' }}>
                WAKTU DIHEMAT / KUARTAL
              </div>
              <div style={{ fontFamily: fontSerif, fontSize: '42px', color: '#34d399' }}>
                {savedHoursPerQuarter} Jam
              </div>
              <div style={{ fontSize: '12px', color: '#a8a29e', marginTop: '4px' }}>
                Bebas rekap & validasi manual
              </div>
            </div>

            <div
              style={{
                background: '#1f1e1c',
                border: '1px solid #2e2d2a',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div style={{ fontFamily: fontMono, fontSize: '11px', color: '#a8a29e', marginBottom: '6px' }}>
                AKURASI AUDIT KPI
              </div>
              <div style={{ fontFamily: fontSerif, fontSize: '42px', color: '#ffffff' }}>
                {accuracyRate}
              </div>
              <div style={{ fontSize: '12px', color: '#a8a29e', marginTop: '4px' }}>
                Terkunci bukti kelulusan kuis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2dfd7', padding: '28px' }}>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#6e6a63',
          }}
        >
          <span>SyncLearn — Internal Learning & HRIS Synchronization</span>
          <button
            onClick={onEnterPortal}
            style={{
              background: 'none',
              border: 'none',
              color: '#141413',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Masuk ke Aplikasi →
          </button>
        </div>
      </footer>
    </div>
  );
}