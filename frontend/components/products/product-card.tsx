"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  // Deterministic badge label
  const badgeLabel = 
    product.category === "jewellery"
      ? "✨ BESTSELLER"
      : product.category === "perfumes"
      ? "⭐ MUST TRY"
      : "♥ FAN FAVORITE";

  // Calculate simulated original price for strikethrough comparison
  const originalPrice = Math.round(product.price * 1.35);

  return (
    <article className="group h-full flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-card p-3 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Product Image Container with Top Badge */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-brand-bg/50 p-2 flex items-center justify-center">
          {/* Product Badge ("FAN FAVORITE", "BESTSELLER", "HOT"): bg-[#8B0000] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm */}
          <span className="absolute left-2.5 top-2.5 z-10 bg-[#8B0000] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            {badgeLabel}
          </span>

          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`object-contain transition-transform duration-500 group-hover:scale-105 ${
              product.inStock ? "" : "opacity-45 grayscale"
            }`}
          />

          {!product.inStock ? (
            <div className="absolute inset-x-0 bottom-0 bg-black/85 py-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-xs">
              Sold Out
            </div>
          ) : (
            /* Low Stock Warning */
            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[#8B0000] dark:text-[#FF6B81] text-[10px] font-semibold backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Only 3 Left in Stock!
            </div>
          )}
        </div>

        {/* Action Button: "Select Model" / "Select Variant" button: border border-brand-border hover:bg-brand-gold hover:text-black transition */}
        <div className="mt-3">
          <button
            type="button"
            className="w-full rounded-full border border-brand-border bg-brand-surface py-2 px-3 text-[10px] font-bold uppercase tracking-luxury text-brand-text hover:bg-brand-gold hover:text-black transition-colors shadow-xs"
          >
            {product.category === "jewellery" ? "SELECT VARIANT" : "SELECT MODEL"}
          </button>
        </div>

        {/* Product Title: text-brand-text font-bold uppercase clamped to 2 lines */}
        <div className="mt-3 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold mb-1">
            {product.collection || "AL-KAIF COLLECTION"}
          </p>
          <h3 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-tight text-brand-text line-clamp-2 min-h-[32px] leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Pricing Row: Selling Price (text-brand-gold font-extrabold) & Original Price (text-brand-muted line-through) */}
        <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-sm text-brand-gold">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-brand-muted line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>

          {/* Discount Percentage Badge: bg-[#8B0000]/15 text-[#8B0000] dark:text-[#FF6B81] text-[11px] font-bold px-1.5 py-0.5 rounded */}
          <span className="bg-[#8B0000]/15 text-[#8B0000] dark:text-[#FF6B81] text-[11px] font-bold px-1.5 py-0.5 rounded">
            25% OFF
          </span>
        </div>
      </Link>
    </article>
  );
}
