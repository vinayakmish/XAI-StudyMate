import { useState, useEffect } from 'react';
import { apiGet } from '../api';
import { useApp } from '../App';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function AdminOverview() {
  const { viewStudent } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try { setData(await apiGet('/admin/dashboard')); } catch (e) { setError(e.message); }
  }

  if (error) return <div className="card" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Error: {error}</div>;
  if (!data) return <p style={{ color: 'var(--text-dim)' }}>Loading dashboard…</p>;

  const students = data.students || [];
  const atRisk = students.filter(s => s.lastPlacementProb != null && s.lastPlacementProb < 0.5);
  const placed = students.filter(s => s.isPlaced);
  const analyzed = students.filter(s => s.totalPredictions > 0);

  // Risk distribution for doughnut
  const riskCounts = { critical: 0, high: 0, medium: 0, low: 0, minimal: 0, 'not analyzed': 0 };
  students.forEach(s => {
    if (!s.lastRiskLevel) riskCounts['not analyzed']++;
    else riskCounts[s.lastRiskLevel] = (riskCounts[s.lastRiskLevel] || 0) + 1;
  });

  const doughnutData = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Minimal', 'Not Analyzed'],
    datasets: [{
      data: [riskCounts.critical, riskCounts.high, riskCounts.medium, riskCounts.low, riskCounts.minimal, riskCounts['not analyzed']],
      backgroundColor: ['#f43f5e', '#f97316', '#f59e0b', '#22c55e', '#2dd4bf', '#475569'],
      borderColor: '#1e293b', borderWidth: 2,
    }],
  };

  // Probability distribution for bar chart
  const probBuckets = { '0-20%': 0, '20-40%': 0, '40-60%': 0, '60-80%': 0, '80-100%': 0 };
  students.forEach(s => {
    if (s.lastPlacementProb == null) return;
    const p = s.lastPlacementProb * 100;
    if (p < 20) probBuckets['0-20%']++;
    else if (p < 40) probBuckets['20-40%']++;
    else if (p < 60) probBuckets['40-60%']++;
    else if (p < 80) probBuckets['60-80%']++;
    else probBuckets['80-100%']++;
  });

  const barData = {
    labels: Object.keys(probBuckets),
    datasets: [{
      label: 'Students',
      data: Object.values(probBuckets),
      backgroundColor: ['#f43f5e', '#f97316', '#f59e0b', '#22c55e', '#0d9488'],
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } } },
  };

  return (
    <>
      <h1>Admin Dashboard</h1>
      <p className="subtitle">System overview — students, analytics, and placement tracking.</p>

      <div className="result-grid">
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent-2)' }}>{data.totalStudents}</div><div className="label">Total Students</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--green)' }}>{placed.length}</div><div className="label">Placed</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--red)' }}>{atRisk.length}</div><div className="label">At-Risk</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent)' }}>{data.totalPredictions}</div><div className="label">Total Analyses</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Risk Distribution</h2>
          <div style={{ maxWidth: 280, margin: '0 auto' }}>
            <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } } }} />
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Probability Distribution</h2>
          <Bar data={barData} options={chartOpts} />
        </div>
      </div>

      {/* Placement rate */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>📈 Placement Rate</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, height: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${students.length ? (placed.length / students.length * 100) : 0}%`, background: 'linear-gradient(90deg, var(--accent), var(--green))', borderRadius: 8, transition: 'width .6s' }} />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--green)', minWidth: 50 }}>{students.length ? (placed.length / students.length * 100).toFixed(0) : 0}%</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', marginTop: '.5rem' }}>{placed.length} of {students.length} students placed</p>
      </div>

      {atRisk.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
          <h2 style={{ marginTop: 0, color: 'var(--red)' }}>⚠️ At-Risk Students</h2>
          {atRisk.slice(0, 5).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{s.fullName}</span>
                <span style={{ color: 'var(--red)', marginLeft: '.75rem', fontWeight: 700 }}>{(s.lastPlacementProb * 100).toFixed(1)}%</span>
              </div>
              <button className="btn btn-outline" onClick={() => viewStudent(s.id, s.fullName)} style={{ fontSize: '.75rem', padding: '.25rem .6rem' }}>View</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
