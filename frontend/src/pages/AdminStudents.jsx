import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../api';
import { useApp, showToast } from '../App';

export default function AdminStudents({ mode }) {
  const { viewStudent } = useApp();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [mode]);

  async function load() {
    try {
      if (mode === 'atrisk') {
        setStudents(await apiGet('/admin/at-risk'));
      } else {
        const d = await apiGet('/admin/dashboard');
        setStudents(d.students || []);
      }
    } catch (e) { setError(e.message); }
  }

  async function togglePlaced(id, placed) {
    try {
      await apiPut('/admin/students/' + id + '/mark-placed', { placed });
      showToast(placed ? '✅ Marked as placed' : '↩️ Placement removed');
      load();
    } catch (e) { showToast('❌ ' + e.message); }
  }

  if (error) return <div className="card" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Error: {error}</div>;

  if (mode === 'atrisk') {
    return (
      <>
        <h1>At-Risk Students</h1>
        <p className="subtitle">Students with placement probability below 50%.</p>
        {!students.length && (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--green)', fontSize: '1.2rem', fontWeight: 700 }}>✅ No at-risk students!</p>
            <p style={{ color: 'var(--text-dim)' }}>All students have probability above 50%.</p>
          </div>
        )}
        {students.map(s => {
          const prob = s.lastPlacementProb != null ? (s.lastPlacementProb * 100).toFixed(1) : '0';
          const risk = s.lastRiskLevel || 'unknown';
          const rc = { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--yellow)' }[risk] || 'var(--red)';
          return (
            <div className="card" key={s.id} style={{ borderLeft: `4px solid ${rc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.fullName}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>{s.email}{s.phone ? ' • ' + s.phone : ''}</div>
                  <div style={{ marginTop: '.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ color: rc, fontWeight: 700 }}>{prob}% placement</span>
                    <span style={{ color: rc, fontWeight: 600, textTransform: 'uppercase', fontSize: '.85rem' }}>{risk} risk</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => viewStudent(s.id, s.fullName)} style={{ fontSize: '.8rem', padding: '.4rem .8rem' }}>📋 View Details</button>
                  <a href={`mailto:${s.email}?subject=Placement Support - XAI StudyMate`} className="btn btn-outline" style={{ fontSize: '.8rem', padding: '.4rem .8rem' }}>📧 Email</a>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  // All Students table
  return (
    <>
      <h1>All Students</h1>
      <p className="subtitle">Complete list of registered students with placement data.</p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-dim)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              <th style={{ padding: '.6rem .5rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '.6rem .5rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '.6rem .5rem', textAlign: 'center' }}>Prob</th>
              <th style={{ padding: '.6rem .5rem', textAlign: 'center' }}>Risk</th>
              <th style={{ padding: '.6rem .5rem', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '.6rem .5rem', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const prob = s.lastPlacementProb != null ? (s.lastPlacementProb * 100).toFixed(1) + '%' : '—';
              const risk = s.lastRiskLevel || '—';
              const rc = { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--yellow)', low: 'var(--green)', minimal: 'var(--green)' }[risk] || 'var(--text-dim)';
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '.6rem .5rem', fontWeight: 600 }}>{s.fullName}</td>
                  <td style={{ padding: '.6rem .5rem', color: 'var(--text-dim)' }}>{s.email}</td>
                  <td style={{ padding: '.6rem .5rem', textAlign: 'center', color: 'var(--accent-2)', fontWeight: 600 }}>{prob}</td>
                  <td style={{ padding: '.6rem .5rem', textAlign: 'center', color: rc, fontWeight: 600 }}>{risk !== '—' ? risk.toUpperCase() : '—'}</td>
                  <td style={{ padding: '.6rem .5rem', textAlign: 'center' }}>
                    <span style={{ color: s.isPlaced ? 'var(--green)' : 'var(--text-dim)', fontWeight: 700, cursor: 'pointer' }} onClick={() => togglePlaced(s.id, !s.isPlaced)} title="Click to toggle">
                      {s.isPlaced ? '✅ Placed' : '➖ Not Placed'}
                    </span>
                  </td>
                  <td style={{ padding: '.6rem .5rem', textAlign: 'center' }}>
                    <button className="btn btn-outline" onClick={() => viewStudent(s.id, s.fullName)} style={{ fontSize: '.75rem', padding: '.25rem .6rem' }}>View</button>
                  </td>
                </tr>
              );
            })}
            {!students.length && <tr><td colSpan={6} style={{ padding: '1rem', color: 'var(--text-dim)', textAlign: 'center' }}>No students yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
