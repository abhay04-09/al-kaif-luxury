"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag, X, Zap } from "lucide-react";
import { comboLineId } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import type { CartItem, Combo, ComboPick } from "@/types/product";

/** Only what the picker needs of a piece, so the page sends little. */
export type ComboPiece = {
  id: string;
  name: string;
  price: number;
  image: string;
  kind: string;
  sizes: string[];
};

const CART_KEY = "al-kaif-cart";

type Sort = "shop" | "low" | "high";

/**
 * Choosing the pieces of a combo.
 *
 * The client taps pieces until the combo is full; the price is the shop's, and
 * fixed. What the same pieces would cost bought one by one is shown beside it,
 * live, so the saving is something they can see rather than be told.
 */
export function ComboBuilder({ combo, pieces }: { combo: Combo; pieces: ComboPiece[] }) {
  const router = useRouter();
  const [picks, setPicks] = useState<ComboPick[]>([]);
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState<Sort>("shop");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const byId = useMemo(() => new Map(pieces.map((piece) => [piece.id, piece])), [pieces]);

  const kinds = useMemo(
    () => [...new Set(pieces.map((piece) => piece.kind).filter(Boolean))].sort(),
    [pieces]
  );

  const shown = useMemo(() => {
    const list = kind === "all" ? pieces : pieces.filter((piece) => piece.kind === kind);
    if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [pieces, kind, sort]);

  const full = picks.length >= combo.pieces;
  const chosen = picks.map((pick) => ({ pick, piece: byId.get(pick.productId)! }));
  const worth = chosen.reduce((sum, { piece }) => sum + (piece?.price ?? 0), 0);
  const saving = worth - combo.price;
  const needsSize = chosen.filter(({ pick, piece }) => piece.sizes.length > 0 && !pick.size);
  const ready = full && needsSize.length === 0;

  function toggle(piece: ComboPiece) {
    setError(null);
    setPicks((current) => {
      if (current.some((pick) => pick.productId === piece.id)) {
        return current.filter((pick) => pick.productId !== piece.id);
      }
      if (current.length >= combo.pieces) return current;
      // A piece with only one size needs no asking.
      const size = piece.sizes.length === 1 ? piece.sizes[0] : undefined;
      return [...current, { productId: piece.id, ...(size ? { size } : {}) }];
    });
  }

  function setSize(productId: string, size: string) {
    setError(null);
    setPicks((current) =>
      current.map((pick) => (pick.productId === productId ? { ...pick, size } : pick))
    );
  }

  function commit(): boolean {
    if (!full) {
      setError(`Choose ${combo.pieces - picks.length} more ${combo.pieces - picks.length === 1 ? "piece" : "pieces"} to complete this combo.`);
      return false;
    }
    if (needsSize.length > 0) {
      setError("Please choose a size for each piece that comes in sizes.");
      return false;
    }

    let cart: CartItem[] = [];
    try {
      const stored = window.localStorage.getItem(CART_KEY);
      cart = stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      cart = [];
    }

    const productId = comboLineId(combo.id, picks);
    const line = cart.find((item) => item.productId === productId);
    if (line) {
      line.quantity += 1;
    } else {
      cart.push({
        productId,
        quantity: 1,
        combo: { id: combo.id, name: combo.name, price: combo.price, picks }
      });
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("al-kaif-cart-updated"));
    return true;
  }

  function addToBag() {
    if (!commit()) return;
    setPicks([]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 4000);
  }

  function buyNow() {
    if (!commit()) return;
    router.push("/checkout");
  }

  return (
    <>
      {kinds.length > 1 || pieces.length > 8 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {kinds.length > 1 ? (
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
              {["all", ...kinds].map((value) => (
                <button
                  aria-pressed={kind === value}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs uppercase tracking-luxury transition ${
                    kind === value
                      ? "border-brand-gold bg-brand-gold/15 font-semibold text-brand-gold"
                      : "border-brand-border text-brand-text/80 hover:border-brand-gold"
                  }`}
                  key={value}
                  onClick={() => setKind(value)}
                  type="button"
                >
                  {value === "all" ? "All" : value.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <label className="flex items-center gap-2 text-xs text-mist">
            Sort
            <select
              className="rounded-full border border-brand-border bg-transparent px-3 py-2 text-xs text-porcelain focus:border-brand-gold focus:outline-none"
              onChange={(event) => setSort(event.target.value as Sort)}
              value={sort}
            >
              <option value="shop">Our order</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      ) : null}

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((piece) => {
          const index = picks.findIndex((pick) => pick.productId === piece.id);
          const selected = index >= 0;
          const blocked = full && !selected;
          return (
            <li key={piece.id}>
              <button
                aria-pressed={selected}
                className={`group relative block w-full overflow-hidden rounded-xl border bg-brand-card p-2 text-left transition ${
                  selected
                    ? "border-brand-gold ring-2 ring-brand-gold/60"
                    : blocked
                      ? "border-brand-border opacity-45"
                      : "border-brand-border hover:border-brand-gold"
                }`}
                disabled={blocked}
                onClick={() => toggle(piece)}
                type="button"
              >
                <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-bg/50">
                  <Image
                    alt={piece.name}
                    className="object-contain"
                    fill
                    sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
                    src={piece.image}
                  />
                  {selected ? (
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-brand-gold text-xs font-bold text-black shadow">
                      {index + 1}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block line-clamp-2 min-h-[2.2rem] text-[0.7rem] font-bold uppercase leading-snug tracking-tight text-brand-text sm:text-xs">
                  {piece.name}
                </span>
                <span className="mt-1 block text-xs text-mist">{formatPrice(piece.price)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* The tray stays in view while the client browses, so the count, the
          price and the button never scroll away from the choosing. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-brand-surface/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-8">
          {chosen.length > 0 ? (
            <ul className="mb-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {chosen.map(({ pick, piece }) => (
                <li className="flex shrink-0 items-center gap-2 rounded-full border border-brand-border bg-brand-bg/60 py-1 pl-1 pr-2" key={pick.productId}>
                  <span className="relative h-9 w-9 overflow-hidden rounded-full bg-brand-bg">
                    <Image alt="" className="object-cover" fill sizes="36px" src={piece.image} />
                  </span>
                  {piece.sizes.length > 1 ? (
                    <select
                      aria-label={`Size for ${piece.name}`}
                      className={`rounded-md border bg-transparent px-1.5 py-1 text-xs text-porcelain focus:outline-none ${
                        pick.size ? "border-brand-border" : "border-[#8B0000]"
                      }`}
                      onChange={(event) => setSize(pick.productId, event.target.value)}
                      value={pick.size ?? ""}
                    >
                      <option value="">Size</option>
                      {piece.sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <button
                    aria-label={`Remove ${piece.name}`}
                    className="grid h-6 w-6 place-items-center rounded-full text-mist hover:text-porcelain"
                    onClick={() => toggle(piece)}
                    type="button"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {error ? (
            <p className="mb-2 text-xs font-bold text-[#FF6B81]" role="alert">
              {error}
            </p>
          ) : null}

          {added ? (
            <p className="mb-2 text-xs font-semibold text-brand-gold" role="status">
              Combo added to your bag.{" "}
              <Link className="underline underline-offset-4" href="/cart">
                View bag
              </Link>{" "}
              or choose another set.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-porcelain">
                <span className="font-semibold">
                  {picks.length} of {combo.pieces}
                </span>{" "}
                chosen
                {ready ? <Check aria-hidden="true" className="ml-1 inline h-4 w-4 text-brand-gold" /> : null}
              </p>
              <p className="mt-0.5 text-xs text-mist">
                {picks.length > 0 ? (
                  <>
                    Worth {formatPrice(worth)} ·{" "}
                    <span className="font-semibold text-brand-gold">You pay {formatPrice(combo.price)}</span>
                    {saving > 0 ? ` · You save ${formatPrice(saving)}` : ""}
                  </>
                ) : (
                  <>Combo price {formatPrice(combo.price)} · GST included</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-gold px-5 text-xs font-bold uppercase tracking-luxury text-black transition hover:bg-brand-gold-hover disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!full}
                onClick={addToBag}
                type="button"
              >
                <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                Add to Bag
              </button>
              <button
                className="hidden min-h-11 items-center gap-2 rounded-full border border-brand-gold px-5 text-xs font-bold uppercase tracking-luxury text-brand-gold transition hover:bg-brand-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-45 sm:inline-flex"
                disabled={!full}
                onClick={buyNow}
                type="button"
              >
                <Zap aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
