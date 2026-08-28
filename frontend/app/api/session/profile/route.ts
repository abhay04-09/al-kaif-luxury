import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/**
 * Saves the client's own details. The session JWT lives in an httpOnly cookie
 * the browser cannot read, so this handler attaches it on their behalf — which
 * is also what stops one client editing another's account.
 */
export async function PUT(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const upstream = await fetch(`${API_BASE}/api/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the maison. Please try again." },
      { status: 502 }
    );
  }
}
