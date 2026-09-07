import type { Env } from '../env';
import type { Order } from '../types';

/**
 * Shipmozo, the courier aggregator that carries the parcels.
 *
 * Their documentation is not public; this was mapped against the live API. Two
 * details cost an afternoon and are worth stating plainly:
 *
 *   - the key headers are `public-key` and `private-key`, and the two keys are
 *     handed out in the opposite order to the one they are used in;
 *   - the package dimension is `width`, not `breadth`, though every other
 *     field reads as though it were written by someone who says breadth.
 */

const BASE = 'https://shipping-api.com/app/api/v1';

export const isShipmozoConfigured = (env: Env): boolean =>
  Boolean(env.SHIPMOZO_PUBLIC_KEY && env.SHIPMOZO_PRIVATE_KEY);

function headers(env: Env): Record<string, string> {
  return {
    'public-key': env.SHIPMOZO_PUBLIC_KEY,
    'private-key': env.SHIPMOZO_PRIVATE_KEY,
    'Content-Type': 'application/json',
  };
}

interface ShipmozoReply {
  result: string; // '1' success, '0' failure
  message: string;
  data: any;
}

async function call(
  env: Env,
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown }
): Promise<ShipmozoReply> {
  const res = await fetch(`${BASE}/${path}`, {
    method: init.method,
    headers: headers(env),
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });

  const text = await res.text();
  let reply: ShipmozoReply;
  try {
    reply = JSON.parse(text);
  } catch {
    // An unknown path returns their HTML error page rather than JSON.
    throw new Error(`Shipmozo returned ${res.status} for ${path}`);
  }

  if (reply.result !== '1') {
    const detail =
      reply.data && typeof reply.data === 'object' && 'error' in reply.data
        ? String(reply.data.error)
        : reply.message;
    throw new Error(detail || 'Shipmozo refused the request');
  }
  return reply;
}

/** Splits a one-line address back into the parts Shipmozo insists on. */
function addressParts(order: Order): {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
} {
  const raw = order.shippingAddress as unknown;

  if (raw && typeof raw === 'object') {
    const a = raw as Record<string, string>;
    return {
      line1: a.addressLine1 ?? '',
      line2: a.addressLine2 ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
      pincode: a.pincode ?? '',
    };
  }

  // Older orders kept the address as one block of text the client typed. The
  // pin code is the only part that can be found reliably; the rest is passed
  // through whole so a human courier still has something to read.
  const text = String(raw ?? '').trim();
  const pincode = text.match(/\b(\d{6})\b/)?.[1] ?? '';
  return { line1: text.slice(0, 200), line2: '', city: '', state: '', pincode };
}

export interface ShipResult {
  shipmozoOrderId: string | null;
  awbNumber: string | null;
  courierName: string | null;
}

/**
 * Hands an order to Shipmozo.
 *
 * An AWB is not always returned here — with some couriers it is assigned when
 * the shipment is actually booked — so the caller must cope with a null.
 */
export async function pushOrder(
  env: Env,
  order: Order,
  options: { weightGrams?: number } = {}
): Promise<ShipResult> {
  const address = addressParts(order);
  if (!address.pincode) {
    throw new Error('This order has no pin code, so it cannot be shipped');
  }

  const items = (order.items ?? []).map(item => ({
    name: item.product?.name ?? 'Jewellery',
    sku: item.product?.sku || item.product?.id || 'PIECE',
    quantity: String(item.quantity),
    unit_price: String(item.product?.priceINR ?? 0),
  }));

  // Jewellery is light; the parcel is mostly box. A default keeps the courier
  // quoting sensibly when nobody has weighed anything.
  const grams = Math.max(50, Math.round(options.weightGrams ?? 200));

  const body: Record<string, unknown> = {
    order_id: order.orderNumber,
    order_date: new Date(order.createdAt).toISOString().slice(0, 10),
    order_type: 'FORWARD',
    consignee_name: order.customerName,
    consignee_phone: String(order.customerPhone ?? '').replace(/\D/g, '').slice(-10),
    consignee_email: order.customerEmail || undefined,
    consignee_address_line_one: address.line1 || 'Address on file',
    consignee_address_line_two: address.line2 || undefined,
    consignee_pin_code: address.pincode,
    consignee_city: address.city || undefined,
    consignee_state: address.state || undefined,
    weight: String(grams),
    length: '12',
    width: '12',
    height: '6',
    product_detail: items,
  };

  // Sent explicitly rather than left to Shipmozo's default, so a parcel is
  // never collected from an address nobody chose.
  if (env.SHIPMOZO_WAREHOUSE_ID) body.warehouse_id = env.SHIPMOZO_WAREHOUSE_ID;

  if (order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid') {
    body.payment_type = 'COD';
    body.cod_amount = String(order.totalINR);
  } else {
    body.payment_type = 'PREPAID';
  }

  const reply = await call(env, 'push-order', { method: 'POST', body });
  const data = reply.data ?? {};

  return {
    shipmozoOrderId: data.order_id ? String(data.order_id) : null,
    awbNumber: data.awb_number ? String(data.awb_number) : null,
    courierName: data.courier_name ? String(data.courier_name) : null,
  };
}

