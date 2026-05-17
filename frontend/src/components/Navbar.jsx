import { useApp } from '../App';

export default function Navbar() {
  const { user, page, setPage, logout, isAdmin } = useApp();
  if (!user) return null;

  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const studentTabs = [
    { id: 'predict', label: '📊 Dashboard' },
    { id: 'explain', label: '🧠 Analysis' },
    { id: 'plan', label: '📋 Study Plan' },
    { id: 'chat', label: '💬 Tutor' },
    { id: 'profile', label: '👤 Profile' },
  ];

  const adminTabs = [
    { id: 'admin-overview', label: '📊 Overview' },
    { id: 'admin-atrisk', label: '⚠️ At-Risk' },
    { id: 'admin-all', label: '👥 Students' },
    { id: 'model', label: '🤖 ML Model' },
  ];

  const tabs = isAdmin ? adminTabs : studentTabs;

  return (
    <nav>
      <div className="logo">🎓 XAI StudyMate</div>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={page === t.id ? 'active' : ''} onClick={() => setPage(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="user-info">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: '#fff' }}>
            {initials}
          </div>
        )}
        <span style={{ fontWeight: 500 }}>{user.fullName}</span>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
