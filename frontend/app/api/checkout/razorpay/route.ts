import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Opens a Razorpay order for the current bag.
 *
 * The amount is deliberately not accepted from the browser — the Worker prices
 * the line items from the catalogue itself, so a tampered cart cannot lower the
 * sum that Razorpay collects.
 */
export async function POST(request: Request) {
  const { items } = (await request.json()) as { items?: unknown };

  try {
    const upstream = await fetch(`${API_BASE}/api/payments/razorpay/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
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
