"use client";

import { ShoppingBag, Zap, Heart, Tag } from "lucide-react";
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
  const [isWishlisted, setIsWishlisted] = useState(false);

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
    <div className="grid gap-5">
      {/* Requirement 4: "Offer / Coupon Applied" chip: border border-[#8B0000] text-[#8B0000] bg-[#8B0000]/10 */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#8B0000] text-[#8B0000] bg-[#8B0000]/10 px-3.5 py-1.5 text-xs font-bold w-fit shadow-xs">
        <Tag className="h-3.5 w-3.5" />
        <span>FESTIVE25 Offer Applied: Extra 25% OFF at Checkout</span>
      </div>

      {sizes.length > 0 && (
        <div>
          <p className="text-[0.65rem] uppercase tracking-luxury text-brand-muted">
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
                className={`min-h-11 min-w-14 border px-4 text-[0.72rem] uppercase tracking-luxury transition rounded-lg ${
                  selectedSize === size
                    ? "border-brand-gold bg-brand-gold/15 text-brand-gold font-bold"
                    : "border-brand-border text-brand-text hover:border-brand-gold"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-[0.72rem] text-[#8B0000] font-bold">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-gold px-7 py-3 text-xs font-bold uppercase tracking-luxury text-black transition duration-300 hover:bg-brand-gold-hover shadow-lg"
          onClick={addToCart}
          type="button"
        >
          <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {added ? "Added to Bag" : "Add to Bag"}
        </button>

        <button
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-brand-gold px-7 py-3 text-xs font-bold uppercase tracking-luxury text-brand-gold transition duration-300 hover:bg-brand-gold hover:text-black shadow-lg"
          onClick={buyNow}
          type="button"
        >
          <Zap aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          Buy Now
        </button>

        {/* Requirement 4: "Add to Wishlist" heart button active state: fill-[#8B0000] text-[#8B0000] */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label="Add to Wishlist"
          className={`grid h-12 w-12 place-items-center rounded-full border border-brand-border transition-all ${
            isWishlisted
              ? "border-[#8B0000] bg-[#8B0000]/10 shadow-md"
              : "hover:border-[#8B0000] hover:bg-brand-bg"
          }`}
          type="button"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isWishlisted ? "fill-[#8B0000] text-[#8B0000]" : "text-brand-text hover:text-[#8B0000]"
            }`}
            strokeWidth={1.8}
          />
        </button>
      </div>
    </div>
  );
}
