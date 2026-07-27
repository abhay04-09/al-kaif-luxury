import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { amount } = (await request.json()) as { amount?: number };
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { message: "Razorpay keys are missing. Add them to .env.local first." },
      { status: 500 }
    );
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Valid amount is required." }, { status: 400 });
  }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `al-kaif-${Date.now()}`
    })
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
