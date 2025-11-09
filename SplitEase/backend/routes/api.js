const API_BASE = 'http://localhost:4000/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {},
    token ? { 'Authorization': `Bearer ${token}` } : {}
  );
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}