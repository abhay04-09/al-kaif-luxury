"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCartSummary } from "@/lib/cart";
import { useCatalogue } from "@/lib/use-catalogue";
import { formatPrice } from "@/lib/products";
import type { CartItem } from "@/types/product";

const cartStorageKey = "al-kaif-cart";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(cartStorageKey);
    setItems(stored ? JSON.parse(stored) : []);
  }, []);

  const { catalogue } = useCatalogue();
  const summary = useMemo(() => getCartSummary(items, catalogue), [items, catalogue]);

  const persist = (nextItems: CartItem[]) => {
    setItems(nextItems);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("al-kaif-cart-updated"));
  };

  // A piece taken in two sizes is two separate lines, so the size has to match
  // as well as the id before a line is changed.
  const isSameLine = (item: CartItem, productId: string, size?: string) =>
    item.productId === productId && (item.size ?? null) === (size ?? null);

  const updateQuantity = (
    productId: string,
    size: string | undefined,
    direction: "increase" | "decrease"
  ) => {
    const nextItems = items
      .map((item) =>
        isSameLine(item, productId, size)
          ? {
              ...item,
              quantity:
                direction === "increase"
                  ? item.quantity + 1
                  : Math.max(0, item.quantity - 1)
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    persist(nextItems);
  };

  const removeItem = (productId: string, size?: string) => {
    persist(items.filter((item) => !isSameLine(item, productId, size)));
  };

  if (summary.lines.length === 0) {
    return (
      <section className="mx-auto min-h-screen max-w-4xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Shopping Bag</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Your bag is empty.</h1>
        <p className="mt-5 text-porcelain/70">Explore the collection and add your first piece.</p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
          href="/products"
        >
          Shop Collection
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div>
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Shopping Bag</p>
          <h1 className="mt-4 font-serif text-5xl text-porcelain">Selected Pieces</h1>
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {summary.lines.map(({ product, quantity, size, lineTotal }) => (
              <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto]" key={`${product.id}-${size ?? ""}`}>
                <div>
                  <p className="text-xs uppercase tracking-luxury text-gold-light">
                    {product.collection}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-porcelain">{product.name}</h2>
                  <p className="mt-2 text-sm text-porcelain/60">{product.material}</p>
                  {size && (
                    <p className="mt-2 text-xs uppercase tracking-luxury text-porcelain/70">
                      Size: <span className="text-gold-light">{size}</span>
                    </p>
                  )}
                  <p className="mt-4 text-sm text-porcelain/80">{formatPrice(lineTotal)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    aria-label={`Decrease ${product.name} quantity`}
                    className="grid h-10 w-10 place-items-center border border-white/10 text-porcelain transition hover:border-gold-light hover:text-gold-light"
                    onClick={() => updateQuantity(product.id, size, "decrease")}
                    type="button"
                  >
                    <Minus aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm text-porcelain">{quantity}</span>
                  <button
                    aria-label={`Increase ${product.name} quantity`}
                    className="grid h-10 w-10 place-items-center border border-white/10 text-porcelain transition hover:border-gold-light hover:text-gold-light"
                    onClick={() => updateQuantity(product.id, size, "increase")}
                    type="button"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Remove ${product.name}`}
                    className="grid h-10 w-10 place-items-center border border-white/10 text-porcelain transition hover:border-gold-light hover:text-gold-light"
                    onClick={() => removeItem(product.id, size)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="h-fit border border-white/10 bg-onyx p-6">
          <h2 className="font-serif text-3xl text-porcelain">Order Summary</h2>
          <div className="mt-6 space-y-4 text-sm text-porcelain/72">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4 text-base text-porcelain">
              <span>Total</span>
              <span>{formatPrice(summary.total)}</span>
            </div>
          </div>
          <Link
            className="mt-8 flex min-h-12 items-center justify-center bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light"
            href="/checkout"
          >
            Continue to Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
