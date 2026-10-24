"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

type ProductRailProps = {
  title: string;
  products: Product[];
};

/**
 * A row of pieces to scroll sideways: swipe on a phone, arrows on a desktop.
 * Each card keeps its own link, so choosing one opens that piece.
 */
export function ProductRail({ title, products }: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section aria-label={title} className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl text-porcelain sm:text-4xl">{title}</h2>
        <div className="hidden gap-2 sm:flex">
          <button
            aria-label={`Scroll ${title} left`}
            className="grid h-10 w-10 place-items-center rounded-full border border-brand-border text-brand-text transition hover:border-brand-gold hover:text-brand-gold"
            onClick={() => scrollBy(-1)}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label={`Scroll ${title} right`}
            className="grid h-10 w-10 place-items-center rounded-full border border-brand-border text-brand-text transition hover:border-brand-gold hover:text-brand-gold"
            onClick={() => scrollBy(1)}
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="mt-6 flex snap-x snap-proximity gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={trackRef}
      >
        {products.map((product) => (
          <div
            className="w-[62%] shrink-0 snap-start sm:w-[34%] md:w-[28%] lg:w-[22%]"
            key={product.id}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
