import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/**
 * Passes a cancellation through with the client's own session attached.
 *
 * The session lives in an httpOnly cookie the browser cannot read, so the
 * request has to come back through the server to be signed. Whether the client
 * is allowed to cancel this order is settled by the API, not here.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const { orderNumber } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const upstream = await fetch(
      `${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: body?.reason }),
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
