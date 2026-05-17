import { useState, useEffect } from 'react';
import { apiGet } from '../api';

export default function ModelInfo() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try { setData(await apiGet('/model-info')); } catch (e) { setError(e.message); }
  }

  if (error) return <div className="card" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Error: {error}</div>;
  if (!data) return <p style={{ color: 'var(--text-dim)' }}>Loading model info…</p>;

  return (
    <>
      <h1>ML Model Information</h1>
      <p className="subtitle">Details about the trained placement prediction model.</p>
      <div className="result-grid">
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent-2)' }}>{data.model_type || 'Random Forest'}</div><div className="label">Model</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--green)' }}>{data.accuracy ? (data.accuracy * 100).toFixed(1) + '%' : 'N/A'}</div><div className="label">Accuracy</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent)' }}>{data.features?.length || 'N/A'}</div><div className="label">Features</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--yellow)' }}>{data.training_samples || 'N/A'}</div><div className="label">Training Samples</div></div>
      </div>
      {data.features && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Features</h2>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {data.features.map(f => (
              <span key={f} style={{ background: 'var(--surface-2)', padding: '.25rem .6rem', borderRadius: 20, fontSize: '.8rem', color: 'var(--text-dim)' }}>{f}</span>
            ))}
          </div>
        </div>
      )}
      {data.metrics && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Classification Metrics</h2>
          <div className="result-grid">
            {Object.entries(data.metrics).map(([k, v]) => (
              <div className="stat-card" key={k}><div className="value" style={{ fontSize: '1.1rem' }}>{typeof v === 'number' ? v.toFixed(4) : v}</div><div className="label">{k}</div></div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
