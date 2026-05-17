import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../api';
import { useApp, showToast } from '../App';

export default function Profile() {
  const { user, setUser } = useApp();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', university: '', yearOfStudy: '', bio: '' });
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const d = await apiGet('/auth/me');
      setForm({ fullName: d.fullName || '', email: d.email || '', phone: d.phone || '', university: d.university || '', yearOfStudy: d.yearOfStudy || '', bio: d.bio || '' });
      if (d.profilePicture) setAvatar(d.profilePicture);
    } catch (e) {}
  }

  async function save() {
    setSaving(true);
    try {
      const data = await apiPut('/auth/profile', { fullName: form.fullName, phone: form.phone, university: form.university, yearOfStudy: form.yearOfStudy, bio: form.bio });
      const u = { ...user, fullName: data.fullName, profilePicture: data.profilePicture };
      setUser(u);
      localStorage.setItem('xai_user', JSON.stringify(u));
      showToast('✅ Profile updated!');
    } catch (e) { showToast('❌ ' + e.message); }
    setSaving(false);
  }

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { showToast('⚠️ Image must be under 500KB'); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setAvatar(base64);
      try {
        await apiPut('/auth/profile', { profilePicture: base64 });
        const u = { ...user, profilePicture: base64 };
        setUser(u);
        localStorage.setItem('xai_user', JSON.stringify(u));
        showToast('📸 Profile picture updated!');
      } catch (e) { showToast('❌ Upload failed'); }
    };
    reader.readAsDataURL(file);
  }

  const initials = form.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <h1>My Profile</h1>
      <p className="subtitle">Manage your account details and profile picture.</p>
      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div onClick={() => document.getElementById('avatar-input').click()} style={{ width: 120, height: 120, borderRadius: '50%', background: avatar ? `url(${avatar}) center/cover` : 'var(--accent)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', cursor: 'pointer', margin: '0 auto .75rem', overflow: 'hidden' }}>
              {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <input type="file" id="avatar-input" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
            <button className="btn btn-outline" onClick={() => document.getElementById('avatar-input').click()} style={{ fontSize: '.8rem', padding: '.3rem .8rem' }}>Change Photo</button>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group"><label>Full Name</label><input value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input value={form.email} disabled style={{ opacity: .6 }} /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" /></div>
              <div className="form-group"><label>University</label><input value={form.university} onChange={e => set('university', e.target.value)} placeholder="e.g. IIT Delhi" /></div>
              <div className="form-group">
                <label>Year of Study</label>
                <select value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                  <option value="">Select</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Graduated</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell us about yourself…" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '.55rem .75rem', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', resize: 'vertical', width: '100%' }} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginTop: '1rem' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
