// Central API helper for the Cloudflare Worker backend.
// In dev, Vite proxies /api -> http://localhost:8787 (see vite.config.ts).
// In production, set VITE_API_URL to your Worker URL, e.g. https://al-kaiff-api.YOUR-SUBDOMAIN.workers.dev

export const API_BASE: string = (import.meta as any).env?.VITE_API_URL || '';

const TOKEN_KEY = 'alkaiff_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

/** JSON helper that throws a readable Error when the server returns an error payload. */
export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Request failed (${res.status})`);
  return data as T;
}
