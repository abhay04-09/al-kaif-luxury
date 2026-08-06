"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const collections = [
  {
    id: "jewellery",
    label: "High Jewellery",
    title: "Jewellery composed for legacy.",
    description:
      "Diamond, gold, and precious stone creations shaped with quiet opulence.",
    href: "#featured-products",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=90"
  },
  {
    id: "watches",
    label: "Fine Watches",
    title: "Timepieces of mechanical grace.",
    description:
      "Precise watches designed for collectors who value permanence over trend.",
    href: "#featured-products",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1600&q=90"
  }
];

export function CollectionsSection() {
  return (
    <section
      id="collections"
      className="bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-14 max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
            Collections
          </p>

          <h2 className="font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-porcelain">
            Two worlds of rarity.
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {collections.map((collection, index) => (
            <motion.article
              id={collection.id}
              key={collection.id}
              className="group relative min-h-[560px] overflow-hidden border border-graphite bg-onyx"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{
                delay: index * 0.12,
                duration: 1,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-70 transition duration-[1400ms] group-hover:scale-105 group-hover:opacity-85"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <p className="mb-4 text-[0.68rem] uppercase tracking-luxury text-gold-light">
                  {collection.label}
                </p>

                <h3 className="max-w-xl font-serif text-4xl leading-none text-porcelain sm:text-5xl lg:text-6xl">
                  {collection.title}
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-porcelain/70 sm:text-base">
                  {collection.description}
                </p>

                <Link
                  href={collection.href}
                  className="mt-8 inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                >
                  Explore
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}