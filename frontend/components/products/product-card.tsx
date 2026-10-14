"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types/product";
import { ProductZoomModal } from "./product-zoom-modal";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // The badge follows the ticks in the admin panel, and nothing else. It used
  // to be decided by category alone, so every piece of jewellery called itself
  // a bestseller from the hour it was added — including pieces that had never
  // been sold. A piece with neither tick simply wears no badge.
  const badgeLabel = product.isNewArrival
    ? "NEW"
    : product.featured
      ? "BESTSELLER"
      : null;

  const mrp = product.mrp;
  const discountPercent =
    mrp && mrp > product.price
      ? Math.round(((mrp - product.price) / mrp) * 100)
      : 0;

  const cardImages = [...new Set([product.image, ...(product.gallery || [])])];

  return (
    <>
      <article className="group h-full flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-card p-3 shadow-sm hover:shadow-xl transition-all duration-300">
        <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col">
          {/* Product Image Container with Top Badge */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-brand-bg/50 p-2 flex items-center justify-center">
            {/* Product Badge — absent unless the shop has ticked something. */}
            {badgeLabel ? (
              <span className="absolute left-2.5 top-2.5 z-10 bg-[#8B0000] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {badgeLabel}
              </span>
            ) : null}

            {/* Quick Zoom Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsZoomOpen(true);
              }}
              aria-label="Quick Zoom Image"
              title="Quick Zoom Image"
              className="absolute right-2.5 top-2.5 z-20 grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition opacity-80 hover:opacity-100 hover:bg-gold-light hover:text-black shadow-sm"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

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
          ) : product.stockQuantity !== null &&
            product.stockQuantity <= product.lowStockThreshold ? (
            /* Low Stock Warning — shown only when the shop's own count is low.
               It used to read "Only 3 Left in Stock!" on every piece, which is
               a scarcity claim nobody had made. */
            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[#8B0000] dark:text-[#FF6B81] text-[10px] font-semibold backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Only {product.stockQuantity} Left in Stock!
            </div>
          ) : null}
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
            {discountPercent > 0 ? (
              <span className="text-[10px] text-brand-muted line-through">
                {formatPrice(mrp!)}
              </span>
            ) : null}
          </div>

          {/* The saving, as a filled oval rather than a tinted rectangle: it is
              the one thing on the card that should catch the eye after the
              photograph, and a pale pink box did not. */}
          {discountPercent > 0 ? (
            <span className="shrink-0 rounded-full bg-[#8B0000] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-[#8B0000]/20">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </Link>
    </article>

    <ProductZoomModal
      alt={product.name}
      images={cardImages}
      isOpen={isZoomOpen}
      onClose={() => setIsZoomOpen(false)}
    />
  </>
  );
}
