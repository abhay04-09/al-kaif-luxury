"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  // Deterministic badge based on product category or ID
  const badgeConfig = 
    product.category === "jewellery"
      ? { label: "✨ BESTSELLER", style: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-gold-light dark:border-gold/40" }
      : product.category === "perfumes"
      ? { label: "⭐ MUST TRY", style: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-500/40" }
      : { label: "♥ FAN FAVORITE", style: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/40" };

  // Calculate simulated original price for strikethrough comparison
  const originalPrice = Math.round(product.price * 1.35);

  return (
    <article className="group h-full flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-onyx/80 p-3 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Product Image Container with Top Badge */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-black/60 p-2 flex items-center justify-center">
          {/* Top Tag / Badge on Top-Left */}
          <span
            className={`absolute left-2.5 top-2.5 z-10 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${badgeConfig.style}`}
          >
            {badgeConfig.label}
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

          {!product.inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-black/85 py-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-xs">
              Sold Out
            </div>
          )}
        </div>

        {/* Action Button: Positioned directly below the image */}
        <div className="mt-3">
          <button
            type="button"
            className="w-full rounded-full border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 py-2 px-3 text-[10px] font-bold uppercase tracking-luxury text-gray-900 dark:text-porcelain hover:bg-amber-600 hover:text-white dark:hover:bg-gold-light dark:hover:text-obsidian transition-colors shadow-xs"
          >
            {product.category === "jewellery" ? "SELECT VARIANT" : "SELECT MODEL"}
          </button>
        </div>

        {/* Product Title Clamped to 2 lines */}
        <div className="mt-3 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-gold-light mb-1">
            {product.collection || "AL-KAIF COLLECTION"}
          </p>
          <h3 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-tight text-gray-900 dark:text-porcelain line-clamp-2 min-h-[32px] leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Pricing Row: Selling Price & Strikethrough Original Price */}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm text-gray-900 dark:text-porcelain">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-porcelain/40 line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            25% OFF
          </span>
        </div>
      </Link>
    </article>
  );
}
