import type { Env } from '../env';
import { getDb } from './db';

/**
 * Settings the shop can change without a deploy.
 *
 * Read on the checkout path, so a missing row, a bad row, or a database that
 * will not answer must never stop an order: every read falls back to the
 * defaults below rather than throwing.
 */

export interface ShippingSettings {
  /** Ask the courier what the parcel costs to that pin code. */
  liveRates: boolean;
  /** Charged when the courier will not answer, or has no pin code to answer about. */
  flatINR: number;
  /**
   * Added to cash-on-delivery orders, on top of the courier's rate.
   *
   * Zero by default and deliberately so: a live COD quote already contains the
   * courier's own collection charge — Shipmozo itemises it as "COD Charges" —
   * so anything here is that fee charged a second time.
   */
  codFeeINR: number;
  /** Carts at or over this ship free. 0 turns it off. */
  freeAboveINR: number;
  /** Added to every live quote, for packaging and handling. */
  markupINR: number;
}

export const SHIPPING_DEFAULTS: ShippingSettings = {
  liveRates: true,
  flatINR: 79,
  codFeeINR: 0,
  freeAboveINR: 0,
  markupINR: 0,
};

const money = (value: unknown, fallback: number): number => {
  const n = Number(value);
  // A negative shipping charge would pay the client to order.
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
};

export async function getShippingSettings(env: Env): Promise<ShippingSettings> {
  try {
    const { data } = await getDb(env)
      .from('settings')
      .select('value')
      .eq('key', 'shipping')
      .maybeSingle();

    const raw = (data?.value ?? {}) as Partial<ShippingSettings>;
    return {
      liveRates: raw.liveRates !== false,
      flatINR: money(raw.flatINR, SHIPPING_DEFAULTS.flatINR),
      codFeeINR: money(raw.codFeeINR, SHIPPING_DEFAULTS.codFeeINR),
      freeAboveINR: money(raw.freeAboveINR, SHIPPING_DEFAULTS.freeAboveINR),
      markupINR: money(raw.markupINR, SHIPPING_DEFAULTS.markupINR),
    };
  } catch {
    return { ...SHIPPING_DEFAULTS };
  }
}

export async function saveShippingSettings(
  env: Env,
  patch: Partial<ShippingSettings>
): Promise<ShippingSettings> {
  const current = await getShippingSettings(env);
  const next: ShippingSettings = {
    liveRates: patch.liveRates === undefined ? current.liveRates : patch.liveRates !== false,
    flatINR: money(patch.flatINR, current.flatINR),
    codFeeINR: money(patch.codFeeINR, current.codFeeINR),
    freeAboveINR: money(patch.freeAboveINR, current.freeAboveINR),
    markupINR: money(patch.markupINR, current.markupINR),
  };

  const { error } = await getDb(env)
    .from('settings')
    .upsert({ key: 'shipping', value: next, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return next;
}
