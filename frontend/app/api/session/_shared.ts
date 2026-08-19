import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

// Thirty days, matching how long the Worker's JWT stays valid.
const MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Forwards credentials to the Worker and, on success, keeps the returned token
 * server-side in an httpOnly cookie. The token is never handed to the browser
 * as JSON, so a script injected into the page cannot read or exfiltrate it.
 */
export async function authenticate(path: string, body: unknown) {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the maison. Please try again." },
      { status: 502 }
    );
  }

  const data = (await upstream.json().catch(() => ({}))) as {
    token?: string;
    user?: unknown;
    error?: string;
  };

  if (!upstream.ok || !data.token) {
    return NextResponse.json(
      { error: data.error ?? "Authentication failed" },
      { status: upstream.status === 200 ? 500 : upstream.status }
    );
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(SESSION_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE
  });
  return response;
}
