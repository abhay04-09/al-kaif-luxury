import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/**
 * Writing a review, with the client's own session attached.
 *
 * The session lives in an httpOnly cookie the browser cannot read, so the
 * request comes back through the server to be signed. Whether this client may
 * write this review is settled by the API, not here.
 */
export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Please sign in to write a review" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const productId = String(body?.productId ?? "");
  if (!productId) {
    return NextResponse.json({ error: "Which piece?" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${API_BASE}/api/products/${encodeURIComponent(productId)}/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating: body?.rating, body: body?.body }),
        cache: "no-store"
      }
    );
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the maison. Please try again." },
      { status: 502 }
    );
  }
}
