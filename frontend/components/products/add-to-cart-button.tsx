"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
};

const cartStorageKey = "al-kaif-cart";

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addToCart = () => {
    const existing = window.localStorage.getItem(cartStorageKey);
    const cart: Array<{ productId: string; quantity: number }> = existing
      ? JSON.parse(existing)
      : [];
    const line = cart.find((item) => item.productId === product.id);

    if (line) {
      line.quantity += 1;
    } else {
      cart.push({ productId: product.id, quantity: 1 });
    }

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    window.dispatchEvent(new Event("al-kaif-cart-updated"));
  };

  return (
    <button
      className="inline-flex min-h-12 items-center gap-3 border border-gold/70 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition duration-300 hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
      onClick={addToCart}
      type="button"
    >
      <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
      Add to Bag
    </button>
  );
}
