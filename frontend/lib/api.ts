// Client for the AL-KAIFF backend (Hono API on Cloudflare Workers).
// Set NEXT_PUBLIC_API_URL to override; defaults to the deployed Worker.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://al-kaiff-api.adpatel8376.workers.dev";

/** Raw product shape returned by the backend. */
export type ApiProduct = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  subcategory?: string | null;
  priceINR: number;
  mrpINR?: number | null;
  priceUSD?: number;
  image: string;
  secondaryImages?: string[];
  description: string;
  featured?: boolean;
  isNewArrival?: boolean;
  colourName?: string | null;
  colourGroup?: string | null;
  colourHex?: string | null;
  inStock: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number;
  netQuantity?: string | null;
  specifications?: Record<string, unknown>;
  artisanStory?: string;
  sku: string;
  sizes?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
};

/** A combo offer as the backend sends it. */
export type ApiCombo = {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  pieces: number;
  priceINR: number;
  /** The pieces currently on the shelf that the client may choose from. */
  productIds: string[];
};

export type ApiCategory = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: ApiCategory[];
};

/** Server-side fetch with short caching so pages stay fast but fresh. */
export async function apiGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`Backend request failed: ${path}`, error);
    return null;
  }
}
