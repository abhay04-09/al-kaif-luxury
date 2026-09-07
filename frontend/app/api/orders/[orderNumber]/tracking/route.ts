import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/** Passes a tracking request through with the client's own session attached. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const { orderNumber } = await params;

  try {
    const upstream = await fetch(
      `${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/tracking`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
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
