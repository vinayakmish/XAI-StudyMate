export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent-2)' }}>🎓 XAI StudyMate</div>
        <button className="btn btn-primary" onClick={onGetStarted}>Login / Register</button>
      </nav>

      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontSize: '.85rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '1rem' }}>
          AI-Powered Placement Readiness Platform
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
          Know Your <span style={{ color: 'var(--accent-2)' }}>Placement Chances</span> Before the Interview
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.15rem', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 2rem' }}>
          Get AI-driven predictions with explainable SHAP analysis, personalized study plans, and actionable insights to maximize your placement success.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '.8rem 2rem', fontSize: '1.05rem' }}>
            🚀 Get Started Free
          </button>
          <a href="#features" className="btn btn-outline" style={{ padding: '.8rem 2rem', fontSize: '1.05rem' }}>
            Learn More ↓
          </a>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
          {[['95%+', 'Model Accuracy'], ['12', 'Key Features Analyzed'], ['8-Week', 'Improvement Plans'], ['SHAP', 'Explainable AI']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-2)' }}>{v}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-dim)', marginTop: '.2rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>Why XAI StudyMate?</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Everything you need to prepare for campus placements.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '🔮', title: 'Smart Prediction', desc: 'Random Forest ML model analyzes 12 academic factors to predict your placement probability with high accuracy.' },
            { icon: '🧠', title: 'SHAP Explainability', desc: 'Understand exactly WHY each factor helps or hurts your chances with visual SHAP impact analysis.' },
            { icon: '📋', title: 'Personalized Study Plan', desc: 'Get an 8-week improvement roadmap with prioritized action items tailored to your weaknesses.' },
            { icon: '📥', title: 'PDF Reports', desc: 'Download your complete study plan as a professional PDF to share with mentors or track progress offline.' },
            { icon: '💬', title: 'AI Study Tutor', desc: 'Chat with an AI tutor for real-time guidance on placement prep, skills, and career advice.' },
            { icon: '🛡️', title: 'Admin Dashboard', desc: 'Administrators can monitor at-risk students, view analytics, and manage placement status.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center', padding: '1.5rem', transition: 'transform .2s, border-color .2s', cursor: 'default' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '3rem 2rem 4rem', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>How It Works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { step: '1', title: 'Enter Your Profile', desc: 'Fill in your academic details — CGPA, skills, projects, internships, and more.' },
            { step: '2', title: 'Get Instant Analysis', desc: 'Our AI predicts your placement probability, explains each factor, and generates a study plan.' },
            { step: '3', title: 'Follow Your Plan', desc: 'Download your PDF report and follow the 8-week timeline to improve your placement chances.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, color: '#fff' }}>{s.step}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '.25rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '.9rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '3rem 2rem 5rem', background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(45,212,191,0.08))' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '.75rem' }}>Ready to Know Your Placement Chances?</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Join thousands of students preparing smarter with AI-powered insights.</p>
        <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '.8rem 2.5rem', fontSize: '1.1rem' }}>🚀 Get Started Now</button>
      </section>

      <footer className="footer">
        <div>© 2026 XAI StudyMate — Explainable AI Placement Readiness Platform</div>
        <div className="footer-tech">
          <span>🐍 FastAPI</span><span>☕ Spring Boot</span><span>⚛️ React</span><span>🤖 SHAP</span>
        </div>
      </footer>
    </div>
  );
}
