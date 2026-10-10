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


/**
 * Price bands for jewellery: Classic, Standard, Premium.
 *
 * The bands are derived from a piece's price, never stored on it, so raising a
 * price moves the piece to its new band the moment it is saved. A stored band
 * would quietly disagree with the price beside it.
 *
 * The three the maison asked for were "Classic under 299", "Standard up to
 * 799" and "Premium above 1299", which leaves everything between 800 and 1299
 * belonging to no band at all. Standard is stretched to meet Premium instead,
 * because a piece with no band is a piece that appears in no section.
 */
export interface PriceTierSettings {
  classicUnder: number;
  premiumAbove: number;
}

export const TIER_DEFAULTS: PriceTierSettings = {
  classicUnder: 299,
  premiumAbove: 1299,
};

export type PriceTier = 'Classic' | 'Standard' | 'Premium';

export const TIER_IDS: Record<PriceTier, string> = {
  Classic: 'classic',
  Standard: 'standard',
  Premium: 'premium',
};

export function priceTierOf(priceINR: number, tiers: PriceTierSettings): PriceTier {
  if (priceINR < tiers.classicUnder) return 'Classic';
  if (priceINR > tiers.premiumAbove) return 'Premium';
  return 'Standard';
}

export async function getPriceTierSettings(env: Env): Promise<PriceTierSettings> {
  try {
    const { data } = await getDb(env)
      .from('settings')
      .select('value')
      .eq('key', 'price_tiers')
      .maybeSingle();
    const raw = (data?.value ?? {}) as Partial<PriceTierSettings>;
    const classicUnder = money(raw.classicUnder, TIER_DEFAULTS.classicUnder);
    const premiumAbove = money(raw.premiumAbove, TIER_DEFAULTS.premiumAbove);
    // Bands that cross over would leave pieces in two at once, or in none.
    return premiumAbove >= classicUnder
      ? { classicUnder, premiumAbove }
      : { ...TIER_DEFAULTS };
  } catch {
    return { ...TIER_DEFAULTS };
  }
}

export async function savePriceTierSettings(
  env: Env,
  patch: Partial<PriceTierSettings>
): Promise<PriceTierSettings> {
  const current = await getPriceTierSettings(env);
  const classicUnder = money(patch.classicUnder, current.classicUnder);
  const premiumAbove = money(patch.premiumAbove, current.premiumAbove);
  if (premiumAbove < classicUnder) {
    throw new Error('The Premium threshold must not be below the Classic one');
  }

  const next = { classicUnder, premiumAbove };
  const { error } = await getDb(env)
    .from('settings')
    .upsert({ key: 'price_tiers', value: next, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return next;
}


/**
 * The festive offer: a percentage off by basket size, plus free gifts.
 *
 * Only pieces whose name or description carries the keyword ("traditional")
 * take part, and only those pieces count towards the basket that decides the
 * tier. A client cannot reach the 55% band by filling a bag with perfume and
 * then have a single traditional earring discounted by it.
 *
 * Every figure here is editable from the panel, because a season's offer is a
 * shopkeeper's decision and should not need a deploy.
 */
export interface FestiveTier {
  /** The smallest eligible basket that earns this row. */
  minINR: number;
  percent: number;
  gifts: number;
}

export interface FestiveSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  keyword: string;
  tiers: FestiveTier[];
}

export const FESTIVE_DEFAULTS: FestiveSettings = {
  enabled: false,
  title: 'Navratri Festive Season Sale',
  subtitle: 'Offers on all traditional products',
  keyword: 'traditional',
  tiers: [
    { minINR: 0, percent: 20, gifts: 0 },
    { minINR: 1001, percent: 25, gifts: 1 },
    { minINR: 2001, percent: 30, gifts: 1 },
    { minINR: 3000, percent: 40, gifts: 2 },
    { minINR: 5000, percent: 55, gifts: 3 },
  ],
};

/** A whole percentage between 0 and 90. Nothing here may give the shop away. */
const percent = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 90 ? Math.round(n) : fallback;
};

