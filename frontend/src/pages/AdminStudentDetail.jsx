import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../api';
import { useApp, showToast } from '../App';

export default function AdminStudentDetail() {
  const { detailUserId, detailUserName, setPage } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { if (detailUserId) load(); }, [detailUserId]);

  async function load() {
    try { setData(await apiGet('/admin/students/' + detailUserId + '/study-plan')); } catch (e) { setError(e.message); }
  }

  async function markPlaced(placed) {
    try {
      await apiPut('/admin/students/' + detailUserId + '/mark-placed', { placed });
      showToast(placed ? '✅ Marked as placed' : '↩️ Placement removed');
      load();
    } catch (e) { showToast('❌ ' + e.message); }
  }

  if (error) return <div className="card" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Error: {error}</div>;
  if (!data) return <p style={{ color: 'var(--text-dim)' }}>Loading {detailUserName}…</p>;

  const prob = data.placementProbability != null ? (data.placementProbability * 100).toFixed(1) : 'N/A';
  const isPlaced = data.isPlaced === true;

  let strengths = [], weaknesses = [], planItems = [];
  try { strengths = JSON.parse(data.topStrengthsJson || '[]'); } catch {}
  try { weaknesses = JSON.parse(data.topWeaknessesJson || '[]'); } catch {}
  try { planItems = JSON.parse(data.studyPlanJson || '[]'); } catch {}

  return (
    <>
      <button className="btn btn-outline" onClick={() => setPage('admin-all')} style={{ marginBottom: '1rem' }}>← Back to Students</button>
      <h1>{data.studentName}</h1>
      <p className="subtitle">{data.studentEmail}{data.studentPhone ? ' • ' + data.studentPhone : ''}</p>

      {/* Placement Status Banner */}
      <div style={{ padding: '.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontWeight: 700, textAlign: 'center', fontSize: '1rem', background: isPlaced ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.12)', color: isPlaced ? 'var(--green)' : 'var(--red)', border: `1px solid ${isPlaced ? 'var(--green)' : 'var(--red)'}` }}>
        {isPlaced ? '✅ PLACED' : '❌ NOT PLACED'}
      </div>

      <div className="result-grid">
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent-2)' }}>{prob}%</div><div className="label">Placement Prob</div></div>
        <div className={`stat-card risk-${data.riskLevel || ''}`}><div className="value">{(data.riskLevel || 'N/A').toUpperCase()}</div><div className="label">Risk Level</div></div>
        <div className="stat-card"><div className="value" style={{ color: data.placed ? 'var(--green)' : 'var(--red)' }}>{data.placed ? '✅ Yes' : '❌ No'}</div><div className="label">ML Prediction</div></div>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>💪 Strengths</h2>
            {strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .7rem', background: 'rgba(34,197,94,0.08)', borderRadius: 8, marginBottom: '.35rem' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span><span style={{ fontSize: '.88rem' }}>{s}</span>
              </div>
            ))}
            {!strengths.length && <p style={{ color: 'var(--text-dim)' }}>None</p>}
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>⚠️ Weaknesses</h2>
            {weaknesses.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .7rem', background: 'rgba(244,63,94,0.08)', borderRadius: 8, marginBottom: '.35rem' }}>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗</span><span style={{ fontSize: '.88rem' }}>{w}</span>
              </div>
            ))}
            {!weaknesses.length && <p style={{ color: 'var(--text-dim)' }}>None</p>}
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>📋 Study Plan</h2>
        {planItems.map((item, i) => (
          <div className={`plan-item ${item.priority}`} key={i}>
            <div className="pi-header"><span className="pi-title">{item.title}</span><span className="pi-badge">{item.priority}</span></div>
            <div className="pi-desc">{item.description}</div>
            <div className="pi-meta">
              <span>Current: <strong>{item.current_value}</strong></span>
              <span>Target: <strong>{item.target_value}</strong></span>
              <span>Impact: {item.estimated_impact?.toFixed(3) || 'N/A'}</span>
            </div>
          </div>
        ))}
        {!planItems.length && <p style={{ color: 'var(--text-dim)' }}>No study plan generated yet.</p>}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        {isPlaced ? (
          <button className="btn btn-outline" onClick={() => markPlaced(false)} style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>❌ Remove Placement</button>
        ) : (
          <button className="btn btn-primary" onClick={() => markPlaced(true)} style={{ background: 'var(--green)', borderColor: 'var(--green)' }}>✅ Mark as Placed</button>
        )}
        <a href={`mailto:${data.studentEmail}?subject=Placement Update - XAI StudyMate`} className="btn btn-outline">📧 Send Email</a>
        {data.studentPhone && <a href={`tel:${data.studentPhone}`} className="btn btn-outline">📞 Call</a>}
      </div>
    </>
  );
}