export interface TrackingUpdate {
  status: string | null;
  courierName: string | null;
  history: { status: string; location?: string; at?: string }[];
}

export async function trackByAwb(env: Env, awb: string): Promise<TrackingUpdate> {
  const res = await fetch(
    `${BASE}/track-order?awb_number=${encodeURIComponent(awb)}`,
    { headers: headers(env) }
  );
  const text = await res.text();

  let reply: ShipmozoReply;
  try {
    reply = JSON.parse(text);
  } catch {
    throw new Error(`Shipmozo returned ${res.status} while tracking`);
  }
  if (reply.result !== '1') {
    throw new Error(reply.message || 'Shipmozo could not track that number');
  }

  const data = reply.data ?? {};
  const scans: any[] = data.scan_detail ?? data.scans ?? data.history ?? [];

  return {
    status: data.current_status ?? data.status ?? null,
    courierName: data.courier_name ?? data.courier ?? null,
    history: scans.map(s => ({
      status: String(s.status ?? s.scan_status ?? s.remark ?? ''),
      location: s.location ?? s.city ?? undefined,
      at: s.date ?? s.scan_date ?? s.timestamp ?? undefined,
    })),
  };
}

export async function cancelShipment(env: Env, shipmozoOrderId: string): Promise<void> {
  await call(env, 'cancel-order', {
    method: 'POST',
    body: { order_id: shipmozoOrderId },
  });
}

export async function schedulePickup(env: Env, shipmozoOrderId: string): Promise<void> {
  await call(env, 'schedule-pickup', {
    method: 'POST',
    body: { order_id: shipmozoOrderId },
  });
}

export interface CourierQuote {
  courier: string;
  totalINR: number;
}

/**
 * Whether anyone will carry a parcel to this pin code, and for how much.
 *
 * Shipmozo has a pincode-serviceability endpoint, and it is not to be trusted:
 * it answers "not serviceable" for Mumbai and Delhi while the rate calculator
 * offers eighteen couriers for the same route. So the quote is the answer — a
 * courier willing to name a price is a courier willing to carry it.
 */
export async function getQuotes(
  env: Env,
  deliveryPincode: string,
  pickupPincode: string,
  options: { weightGrams?: number; orderAmountINR?: number; cod?: boolean } = {}
): Promise<CourierQuote[]> {
  const reply = await call(env, 'rate-calculator', {
    method: 'POST',
    body: {
      pickup_pincode: pickupPincode,
      delivery_pincode: deliveryPincode,
      order_type: 'FORWARD',
      shipment_type: 'FORWARD',
      payment_type: options.cod ? 'COD' : 'PREPAID',
      type_of_package: 'SPS',
      weight: String(Math.max(50, Math.round(options.weightGrams ?? 200))),
      // Shipmozo rejects a zero declared value outright, and the figure only
      // affects insurance — a nominal rupee is enough to ask "who delivers here".
      order_amount: String(Math.max(1, Math.round(options.orderAmountINR ?? 1))),
      dimensions: [{ no_of_box: '1', length: '12', width: '12', height: '6' }],
    },
  });

  const rows: any[] = Array.isArray(reply.data) ? reply.data : [];
  return rows
    .map(r => ({
      courier: String(r.courier_name ?? r.name ?? 'Courier'),
      totalINR: Number(r.total_charges ?? r.rate ?? r.freight_charge ?? 0),
    }))
    .filter(q => q.totalINR > 0)
    .sort((a, b) => a.totalINR - b.totalINR);
}

export async function checkServiceability(
  env: Env,
  deliveryPincode: string,
  pickupPincode: string
): Promise<boolean> {
  const quotes = await getQuotes(env, deliveryPincode, pickupPincode);
  return quotes.length > 0;
}
