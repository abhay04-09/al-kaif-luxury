import { Context, Next } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../env';

export interface TokenPayload {
  sub: string;
  /** Null for an account created from a mobile number, which carries no email. */
  email: string | null;
  name: string;
  role: 'customer' | 'admin';
  exp: number;
  [key: string]: unknown;
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function createToken(
  user: { id: string; email: string | null; name: string; role: 'customer' | 'admin' },
  secret: string
): Promise<string> {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email ?? null,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  return sign(payload, secret);
}

async function readToken(c: Context<{ Bindings: Env }>): Promise<TokenPayload | null> {
  const header = c.req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    return (await verify(header.slice(7), c.env.JWT_SECRET, 'HS256')) as TokenPayload;
  } catch {
    return null;
  }
}

/** Attaches the user payload to the context if a valid token is present; never rejects. */
export async function optionalAuth(c: Context<{ Bindings: Env }>, next: Next) {
  c.set('user' as never, (await readToken(c)) as never);
  await next();
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const user = await readToken(c);
  if (!user) return c.json({ error: 'Please sign in first' }, 401);
  c.set('user' as never, user as never);
  await next();
}

export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const user = await readToken(c);
  if (!user) return c.json({ error: 'Please sign in first' }, 401);
  if (user.role !== 'admin') return c.json({ error: 'Admin access required' }, 403);
  c.set('user' as never, user as never);
  await next();
}

export function currentUser(c: Context): TokenPayload | null {
  return (c.get('user' as never) as TokenPayload | undefined) ?? null;
}
