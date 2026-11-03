/**
 * Combos — "any 4 earrings for ₹899".
 *
 * The shop sets how many pieces, what they cost together, and what the client
 * may choose from. Everything that decides money lives here and is applied on
 * the server; the storefront only displays it.
 */

export interface Combo {
  id: string;
  name: string;
  description: string;
  image: string | null;
  /** How many pieces the client picks. */
  pieces: number;
  /** What the whole combo costs. */
  priceINR: number;
  /** Category or sub-category ids the client may pick from. */
  categories: string[];
  /** Individual pieces on offer in addition to those categories. */
  productIds: string[];
  active: boolean;
  sort: number;
  createdAt: string | null;
}

/** The few columns of a product that deciding "is it in this combo" needs. */
export interface PoolProduct {
  id: string;
  category: string | null;
  subcategory: string | null;
  priceINR: number;
}

export function rowToCombo(r: any): Combo {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    image: r.image ?? null,
    pieces: Number(r.pieces),
    priceINR: Number(r.price_inr),
    categories: r.categories ?? [],
    productIds: r.product_ids ?? [],
    active: Boolean(r.active),
    sort: Number(r.sort ?? 0),
    createdAt: r.created_at ?? null,
  };
}

const norm = (value: unknown) => String(value ?? '').trim().toLowerCase();

/** True when a piece is one the client may pick for this combo. */
export function inPool(
  combo: Pick<Combo, 'categories' | 'productIds'>,
  product: { id: string; category?: string | null; subcategory?: string | null }
): boolean {
  if (combo.productIds.includes(product.id)) return true;
  const sub = norm(product.subcategory);
  const cat = norm(product.category);
  return combo.categories.some(id => {
    const wanted = norm(id);
    return wanted !== '' && (wanted === sub || wanted === cat);
  });
}

/**
 * Splits `total` rupees across pieces in proportion to `weights`, in whole
 * rupees that add back up to exactly `total`.
 *
 * Each piece is recorded on the order at its share of the combo price, so that
 * stock, refunds and GST all keep working piece by piece. The leftover rupees
 * go to the pieces with the largest remainders, never to a negative price.
 */
export function allocate(total: number, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const sum = weights.reduce((a, b) => a + Math.max(0, b), 0);
  const safe = sum > 0 ? weights.map(w => Math.max(0, w)) : weights.map(() => 1);
  const safeSum = safe.reduce((a, b) => a + b, 0);

  const exact = safe.map(w => (total * w) / safeSum);
  const shares = exact.map(Math.floor);
  let left = total - shares.reduce((a, b) => a + b, 0);

  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let i = 0; left > 0; i = (i + 1) % n, left--) shares[order[i].index] += 1;
  return shares;
}

/** What the shop typed, made safe to store — or the reason it cannot be. */
export function comboToRow(
  body: Record<string, unknown>,
  { partial }: { partial: boolean }
): { row: Record<string, unknown>; problem?: string } {
  const row: Record<string, unknown> = {};
  const has = (key: string) => body[key] !== undefined;

  if (!partial || has('name')) {
    const name = String(body.name ?? '').trim().slice(0, 120);
    if (!name) return { row, problem: 'Give the combo a name' };
    row.name = name;
  }
  if (has('description')) {
    row.description = String(body.description ?? '').trim().slice(0, 600) || null;
  }
  if (has('image')) {
    row.image = String(body.image ?? '').trim() || null;
  }
  if (!partial || has('pieces')) {
    const pieces = Math.floor(Number(body.pieces));
    if (!Number.isFinite(pieces) || pieces < 1 || pieces > 20) {
      return { row, problem: 'Pieces must be a whole number from 1 to 20' };
    }
    row.pieces = pieces;
  }
  if (!partial || has('priceINR')) {
    const price = Math.round(Number(body.priceINR));
    if (!Number.isFinite(price) || price < 1 || price > 1_000_000) {
      return { row, problem: 'Enter the combo price in rupees' };
    }
    row.price_inr = price;
  }

  const list = (value: unknown, max: number) =>
    Array.isArray(value)
      ? [...new Set(value.map(v => String(v ?? '').trim()).filter(Boolean))].slice(0, max)
      : [];
  if (has('categories')) row.categories = list(body.categories, 40);
  if (has('productIds')) row.product_ids = list(body.productIds, 500);

  if (has('active')) row.active = body.active === true;
  if (has('sort')) row.sort = Math.floor(Number(body.sort) || 0);
  return { row };
}
