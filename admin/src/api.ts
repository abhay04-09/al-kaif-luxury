// Central API helper for the Cloudflare Worker backend.
// In dev, Vite proxies /api -> http://localhost:8787 (see vite.config.ts).
// VITE_API_URL overrides the Worker URL; without the fallback below a build
// missing that variable posts to the Pages domain itself and every call 405s.

const PRODUCTION_API = 'https://al-kaiff-api.adpatel8376.workers.dev';

const env = (import.meta as any).env ?? {};

export const API_BASE: string = env.VITE_API_URL || (env.DEV ? '' : PRODUCTION_API);

const TOKEN_KEY = 'alkaiff_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Fired when the server rejects a signed-in call as unauthenticated.
 *
 * A session lasts two days, and the panel only checked it at page load. A tab
 * left open past that point still looked signed in, so every save came back
 * "Please sign in first" with nothing on screen explaining it and no way back
 * but a reload. The token is dropped here and the app is told, so the login
 * screen appears instead of a form that cannot save.
 */
export const SESSION_EXPIRED_EVENT = 'alkaiff:session-expired';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // A 401 on the login route means the wrong password, not a dead session, so
  // it is left alone to be reported where it was typed.
  if (res.status === 401 && token && !path.startsWith('/api/auth/login')) {
    setToken(null);
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
  return res;
}

/** JSON helper that throws a readable Error when the server returns an error payload. */
export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Request failed (${res.status})`);
  return data as T;
}
