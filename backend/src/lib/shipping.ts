import type { Env } from '../env';
import { getQuotes, isShipmozoConfigured } from './shipmozo';
import { getShippingSettings, type ShippingSettings } from './settings';

/**
 * What a client is charged to have their order delivered.
 *
 * The rate is asked of the couriers, per pin code, because that is what the
 * parcel actually costs. Three things guard that:
 *
 *   - a client with no pin code yet is quoted the flat rate, not nothing;
 *   - the courier is given four seconds, after which the flat rate stands. A
 *     slow aggregator must not become a slow checkout;
 *   - the answer is always a number. There is no path where a total cannot be
 *     shown because an API was unhappy.
 */

const COURIER_TIMEOUT_MS = 4000;

export interface ShippingQuote {
  shippingINR: number;
  codFeeINR: number;
  /** Where the number came from, so a surprising charge can be explained. */
  source: 'courier' | 'flat' | 'free';
  courier?: string;
}

/** Rejects rather than hanging, so a slow courier cannot hold up a checkout. */
function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('courier timed out')), ms)
    ),
  ]);
}

/** Jewellery is light; the box is most of the parcel. */
export function parcelWeightGrams(pieces: number): number {
  return 150 + Math.max(1, pieces) * 50;
}

export async function quoteShipping(
  env: Env,
  options: {
    pincode?: string | null;
    cod: boolean;
    goodsINR: number;
    pieces: number;
    settings?: ShippingSettings;
  }
): Promise<ShippingQuote> {
  const settings = options.settings ?? (await getShippingSettings(env));
  const codFeeINR = options.cod ? settings.codFeeINR : 0;

  // A generous cart carries its own delivery, when the shop has said so.
  if (settings.freeAboveINR > 0 && options.goodsINR >= settings.freeAboveINR) {
    return { shippingINR: 0, codFeeINR, source: 'free' };
  }

  const pincode = String(options.pincode ?? '').replace(/\D/g, '');
  const canAsk =
    settings.liveRates && /^\d{6}$/.test(pincode) && isShipmozoConfigured(env);

  if (canAsk) {
    try {
      const quotes = await withTimeout(
        getQuotes(env, pincode, env.SHIPMOZO_PICKUP_PINCODE || '396191', {
          weightGrams: parcelWeightGrams(options.pieces),
          orderAmountINR: options.goodsINR,
          cod: options.cod,
        }),
        COURIER_TIMEOUT_MS
      );

      const cheapest = quotes[0];
      if (cheapest) {
        return {
          shippingINR: Math.ceil(cheapest.totalINR) + settings.markupINR,
          codFeeINR,
          source: 'courier',
          courier: cheapest.courier,
        };
      }
    } catch (err: any) {
      // Worth knowing about, never worth failing a sale over.
      console.error(`Courier quote for ${pincode} failed: ${err?.message}`);
    }
  }

  return { shippingINR: settings.flatINR, codFeeINR, source: 'flat' };
}
