"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

type FeaturedProductsSectionProps = {
  products: Product[];
};

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section id="featured-products" className="w-full bg-gray-50 dark:bg-obsidian py-16 sm:py-24 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 dark:border-white/10 pb-6">
          <div>
            <p className="text-[0.7rem] uppercase tracking-luxury text-amber-700 dark:text-gold-light mb-1">
              Curated Catalogue
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold uppercase tracking-wider text-gray-900 dark:text-porcelain">
              FEATURED CREATIONS
            </h2>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-amber-700 dark:text-gold-light hover:text-black dark:hover:text-white transition"
          >
            <span>EXPLORE ALL PRODUCTS</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Catalog Grid (Strict 2x2 Mobile Layout: grid-cols-2 gap-3 p-3 -> md:grid-cols-4 md:gap-6) */}
        <div className="grid grid-cols-2 gap-3 p-1 sm:p-3 md:grid-cols-4 md:gap-6 items-stretch">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
