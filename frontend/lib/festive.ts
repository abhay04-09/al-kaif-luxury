import { apiGet } from "@/lib/api";

/**
 * The festive offer, as the maison is advertising it.
 *
 * Only what the window needs: the discount itself is worked out by the Worker
 * from the catalogue when the basket is priced, so nothing here can decide
 * what anyone is charged. If the offer is off, or the API cannot be reached,
 * the site simply carries no offer — never a promise it cannot keep.
 */
export type FestiveTier = {
  minINR: number;
  percent: number;
  gifts: number;
};

export type FestiveOffer = {
  enabled: boolean;
  title: string;
  subtitle: string;
  keyword: string;
  tiers: FestiveTier[];
};

export async function getFestiveOffer(): Promise<FestiveOffer | null> {
  const offer = await apiGet<Partial<FestiveOffer>>("/api/festive", 60);
  if (!offer?.enabled || !Array.isArray(offer.tiers) || offer.tiers.length === 0) {
    return null;
  }
  return {
    enabled: true,
    title: offer.title ?? "Festive Season Sale",
    subtitle: offer.subtitle ?? "",
    keyword: (offer.keyword ?? "").toLowerCase(),
    tiers: offer.tiers,
  };
}

/**
 * Whether a piece takes part.
 *
 * The same rule the Worker applies when it prices the basket — the keyword in
 * the name or the description — so a piece never advertises a discount that
 * the checkout then declines to give.
 */
export function qualifiesForOffer(
  product: { name?: string | null; description?: string | null },
  keyword: string
): boolean {
  if (!keyword) return false;
  return `${product.name ?? ""} ${product.description ?? ""}`
    .toLowerCase()
    .includes(keyword);
}

/** "₹3,000 and above" / "Up to ₹1,000" — how a tier reads in the window. */
export function tierRange(tiers: FestiveTier[], index: number): string {
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const sorted = [...tiers].sort((a, b) => a.minINR - b.minINR);
  const tier = sorted[index];
  const next = sorted[index + 1];
  if (!tier) return "";
  if (!next) return `${inr(tier.minINR)} and above`;
  if (tier.minINR === 0) return `Up to ${inr(next.minINR - 1)}`;
  return `${inr(tier.minINR)} – ${inr(next.minINR - 1)}`;
}
