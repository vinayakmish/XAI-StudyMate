const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('xai_token');
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

function handleAuthError(res) {
  if (res.status === 403) {
    localStorage.removeItem('xai_token');
    localStorage.removeItem('xai_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
}

async function parseError(res) {
  let text = '';
  try { text = await res.text(); } catch { text = 'Request failed'; }
  // Try to parse as JSON and extract a friendly message
  try {
    const json = JSON.parse(text);
    if (json.fieldErrors) {
      // Validation errors — combine field messages
      return Object.values(json.fieldErrors).join('. ') + '.';
    }
    if (json.error) return json.error;
    if (json.message) return json.message;
  } catch {
    // Not JSON — return as-is but trim
  }
  return text.length > 200 ? text.substring(0, 200) + '…' : text;
}

export async function apiPost(path, body) {
  const res = await fetch(API_URL + path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  handleAuthError(res);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(API_URL + path, { headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(API_URL + path, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  handleAuthError(res);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
