import { useState, useEffect } from 'react';
import { apiPost } from '../api';
import { useApp, showToast } from '../App';

const fields = [
  { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
  { id: 'age', label: 'Age', type: 'number', def: 21 },
  { id: 'degree', label: 'Degree', type: 'select', options: ['BTech', 'MTech', 'BSc', 'MSc', 'BCA', 'MCA', 'MBA'] },
  { id: 'branch', label: 'Branch', type: 'select', options: ['CS', 'IT', 'ECE', 'EEE', 'Mech', 'Civil', 'Other'] },
  { id: 'cgpa', label: 'CGPA', type: 'number', step: 0.1, def: 7.5 },
  { id: 'backlogs', label: 'Backlogs', type: 'number', def: 0 },
  { id: 'internships', label: 'Internships', type: 'number', def: 1 },
  { id: 'certifications', label: 'Certifications', type: 'number', def: 2 },
  { id: 'codingSkills', label: 'Coding Skills (1-10)', type: 'number', def: 7 },
  { id: 'communicationSkills', label: 'Communication (1-10)', type: 'number', def: 6 },
  { id: 'aptitudeScore', label: 'Aptitude Score', type: 'number', def: 75 },
  { id: 'projects', label: 'Projects', type: 'number', def: 3 },
];

const CACHE_KEY = 'xai_analysis_cache';

function getFormData(form) {
  return {
    gender: form.gender, age: parseInt(form.age), degree: form.degree, branch: form.branch,
    cgpa: parseFloat(form.cgpa), backlogs: parseInt(form.backlogs), internships: parseInt(form.internships),
    certifications: parseInt(form.certifications), codingSkills: parseInt(form.codingSkills),
    communicationSkills: parseInt(form.communicationSkills), aptitudeScore: parseInt(form.aptitudeScore),
    projects: parseInt(form.projects),
  };
}

function inputsMatch(a, b) {
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function Dashboard() {
  const { analysisData, setAnalysisData, setPage, user } = useApp();

  // Load cached form values
  const [form, setForm] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached?.inputs && cached.userId === user?.userId) return cached.inputs;
    } catch {}
    const f = {};
    fields.forEach(fi => { f[fi.id] = fi.def ?? (fi.options ? fi.options[0] : ''); });
    return f;
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cacheUsed, setCacheUsed] = useState(false);

  // On mount, restore cached analysis if available
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && cached.userId === user?.userId && cached.data?.predict) {
        setAnalysisData(cached.data);
        setResult(cached.data.predict);
        setCacheUsed(true);
      }
    } catch {}
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function doAnalysis() {
    const fd = getFormData(form);

    // Check if inputs match cached inputs — if so, show cached results
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && cached.userId === user?.userId && inputsMatch(cached.formData, fd) && cached.data?.predict) {
        setAnalysisData(cached.data);
        setResult(cached.data.predict);
        setCacheUsed(true);
        showToast('📋 No changes detected — showing cached results.');
        return;
      }
    } catch {}

    setLoading(true); setError(''); setCacheUsed(false);
    const [p, e, s] = await Promise.all([
      apiPost('/predict', fd).catch(err => ({ error: err.message })),
      apiPost('/explain', fd).catch(err => ({ error: err.message })),
      apiPost('/study-plan', fd).catch(err => ({ error: err.message })),
    ]);
    const newData = { predict: p, explain: e, plan: s };
    setAnalysisData(newData);
    if (!p.error) {
      setResult(p);
      // Cache the results with form data for comparison
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        userId: user?.userId,
        inputs: form,
        formData: fd,
        data: newData,
        timestamp: Date.now(),
      }));
    } else {
      setError(p.error);
    }
    setLoading(false);
    showToast('🎯 Full analysis complete! Check all tabs.');
  }

  const circumference = 2 * Math.PI * 65;

  return (
    <>
      <h1>Placement Dashboard</h1>
      <p className="subtitle">Enter your academic profile to check your placement readiness and get personalized insights.</p>

      <form className="card" onSubmit={e => { e.preventDefault(); doAnalysis(); }}>
        <div className="form-grid">
          {fields.map(fi => (
            <div className="form-group" key={fi.id}>
              <label>{fi.label}</label>
              {fi.type === 'select' ? (
                <select value={form[fi.id]} onChange={e => set(fi.id, e.target.value)}>
                  {fi.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type="number" step={fi.step || 1} value={form[fi.id]} onChange={e => set(fi.id, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '.7rem 2rem', fontSize: '1rem' }}>
            {loading ? <><span className="spinner" /> Analyzing…</> : '🚀 Analyze My Profile'}
          </button>
          {cacheUsed && (
            <span style={{ fontSize: '.8rem', color: 'var(--accent-2)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              ✓ Showing cached results — change values to re-analyze
            </span>
          )}
        </div>
      </form>

      {error && <div className="card" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Error: {error}</div>}

      {result && !result.error && (() => {
        const prob = (result.placement_probability * 100).toFixed(1);
        const offset = circumference * (1 - result.placement_probability);
        const gc = result.placement_probability > .7 ? 'var(--green)' : result.placement_probability > .4 ? 'var(--yellow)' : 'var(--red)';
        return (
          <div style={{ animation: 'fadeIn .4s ease' }}>
            <div className="gauge-wrap">
              <div className="gauge">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle className="gauge-bg" cx="80" cy="80" r="65" />
                  <circle className="gauge-fill" cx="80" cy="80" r="65" stroke={gc} strokeDasharray={circumference} strokeDashoffset={offset} />
                </svg>
                <div className="gauge-label">
                  <div className="gauge-value" style={{ color: gc }}>{prob}%</div>
                  <div className="gauge-sub">Placement</div>
                </div>
              </div>
            </div>
            <div className="result-grid">
              <div className="stat-card"><div className={`value ${result.placed ? 'placed-yes' : 'placed-no'}`}>{result.placed ? '✅ Placed' : '❌ Not Placed'}</div><div className="label">Prediction</div></div>
              <div className={`stat-card risk-${result.risk_level}`}><div className="value">{result.risk_level.toUpperCase()}</div><div className="label">Risk Level</div></div>
              <div className="stat-card"><div className="value" style={{ color: 'var(--green)' }}>₹{result.predicted_package.toFixed(2)} LPA</div><div className="label">Est. Package</div></div>
              <div className="stat-card"><div className="value" style={{ color: 'var(--accent)' }}>{(result.confidence * 100).toFixed(0)}%</div><div className="label">Confidence</div></div>
            </div>
            <div className="card" style={{ textAlign: 'center', borderColor: 'var(--accent)' }}>
              <p style={{ color: 'var(--accent-2)', margin: 0 }}>✅ Analysis ready — visit <strong style={{ cursor: 'pointer' }} onClick={() => setPage('explain')}>Analysis</strong> and <strong style={{ cursor: 'pointer' }} onClick={() => setPage('plan')}>Study Plan</strong> tabs.</p>
            </div>
          </div>
        );
      })()}
    </>
  );
}
