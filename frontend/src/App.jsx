import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import LearnerDashboard from './pages/LearnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [showPortal, setShowPortal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Kunci unik agar animasi transisi otomatis berjalan setiap halaman berganti
  const viewKey = !showPortal
    ? 'landing'
    : !currentUser
      ? 'login'
      : `dashboard-${currentUser.user_id}`;

  return (
    <div key={viewKey} className="page-transition-wrapper">
      {!showPortal ? (
        <LandingPage onEnterPortal={() => setShowPortal(true)} />
      ) : !currentUser ? (
        <Login
          onLogin={(user) => setCurrentUser(user)}
          onBackHome={() => setShowPortal(false)}
        />
      ) : currentUser.role === 'admin' ? (
        <AdminDashboard
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      ) : (
        <LearnerDashboard
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      )}
    </div>
  );
}