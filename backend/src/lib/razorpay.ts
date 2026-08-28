import type { Env } from '../env';

// Razorpay REST API via fetch — no SDK needed on Workers.

export async function createRazorpayOrder(
  env: Env,
  amountINR: number,
  receipt: string
): Promise<{ id: string; amount: number; currency: string }> {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`),
    },
    body: JSON.stringify({
      amount: Math.round(amountINR * 100), // paise
      currency: 'INR',
      receipt,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${body}`);
  }
  return res.json();
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number; // paise
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
}

/**
 * Reads the payment back from Razorpay.
 *
 * The checkout signature only proves that *some* payment happened — it says
 * nothing about how much was paid or what it was for. Anyone can pay for a
 * cheap item, keep the resulting (genuine) signature, and replay it against a
 * far more expensive cart. Razorpay's own record of the payment is the only
 * trustworthy source for the amount, so we fetch it rather than infer it.
 */
export async function fetchRazorpayPayment(
  env: Env,
  paymentId: string
): Promise<RazorpayPayment | null> {
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`),
      },
    }
  );
  // No such payment: the caller invented the id, so this is a rejection rather
  // than a fault. A 5xx is a genuine upstream problem and must keep throwing so
  // a Razorpay outage can never be mistaken for a successful payment.
  if (res.status >= 400 && res.status < 500) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay payment lookup failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Verifies the checkout signature: HMAC-SHA256(order_id|payment_id, key_secret). */
export async function verifyRazorpaySignature(
  env: Env,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${razorpayOrderId}|${razorpayPaymentId}`)
  );
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

/**
 * Verifies a webhook delivery: HMAC-SHA256 of the raw request body, keyed with
 * the webhook secret — which is a different secret from the API key.
 *
 * The raw body must be passed exactly as received. Re-serialising the parsed
 * JSON changes the bytes and the signature will never match.
 */
export async function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  signature: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
