import { jsPDF } from 'jspdf';
import { useApp, showToast } from '../App';

export default function StudyPlan() {
  const { analysisData, user } = useApp();
  const data = analysisData.plan;
  const predictData = analysisData.predict;

  function downloadPDF() {
    if (!data || data.error) { showToast('No study plan to download.'); return; }
    const doc = new jsPDF();
    const margin = 18;
    let y = margin;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const contentW = pageW - margin * 2;

    // Strip all non-ASCII characters — jsPDF Helvetica only supports basic Latin
    function clean(str) {
      if (!str) return '';
      return String(str)
        .replace(/\*\*/g, '')           // remove markdown bold
        .replace(/[★✅❌⚠️🎯📊💡⏰📋📅🏁📈📥🤖💬👤📸🎓🚀]/g, '')  // remove emojis
        .replace(/[\u2022\u2023\u25CF\u25CB]/g, '-')   // bullet -> dash
        .replace(/[\u2014\u2013]/g, '--')               // em/en dash -> --
        .replace(/[\u2018\u2019]/g, "'")                // smart quotes
        .replace(/[\u201C\u201D]/g, '"')                // smart double quotes
        .replace(/[\u2605\u2606]/g, '*')                // stars -> *
        .replace(/[^\x20-\x7E\n\r\t]/g, '')            // strip remaining non-ASCII
        .trim();
    }

    function checkPage(needed) {
      if (y + needed > pageH - 20) { doc.addPage(); y = margin; }
    }

    // -- Header --
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 42, 'F');
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 42, pageW, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('XAI StudyMate', margin, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Personalized Study Plan Report', margin, 28);
    doc.setFontSize(9);
    doc.text(clean(user?.fullName || 'Student'), pageW - margin, 18, { align: 'right' });
    doc.text(clean(user?.email || ''), pageW - margin, 25, { align: 'right' });
    doc.text('Generated: ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), pageW - margin, 32, { align: 'right' });
    y = 52;

    // -- Prediction Summary Box --
    if (predictData && !predictData.error) {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
      doc.setTextColor(45, 212, 191);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Prediction Summary', margin + 6, y + 8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      const probPct = (predictData.placement_probability * 100).toFixed(1);
      doc.text('Placement Probability: ' + probPct + '%  |  Prediction: ' + (predictData.placed ? 'Placed' : 'Not Placed') + '  |  Risk: ' + (predictData.risk_level || 'N/A').toUpperCase() + '  |  Est. Package: Rs.' + (predictData.predicted_package?.toFixed(2) || 'N/A') + ' LPA', margin + 6, y + 16);
      y += 28;
    }

    // -- Profile Summary --
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Profile Summary', margin, y); y += 7;
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y); y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 70);
    const summaryLines = doc.splitTextToSize(clean(data.student_summary || 'No summary available.'), contentW);
    checkPage(summaryLines.length * 4.5);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 4.5 + 6;

    // -- Action Items --
    if (data.plan_items && data.plan_items.length > 0) {
      checkPage(12);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Action Items (' + data.plan_items.length + ')', margin, y); y += 7;
      doc.setDrawColor(13, 148, 136);
      doc.line(margin, y, margin + 40, y); y += 5;

      data.plan_items.forEach((item, i) => {
        checkPage(32);
        const colors = { critical: [244, 63, 94], high: [249, 115, 22], medium: [245, 158, 11], low: [34, 197, 94] };
        const c = colors[item.priority] || [100, 100, 120];
        doc.setFillColor(...c);
        doc.rect(margin, y - 1, 3, 18, 'F');
        doc.setFillColor(240, 242, 245);
        doc.rect(margin + 3, y - 1, contentW - 3, 18, 'F');

        doc.setTextColor(30, 30, 50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(clean((i + 1) + '. ' + item.title), margin + 7, y + 5);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 100);
        doc.text(clean(item.priority.toUpperCase() + ' Priority  |  Current: ' + item.current_value + '  |  Target: ' + item.target_value + '  |  Week ' + item.timeline_week + '  |  Impact: ' + (item.estimated_impact?.toFixed(3) || 'N/A')), margin + 7, y + 12);
        y += 22;

        doc.setTextColor(60, 60, 80);
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(clean(item.description || ''), contentW - 8);
        checkPage(descLines.length * 4.5);
        doc.text(descLines, margin + 5, y);
        y += descLines.length * 4.5 + 5;
      });
    }

    // -- 8-Week Timeline --
    if (data.weekly_milestones && data.weekly_milestones.length > 0) {
      checkPage(12);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('8-Week Timeline', margin, y); y += 7;
      doc.setDrawColor(13, 148, 136);
      doc.line(margin, y, margin + 40, y); y += 5;

      data.weekly_milestones.forEach(m => {
        checkPage(18);
        const bgColor = m.is_checkpoint ? [13, 148, 136] : [30, 41, 59];
        doc.setFillColor(...bgColor);
        doc.roundedRect(margin, y - 2, 42, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Week ' + m.week + (m.is_checkpoint ? ' *' : ''), margin + 4, y + 3.5);

        doc.setTextColor(30, 30, 50);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(clean(m.title), margin + 47, y + 3.5);
        y += 10;

        doc.setTextColor(80, 80, 100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const taskStr = (m.tasks || []).map(t => clean(t)).join(' - ');
        const taskLines = doc.splitTextToSize(taskStr, contentW - 10);
        checkPage(taskLines.length * 4);
        doc.text(taskLines, margin + 6, y);
        y += taskLines.length * 4 + 4;
      });
    }

    // -- Footer on all pages --
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(241, 245, 249);
      doc.rect(0, pageH - 14, pageW, 14, 'F');
      doc.setFontSize(7);
      doc.setTextColor(120, 130, 150);
      doc.text('XAI StudyMate -- AI-Powered Placement Readiness Platform  |  Confidential', margin, pageH - 5);
      doc.text('Page ' + p + ' of ' + pageCount, pageW - margin, pageH - 5, { align: 'right' });
    }

    doc.save('XAI_StudyMate_StudyPlan_' + clean(user?.fullName || 'Student').replace(/\s/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
    showToast('PDF downloaded!');
  }

  if (!data || data.error) return (
    <>
      <h1>Your Study Plan</h1>
      <p className="subtitle">A personalized improvement roadmap based on your academic profile.</p>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h2>No Study Plan Yet</h2>
        <p style={{ color: 'var(--text-dim)', marginTop: '.5rem' }}>Run <strong>Analyze My Profile</strong> on the Dashboard tab to generate your personalized study plan.</p>
      </div>
    </>
  );

  // Compute overall improvement potential
  const totalImpact = data.plan_items.reduce((sum, i) => sum + (i.estimated_impact || 0), 0);
  const criticalCount = data.plan_items.filter(i => i.priority === 'critical').length;
  const highCount = data.plan_items.filter(i => i.priority === 'high').length;

  return (
    <>
      <h1>Your Study Plan</h1>
      <p className="subtitle">A personalized 8-week improvement roadmap tailored to your profile.</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.6rem 1.5rem' }}>📥 Download PDF Report</button>
      </div>

      {/* Quick Stats */}
      <div className="result-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card"><div className="value" style={{ color: 'var(--accent-2)' }}>{data.plan_items.length}</div><div className="label">Action Items</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--red)' }}>{criticalCount + highCount}</div><div className="label">High Priority</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--green)' }}>{data.weekly_milestones.length}</div><div className="label">Weekly Milestones</div></div>
        <div className="stat-card"><div className="value" style={{ color: 'var(--yellow)' }}>+{(totalImpact * 100).toFixed(1)}%</div><div className="label">Est. Improvement</div></div>
      </div>

      {/* Profile Summary */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>📊 Profile Summary</h2>
        <div style={{ whiteSpace: 'pre-line', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--text-dim)' }} dangerouslySetInnerHTML={{ __html: data.student_summary.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>') }} />
      </div>

      {/* Action Items */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>📋 Action Items</h2>
        {data.plan_items.map((item, i) => (
          <div className={`plan-item ${item.priority}`} key={i} style={{ animation: `fadeIn .3s ease ${i * 0.08}s both` }}>
            <div className="pi-header">
              <span className="pi-title">{item.title}</span>
              <span className="pi-badge" style={{ background: { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--yellow)', low: 'var(--green)' }[item.priority] || 'var(--surface-2)', color: '#fff' }}>{item.priority}</span>
            </div>
            <div className="pi-desc">{item.description}</div>
            <div className="pi-meta">
              <span>📊 Current: <strong>{item.current_value}</strong></span>
              <span>🎯 Target: <strong>{item.target_value}</strong></span>
              <span>⏰ Week {item.timeline_week}</span>
              <span>💡 Impact: <strong style={{ color: 'var(--green)' }}>+{(item.estimated_impact * 100).toFixed(1)}%</strong></span>
            </div>
            {/* Progress bar showing current vs target */}
            <div style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (parseFloat(item.current_value) / parseFloat(item.target_value)) * 100 || 30)}%`, background: { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--yellow)', low: 'var(--green)' }[item.priority] || 'var(--accent)', borderRadius: 4, transition: 'width .6s' }} />
              </div>
              <span style={{ fontSize: '.7rem', color: 'var(--text-dim)' }}>{item.current_value} → {item.target_value}</span>
            </div>
          </div>
        ))}
        {!data.plan_items.length && <p style={{ color: 'var(--text-dim)' }}>Your profile looks great! No major improvements needed.</p>}
      </div>

      {/* 8-Week Timeline */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>📅 8-Week Timeline</h2>
        <div className="timeline">
          {data.weekly_milestones.map((m, i) => (
            <div className={`tl-item ${m.is_checkpoint ? 'checkpoint' : ''}`} key={i} style={{ animation: `fadeIn .3s ease ${i * 0.06}s both` }}>
              <div className="tl-week">
                Week {m.week} — {m.title}
                {m.is_checkpoint && <span style={{ marginLeft: '.5rem', background: 'var(--green)', color: '#fff', padding: '.1rem .5rem', borderRadius: 12, fontSize: '.7rem', fontWeight: 700 }}>CHECKPOINT</span>}
              </div>
              <div className="tl-tasks">{m.tasks.join(' • ')}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
