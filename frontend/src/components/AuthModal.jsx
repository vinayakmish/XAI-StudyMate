import { useState } from 'react';
import { apiPost } from '../api';
import { useApp, showToast } from '../App';

export default function AuthModal({ onClose }) {
  const { login } = useApp();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleLogin() {
    setError(''); setLoading(true);
    try {
      const data = await apiPost('/auth/login', { email: form.email, password: form.password });
      login(data, data.token);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function handleRegister() {
    setError(''); setLoading(true);
    try {
      const data = await apiPost('/auth/register', { fullName: form.fullName, email: form.email, password: form.password, phone: form.phone });
      login(data, data.token);
      showToast('🎉 Welcome to XAI StudyMate!');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left branding panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 30% 70%, rgba(45,212,191,0.2), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>🎓 XAI StudyMate</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, marginBottom: '1.5rem' }}>
            Your AI-Powered Placement Readiness Companion
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['🔮 Predict placement probability with ML', '🧠 Understand factors with SHAP analysis', '📋 Get personalized 8-week study plans', '📥 Download professional PDF reports'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: 'rgba(255,255,255,0.85)', fontSize: '.95rem' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>}
          </div>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '.9rem' }}>
            {mode === 'login' ? 'Sign in to access your dashboard and analytics.' : 'Join thousands of students preparing smarter.'}
          </p>

          {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '.6rem .85rem', color: 'var(--red)', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</div>}

          {mode === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '.75rem' }}>
              <div className="form-group"><label>Full Name</label><input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Doe" /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765..." /></div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '.75rem' }}>
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@university.edu" style={{ padding: '.7rem .85rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" style={{ padding: '.7rem .85rem' }}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '.75rem', fontSize: '1rem' }} onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
            {loading ? <><span className="spinner" /> Working…</> : mode === 'login' ? '→ Sign In' : '→ Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.9rem', color: 'var(--text-dim)' }}>
            {mode === 'login' ? (
              <>Don't have an account? <span style={{ color: 'var(--accent-2)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('register'); setError(''); }}>Register</span></>
            ) : (
              <>Already have an account? <span style={{ color: 'var(--accent-2)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('login'); setError(''); }}>Sign In</span></>
            )}
          </div>

          {mode === 'login' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Demo Credentials</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-dim)' }}>
                Admin: <code style={{ color: 'var(--accent-2)' }}>admin@xaistudymate.com</code> / <code style={{ color: 'var(--accent-2)' }}>admin123</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
