import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin, onBackHome }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fontSans = "'Plus Jakarta Sans', -apple-system, sans-serif";
  const fontSerif = "'Instrument Serif', Georgia, serif";
  const fontMono = "'JetBrains Mono', monospace";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        setError('Gagal terhubung ke server backend. Pastikan server port 5000 aktif.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f5f1', color: '#141413', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: fontSans }}>
      <div style={{ width: '100%', maxWidth: '460px', background: '#ffffff', padding: '36px', borderRadius: '14px', border: '1px solid #dcd8ce' }}>
        {onBackHome && (
          <button
            onClick={onBackHome}
            style={{ background: 'none', border: 'none', color: '#6e6a63', fontSize: '13px', padding: 0, marginBottom: '22px', cursor: 'pointer', fontWeight: '500' }}
          >
            ← Kembali ke Beranda
          </button>
        )}

        <h1 style={{ fontFamily: fontSerif, margin: '0 0 8px', fontSize: '36px', fontWeight: '400', lineHeight: '1.1' }}>
          Pilih Akun Workspace
        </h1>
        <p style={{ margin: '0 0 24px', color: '#5c5852', fontSize: '14px', lineHeight: '1.5' }}>
          Akun di bawah ini disinkronkan langsung dari direktori HRIS perusahaan.
        </p>

        {loading && <p style={{ color: '#6e6a63', fontSize: '14px' }}>Memuat direktori...</p>}
        {error && <p style={{ color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map((user) => (
            <button
              key={user.user_id}
              onClick={() => onLogin(user)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 18px',
                background: '#faf9f6',
                border: '1px solid #dcd8ce',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#141413' }}>{user.full_name}</div>
                <div style={{ fontFamily: fontMono, fontSize: '11px', color: '#6e6a63', marginTop: '3px' }}>
                  {user.hris_user_id} • {user.department || 'General'}
                </div>
              </div>
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: user.role === 'admin' ? '#141413' : '#ecfdf5',
                  color: user.role === 'admin' ? '#f6f5f1' : '#0f5132',
                  textTransform: 'uppercase',
                }}
              >
                {user.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}