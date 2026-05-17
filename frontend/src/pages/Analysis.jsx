import { useApp } from '../App';

export default function Analysis() {
  const { analysisData } = useApp();
  const data = analysisData.explain;

  if (!data || data.error) return (
    <>
      <h1>Profile Analysis</h1>
      <p className="subtitle">Understand how each factor influences your placement outcome.</p>
      <p style={{ color: 'var(--text-dim)' }}>Run <strong>Analyze My Profile</strong> on the Dashboard tab first.</p>
    </>
  );

  const maxAbs = Math.max(...data.explanations.map(e => Math.abs(e.shap_value)), 0.001);
  const sorted = [...data.explanations].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  return (
    <>
      <h1>Profile Analysis</h1>
      <p className="subtitle">Understand how each factor influences your placement outcome.</p>

      <div className="result-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card"><div className={`value ${data.placed ? 'placed-yes' : 'placed-no'}`}>{data.placed ? '✅ Placed' : '❌ Not Placed'}</div><div className="label">Prediction</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent-2)' }}>{(data.placement_probability * 100).toFixed(1)}%</div><div className="label">Probability</div></div>
        <div className={`stat-card risk-${data.risk_level}`}><div className="value">{data.risk_level.toUpperCase()}</div><div className="label">Risk</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
          <h2 style={{ margin: 0 }}>Feature Impact Analysis</h2>
          <span style={{ fontSize: '.7rem', color: 'var(--text-dim)', background: 'var(--surface-2)', padding: '.2rem .6rem', borderRadius: 20 }}>SHAP Values</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', marginBottom: '1rem' }}>
          Each bar shows contribution towards (<span style={{ color: 'var(--green)' }}>helps</span>) or against (<span style={{ color: 'var(--red)' }}>hurts</span>) placement.
        </p>
        {sorted.map((e, i) => {
          const pct = (Math.abs(e.shap_value) / maxAbs * 100).toFixed(1);
          const isPos = e.impact === 'positive';
          const color = isPos ? '#22c55e' : '#f43f5e';
          const bg = isPos ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)';
          return (
            <div key={e.feature} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.6rem .75rem', background: bg, borderRadius: 8, marginBottom: '.35rem', borderLeft: `3px solid ${color}`, animation: `fadeIn .3s ease ${i * 0.04}s both` }}>
              <span style={{ minWidth: 130, fontWeight: 600, fontSize: '.85rem' }}>{e.display_name}</span>
              <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 4, height: 18, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .6s ease' }} />
              </div>
              <span style={{ minWidth: 90, textAlign: 'right', fontWeight: 700, fontSize: '.82rem', color }}>{isPos ? '▲ +' : '▼ −'}{Math.abs(e.shap_value).toFixed(4)}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>💪 Strengths</h2>
          {data.top_strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .7rem', background: 'rgba(34,197,94,0.08)', borderRadius: 8, marginBottom: '.35rem' }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span><span style={{ fontSize: '.88rem' }}>{s}</span>
            </div>
          ))}
          {!data.top_strengths.length && <p style={{ color: 'var(--text-dim)' }}>None identified</p>}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>📈 Areas to Improve</h2>
          {data.top_weaknesses.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .7rem', background: 'rgba(244,63,94,0.08)', borderRadius: 8, marginBottom: '.35rem' }}>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗</span><span style={{ fontSize: '.88rem' }}>{w}</span>
            </div>
          ))}
          {!data.top_weaknesses.length && <p style={{ color: 'var(--text-dim)' }}>None identified</p>}
        </div>
      </div>
    </>
  );
}
