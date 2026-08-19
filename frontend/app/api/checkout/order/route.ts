import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/**
 * Places the order. The session JWT lives in an httpOnly cookie, so the browser
 * cannot attach it itself — this handler reads it and forwards it, which is what
 * ties the order to the signed-in client and makes it visible in their archive.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const token = await getSessionToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const upstream = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers,
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
