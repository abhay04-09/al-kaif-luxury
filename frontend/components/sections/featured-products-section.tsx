"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, Heart } from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/types/product";

type FeaturedProductsSectionProps = {
  products: Product[];
};

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section
      id="featured-products"
      className="bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-14 flex flex-col gap-8 border-t border-graphite pt-12 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          viewport={{ once: true, margin: "-120px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
              Featured Pieces
            </p>

            <h2 className="max-w-3xl font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-porcelain">
              Objects of quiet desire.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-porcelain/65 sm:text-base">
            A considered selection of AL-KAIF jewellery and watches, curated for
            presence, precision, and permanence.
          </p>
        </motion.div>

        <div className="grid gap-px border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product, index) => (
            <motion.article
              className="group bg-obsidian"
              initial={{ opacity: 0, y: 34 }}
              key={product.id}
              transition={{
                delay: index * 0.08,
                duration: 0.9,
                ease: [0.19, 1, 0.22, 1]
              }}
              viewport={{ once: true, margin: "-100px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-onyx">
                <Image
                  alt={product.name}
                  className="object-cover opacity-90 transition duration-[1200ms] group-hover:scale-105 group-hover:opacity-100"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  src={product.image}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition duration-500 group-hover:opacity-100">
                  <button
                    aria-label={`Add ${product.name} to wishlist`}
                    className="grid h-10 w-10 place-items-center border border-white/20 bg-obsidian/60 text-porcelain backdrop-blur-sm transition hover:border-gold hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                    type="button"
                  >
                    <Heart className="h-4 w-4" strokeWidth={1.5} />
                  </button>

                  <Link
                    aria-label={`Quick view ${product.name}`}
                    className="grid h-10 w-10 place-items-center border border-white/20 bg-obsidian/60 text-porcelain backdrop-blur-sm transition hover:border-gold hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                    href={`/products/${product.slug}`}
                  >
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <p className="text-[0.65rem] uppercase tracking-luxury text-gold-light">
                  {product.category}
                </p>

                <h3 className="mt-4 min-h-16 font-serif text-3xl leading-none text-porcelain">
                  {product.name}
                </h3>

                <div className="mt-7 flex items-center justify-between gap-4">
                  <p className="text-sm text-mist">{formatPrice(product.price)}</p>

                  <Link
                    aria-label={`Open details for ${product.name}`}
                    className="inline-flex h-10 w-10 items-center justify-center border border-graphite text-porcelain transition hover:border-gold hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                    href={`/products/${product.slug}`}
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
