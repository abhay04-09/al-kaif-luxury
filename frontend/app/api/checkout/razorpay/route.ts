import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/**
 * Opens a Razorpay order for the current bag.
 *
 * The amount is deliberately not accepted from the browser — the Worker prices
 * the line items from the catalogue itself, so a tampered cart cannot lower the
 * sum that Razorpay collects.
 *
 * The delivery details travel with it so the Worker can park the basket before
 * the payment window opens. That is what lets Razorpay's webhook finish the
 * order if the client pays and their browser never comes back.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const token = await getSessionToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const upstream = await fetch(`${API_BASE}/api/payments/razorpay/order`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: body.items,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        giftWrapped: body.giftWrapped,
        notes: body.notes
      })
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
