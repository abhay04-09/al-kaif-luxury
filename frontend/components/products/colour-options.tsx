import Link from "next/link";
import type { Product } from "@/types/product";

/**
 * The same design, in its other colours.
 *
 * Each colour is its own piece in the shop — its own photographs, its own
 * price, its own shelf — so these are links, not a selector. A colour that has
 * sold out is still shown and still reachable, because a client looking for
 * rose gold should be told it is gone rather than left to wonder whether it
 * ever existed.
 */
const SWATCHES: Record<string, string> = {
  gold: "#C8A24B",
  "antique gold": "#A98334",
  "rose gold": "#D99A8A",
  silver: "#C7CBD1",
  "silver tone": "#C7CBD1",
  platinum: "#D6D9DD",
  black: "#1E1E1E",
  white: "#F4F2ED",
  pearl: "#EFE9DC",
  red: "#A4262C",
  ruby: "#9B1B30",
  maroon: "#6E1B23",
  pink: "#E39BB4",
  green: "#2F6B4F",
  emerald: "#1F6F54",
  blue: "#2B5C8A",
  navy: "#20365B",
  teal: "#2E7C77",
  purple: "#6B4A8C",
  violet: "#6B4A8C",
  yellow: "#D7B64B",
  orange: "#C96A2B",
  brown: "#7A5236",
  grey: "#8A8D91",
  gray: "#8A8D91",
};

/** A dot for a name we know, and a quiet neutral for one we do not. */
function swatchFor(name: string): string {
  const key = name.trim().toLowerCase();
  if (SWATCHES[key]) return SWATCHES[key];
  const partial = Object.keys(SWATCHES).find((k) => key.includes(k));
  return partial ? SWATCHES[partial] : "#B9B2A4";
}

export function ColourOptions({
  current,
  options,
}: {
  current: Product;
  options: Product[];
}) {
  if (options.length < 2) return null;

  return (
    <div className="mt-6">
      <p className="text-[0.65rem] uppercase tracking-luxury text-brand-muted">
        Colour{current.colourName ? `: ${current.colourName}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isCurrent = option.id === current.id;
          const label = option.colourName?.trim() || "This colour";
          const soldOut = !option.inStock || option.stockQuantity === 0;

          const inner = (
            <>
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                style={{ background: swatchFor(label) }}
              />
              <span className={soldOut ? "line-through opacity-60" : undefined}>{label}</span>
            </>
          );

          const shared =
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition";

          // The colour being looked at is marked, not linked to itself.
          return isCurrent ? (
            <span
              aria-current="true"
              className={`${shared} border-gold-light bg-gold/10 text-porcelain`}
              key={option.id}
            >
              {inner}
            </span>
          ) : (
            <Link
              className={`${shared} border-white/15 text-porcelain/80 hover:border-gold-light hover:text-porcelain`}
              href={`/products/${option.slug}`}
              key={option.id}
              title={soldOut ? `${label} — sold out` : `See this piece in ${label}`}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