const count = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 10 ? Math.round(n) : fallback;
};

function cleanTiers(raw: unknown): FestiveTier[] {
  if (!Array.isArray(raw) || raw.length === 0) return FESTIVE_DEFAULTS.tiers;
  const tiers = raw
    .map(t => ({
      minINR: money((t as FestiveTier)?.minINR, 0),
      percent: percent((t as FestiveTier)?.percent, 0),
      gifts: count((t as FestiveTier)?.gifts, 0),
    }))
    // Richest basket first, so the first row that fits is the best one earned.
    .sort((a, b) => b.minINR - a.minINR);
  return tiers.length ? tiers : FESTIVE_DEFAULTS.tiers;
}

const text = (value: unknown, fallback: string): string => {
  const s = typeof value === 'string' ? value.trim() : '';
  return s ? s.slice(0, 120) : fallback;
};

export async function getFestiveSettings(env: Env): Promise<FestiveSettings> {
  try {
    const { data } = await getDb(env)
      .from('settings')
      .select('value')
      .eq('key', 'festive')
      .maybeSingle();
    const raw = (data?.value ?? {}) as Partial<FestiveSettings>;
    return {
      enabled: raw.enabled === true,
      title: text(raw.title, FESTIVE_DEFAULTS.title),
      subtitle: text(raw.subtitle, FESTIVE_DEFAULTS.subtitle),
      keyword: text(raw.keyword, FESTIVE_DEFAULTS.keyword).toLowerCase(),
      tiers: cleanTiers(raw.tiers),
    };
  } catch {
    // An unreachable settings table must never discount an order by accident.
    return { ...FESTIVE_DEFAULTS, tiers: [...FESTIVE_DEFAULTS.tiers] };
  }
}

export async function saveFestiveSettings(
  env: Env,
  patch: Partial<FestiveSettings>
): Promise<FestiveSettings> {
  const current = await getFestiveSettings(env);
  const next: FestiveSettings = {
    enabled: patch.enabled === undefined ? current.enabled : patch.enabled === true,
    title: text(patch.title, current.title),
    subtitle: text(patch.subtitle, current.subtitle),
    keyword: text(patch.keyword, current.keyword).toLowerCase(),
    tiers: patch.tiers === undefined ? current.tiers : cleanTiers(patch.tiers),
  };

  const { error } = await getDb(env)
    .from('settings')
    .upsert({ key: 'festive', value: next, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return next;
}

/** Whether a piece takes part: the keyword in its name or its description. */
export function isFestiveItem(
  item: { name?: string | null; description?: string | null },
  keyword: string
): boolean {
  if (!keyword) return false;
  const haystack = `${item.name ?? ''} ${item.description ?? ''}`.toLowerCase();
  return haystack.includes(keyword);
}

export interface FestiveResult {
  /** The part of the basket the offer applies to. */
  eligibleINR: number;
  discountINR: number;
  percent: number;
  gifts: number;
  /** What to print on the order: "30% off + 1 gift". Empty when nothing applies. */
  label: string;
}

export const NO_FESTIVE: FestiveResult = {
  eligibleINR: 0,
  discountINR: 0,
  percent: 0,
  gifts: 0,
  label: '',
};

/** The best tier an eligible basket has earned, and what it is worth. */
export function festiveFor(eligibleINR: number, settings: FestiveSettings): FestiveResult {
  if (!settings.enabled || eligibleINR <= 0) return NO_FESTIVE;

  const tier = settings.tiers.find(t => eligibleINR >= t.minINR);
  if (!tier || tier.percent <= 0) return NO_FESTIVE;

  const discountINR = Math.round((eligibleINR * tier.percent) / 100);
  // A discount can never exceed what it is discounting.
  const capped = Math.min(discountINR, eligibleINR);
  return {
    eligibleINR,
    discountINR: capped,
    percent: tier.percent,
    gifts: tier.gifts,
    label: tier.gifts
      ? `${tier.percent}% off + ${tier.gifts} free gift${tier.gifts > 1 ? 's' : ''}`
      : `${tier.percent}% off`,
  };
}
