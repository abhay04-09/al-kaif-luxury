import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE } from "@/lib/api";

export const SESSION_COOKIE = "alkaif_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  /** The client's saved delivery address, used to prefill checkout. */
  address?: string | null;
  role: "customer" | "admin";
  avatar?: string | null;
};

/**
 * The storefront holds no user table of its own. Identity lives in the Worker
 * (Supabase), the same place the admin panel reads, so an order placed here is
 * the same row the maison sees. The JWT rides in an httpOnly cookie: script on
 * the page cannot read it, which a localStorage token would not give us.
 */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: SessionUser | null };
    return data.user ?? null;
  } catch (error) {
    console.warn("Session lookup failed", error);
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
