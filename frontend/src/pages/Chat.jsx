import { useState, useRef, useEffect } from 'react';
import { apiPost, apiGet } from '../api';
import { useApp, showToast } from '../App';

const quickQuestions = [
  '🎯 How to prepare for placements?',
  '💻 Tips for coding interviews',
  '📊 What\'s my placement probability?',
  '📈 How to improve my CGPA?',
  '🏢 How to find internships?',
  '🗣️ How to improve communication?',
  '🧠 Aptitude preparation tips',
  '📁 What projects should I build?',
];

export default function Chat() {
  const { analysisData } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function loadHistory() {
    try {
      const history = await apiGet('/chat/history');
      if (history.length > 0) {
        const msgs = [];
        history.forEach(h => {
          msgs.push({ role: 'user', text: h.userMessage });
          msgs.push({ role: 'bot', text: h.aiResponse, suggestions: [] });
        });
        setMessages(msgs);
      }
    } catch (e) { /* No history, that's fine */ }
  }

  // Build student context from analysis data
  function getContext() {
    if (!analysisData.predict || analysisData.predict.error) return null;
    return null; // Context is handled by form data, not needed here
  }

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setSuggestions([]);
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const data = await apiPost('/chat', { message: q, studentContext: getContext() });
      const botText = (data.response || 'No response.').replace(/\*\*(.*?)\*\*/g, '$1');
      const sug = data.suggestions || [];
      setMessages(m => [...m, { role: 'bot', text: botText, suggestions: sug }]);
      setSuggestions(sug);
    } catch (e) {
      setMessages(m => [...m, { role: 'bot', text: '❌ Error: ' + e.message, suggestions: [] }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function formatMsg(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line)) {
        return <div key={i} style={{ paddingLeft: '.5rem', margin: '.15rem 0', display: 'flex', gap: '.4rem' }}><span style={{ color: 'var(--accent-2)', flexShrink: 0 }}>{line.startsWith('•') ? '•' : line.startsWith('-') ? '–' : line.match(/^\d+\./)?.[0]}</span><span>{line.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '')}</span></div>;
      }
      return <div key={i} style={{ margin: '.1rem 0' }}>{line}</div>;
    });
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      <h1>AI Study Tutor</h1>
      <p className="subtitle">Get personalized guidance on placement preparation, skills, and career advice.</p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 500, padding: 0, overflow: 'hidden' }}>
        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {!hasMessages && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h2 style={{ marginBottom: '.5rem' }}>Hi there! I'm your Study Tutor</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', maxWidth: 400 }}>
                Ask me about placement prep, coding skills, CGPA improvement, internships, or career advice.
              </p>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 500 }}>
                {quickQuestions.map(q => (
                  <button key={q} onClick={() => send(q.replace(/^[^\s]+\s/, ''))} className="btn btn-outline" style={{ fontSize: '.78rem', padding: '.35rem .7rem', borderRadius: 20 }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn .3s ease' }}>
              <div style={{
                maxWidth: '80%',
                padding: '.7rem 1rem',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                border: m.role === 'bot' ? '1px solid var(--border)' : 'none',
                fontSize: '.9rem', lineHeight: 1.6,
              }}>
                {m.role === 'bot' && <div style={{ fontSize: '.7rem', color: 'var(--accent-2)', fontWeight: 600, marginBottom: '.3rem' }}>🤖 Study Tutor</div>}
                <div>{formatMsg(m.text)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '.7rem 1rem', borderRadius: '16px 16px 16px 4px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', color: 'var(--text-dim)' }}>
                <span className="spinner" style={{ width: 14, height: 14 }} /> Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestion chips */}
        {suggestions.length > 0 && (
          <div style={{ padding: '.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.4rem', flexWrap: 'wrap', background: 'var(--surface)' }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} className="btn btn-outline" style={{ fontSize: '.75rem', padding: '.25rem .6rem', borderRadius: 16 }}>{s}</button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: '.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.5rem', background: 'var(--surface)' }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about placements, skills, career…"
            onKeyDown={e => e.key === 'Enter' && send()}
            style={{ flex: 1, padding: '.65rem .85rem', borderRadius: 20, fontSize: '.9rem' }} />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ borderRadius: 20, padding: '.5rem 1.2rem' }}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '➤'}
          </button>
        </div>
      </div>
    </>
  );
}
