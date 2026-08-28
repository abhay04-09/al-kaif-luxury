"use client";

import { ShoppingBag, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartItem, Product } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
};

const cartStorageKey = "al-kaif-cart";

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const sizes = product.sizes ?? [];
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Returns false when the piece could not be placed in the bag, so "Buy Now"
  // knows not to send anyone to a checkout that would not have it.
  const commitToCart = (): boolean => {
    if (!product.inStock) {
      return false;
    }

    if (sizes.length > 0 && !selectedSize) {
      setError("Please choose a size first.");
      return false;
    }

    setError(null);
    const existing = window.localStorage.getItem(cartStorageKey);
    const cart: CartItem[] = existing ? JSON.parse(existing) : [];
    // The same piece in two sizes is two separate lines in the bag.
    const line = cart.find(
      (item) => item.productId === product.id && (item.size ?? null) === (selectedSize ?? null)
    );

    if (line) {
      line.quantity += 1;
    } else {
      cart.push({ productId: product.id, quantity: 1, ...(selectedSize ? { size: selectedSize } : {}) });
    }

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    window.dispatchEvent(new Event("al-kaif-cart-updated"));
    return true;
  };

  const addToCart = () => {
    if (!commitToCart()) return;
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (!commitToCart()) return;
    router.push("/checkout");
  };

  if (!product.inStock) {
    return (
      <div className="grid gap-3">
        <span className="inline-flex min-h-12 w-fit cursor-not-allowed items-center gap-3 border border-white/15 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain/45">
          Sold Out
        </span>
        <p className="text-[0.72rem] text-porcelain/60">
          This piece is currently unavailable. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-[0.65rem] uppercase tracking-luxury text-porcelain/60">
            Size{selectedSize ? `: ${selectedSize}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  setError(null);
                }}
                aria-pressed={selectedSize === size}
                className={`min-h-11 min-w-14 border px-4 text-[0.72rem] uppercase tracking-luxury transition ${
                  selectedSize === size
                    ? "border-gold-light bg-gold-light/15 text-gold-light"
                    : "border-white/15 text-porcelain/80 hover:border-gold-light hover:text-porcelain"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-[0.72rem] text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-3 border border-gold/70 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition duration-300 hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
          onClick={addToCart}
          type="button"
        >
          <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          {added ? "Added to Bag" : "Add to Bag"}
        </button>

        <button
          className="inline-flex min-h-12 items-center justify-center gap-3 border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-gold-light transition duration-300 hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
          onClick={buyNow}
          type="button"
        >
          <Zap aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          Buy Now
        </button>
      </div>
    </div>
  );
}
