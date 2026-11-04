import Image from "next/image";
import Link from "next/link";
import { comboHeadline } from "@/lib/combos";
import { formatPrice } from "@/lib/products";
import type { Combo, Product } from "@/types/product";

/** One combo offer as a card, for the home page's Combo Offers box. */
export function ComboCard({ combo, byId }: { combo: Combo; byId: Map<string, Product> }) {
  const pool = combo.productIds
    .map((id) => byId.get(id))
    .filter((piece): piece is Product => piece !== undefined);
  // The most the same number of pieces could be worth: the honest ceiling of
  // "up to", never a figure that cannot be reached.
  const bestWorth = pool
    .map((piece) => piece.price)
    .sort((a, b) => b - a)
    .slice(0, combo.pieces)
    .reduce((a, b) => a + b, 0);
  const save = bestWorth - combo.price;
  const cover = combo.image ?? pool[0]?.image ?? "";

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-sm transition-all duration-300 hover:shadow-xl"
      href={`/combos/${combo.id}`}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-brand-bg/50">
        {cover ? (
          <Image
            alt={combo.name}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            src={cover}
          />
        ) : null}
        {save > 0 ? (
          <span className="discount-pill absolute left-2 top-2 rounded-full bg-[#8B0000] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
            Save up to {formatPrice(save)}
          </span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="font-serif text-sm leading-snug text-brand-text sm:text-lg">{combo.name}</span>
        <span className="mt-1.5 text-xs font-semibold text-brand-gold sm:text-sm">
          {comboHeadline(combo, formatPrice(combo.price))}
        </span>
        <span className="mt-auto pt-3 text-[0.65rem] font-bold uppercase tracking-luxury text-brand-text group-hover:text-brand-gold">
          Choose your pieces →
        </span>
      </span>
    </Link>
  );
}
