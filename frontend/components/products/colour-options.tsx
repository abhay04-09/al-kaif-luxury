import Link from "next/link";
import type { Product } from "@/types/product";

/**
 * The same design, in its other colours.
 *
 * Each colour is its own piece in the shop — its own photographs, its own
 * price, its own shelf — so these are links, not a selector. A colour that has
 * sold out is still shown and still reachable, crossed through, because a
 * client looking for rose gold should be told it is gone rather than left to
 * wonder whether it ever existed.
 */
const BASE: Record<string, string> = {
  gold: "#C8A24B",
  "antique gold": "#A98334",
  "rose gold": "#D99A8A",
  silver: "#C7CBD1",
  platinum: "#D6D9DD",
  copper: "#B87333",
  bronze: "#9C6B30",
  black: "#1E1E1E",
  white: "#F7F5F0",
  pearl: "#EFE9DC",
  cream: "#F3EAD3",
  ivory: "#F4EEDC",
  beige: "#D9C7A5",
  red: "#B3261E",
  ruby: "#9B1B30",
  maroon: "#6E1B23",
  wine: "#722F37",
  burgundy: "#6D1A2E",
  pink: "#F06292",
  rani: "#C2185B",
  magenta: "#C2287A",
  peach: "#F4B89E",
  coral: "#F0806F",
  salmon: "#F4A092",
  orange: "#E07B2A",
  rust: "#A8501F",
  yellow: "#E3BE3F",
  mustard: "#D4A82A",
  lemon: "#F0DC5A",
  green: "#2FA05B",
  emerald: "#1F7A5A",
  mint: "#9ADCB9",
  olive: "#6B7A3A",
  teal: "#2E7C77",
  turquoise: "#30B3B0",
  blue: "#3A6FB0",
  "sky blue": "#7EC3E8",
  navy: "#20365B",
  purple: "#7B4EA3",
  violet: "#6B4A8C",
  lavender: "#B9A3DD",
  lilac: "#C8A8E0",
  brown: "#7A5236",
  grey: "#8A8D91",
  gray: "#8A8D91",
};

const BASE_KEYS = Object.keys(BASE);

const LIGHTER = /\b(pastel|light|baby|pale|soft)\b/;
const DARKER = /\b(dark|deep|royal)\b/;

/** Blends a colour towards white or black by `amount` (0–1). */
function blend(hex: string, towards: 0 | 255, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const value = (n >> shift) & 255;
    return Math.round(value + (towards - value) * amount)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(16)}${channel(8)}${channel(0)}`;
}

/**
 * The colour to paint for a name the shop has typed.
 *
 * "Pastel pink", "light green" and "dark blue" are the base colour made paler
 * or deeper; "multi" is a ring of colours. A name this does not know gets a
 * quiet neutral rather than a wrong guess.
 */
function swatchFor(name: string): string {
  const key = name.trim().toLowerCase();
  if (/\b(multi|multicolou?r|mixed|rainbow)\b/.test(key)) {
    return "conic-gradient(#E4572E, #F3B63F, #3FA66B, #3A6FB0, #8E54B8, #E4572E)";
  }

  // The colour named first wins ("mint green" is a mint, not a green), and of
  // two starting in the same place the longer wins ("rose gold", not "rose").
  const found = BASE_KEYS.filter((candidate) => key.includes(candidate)).sort(
    (a, b) => key.indexOf(a) - key.indexOf(b) || b.length - a.length
  );
  const base = found[0];
  if (!base) return "#B9B2A4";

  const hex = BASE[base];
  if (LIGHTER.test(key)) return blend(hex, 255, 0.55);
  if (DARKER.test(key)) return blend(hex, 0, 0.35);
  return hex;
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
      <p className="text-xs text-brand-muted">
        <span className="uppercase tracking-luxury">Colour</span>
        {current.colourName ? (
          <>
            {": "}
            <span className="text-porcelain">{current.colourName}</span>
          </>
        ) : null}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3.5">
        {options.map((option) => {
          const isCurrent = option.id === current.id;
          const label = option.colourName?.trim() || "This colour";
          const soldOut = !option.inStock || option.stockQuantity === 0;

          // A round swatch, with a ring around the one being looked at and a
          // slash through one that has sold out.
          const dot = (
            <span
              aria-hidden="true"
              className={`relative block h-8 w-8 overflow-hidden rounded-full border border-black/20 ${
                soldOut ? "opacity-45" : ""
              }`}
              style={{ background: swatchFor(label) }}
            >
              {soldOut ? (
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top right, transparent calc(50% - 1px), rgba(0,0,0,0.7) calc(50% - 1px), rgba(0,0,0,0.7) calc(50% + 1px), transparent calc(50% + 1px))",
                  }}
                />
              ) : null}
            </span>
          );

          const frame =
            "grid h-10 w-10 place-items-center rounded-full border-2 transition";

          // The colour being looked at is marked, not linked to itself.
          return isCurrent ? (
            <span
              aria-current="true"
              aria-label={`${label}, selected`}
              className={`${frame} border-brand-gold`}
              key={option.id}
              title={label}
            >
              {dot}
            </span>
          ) : (
            <Link
              aria-label={soldOut ? `${label}, sold out` : `See this piece in ${label}`}
              className={`${frame} border-transparent hover:border-brand-gold/60`}
              href={`/products/${option.slug}`}
              key={option.id}
              title={soldOut ? `${label} — sold out` : label}
            >
              {dot}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
