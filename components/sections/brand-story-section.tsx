"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const atelierImage =
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1600&q=90";

const detailImage =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=90";

export function BrandStorySection() {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
            The Maison
          </p>

          <h2 className="max-w-2xl font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-porcelain">
            Crafted for the rarest moments in time.
          </h2>

          <div className="mt-8 h-px w-24 bg-gold" />

          <p className="mt-8 max-w-xl text-base leading-8 text-mist sm:text-lg">
            AL-KAIF is shaped by a quiet devotion to permanence. Every jewel,
            every timepiece, and every surface is considered with patience,
            precision, and restraint.
          </p>

          <p className="mt-6 max-w-xl text-base leading-8 text-porcelain/70">
            Our pieces are composed for those who value detail over spectacle,
            legacy over trend, and craftsmanship that reveals itself slowly.
          </p>
        </motion.div>

        <motion.div
          className="relative min-h-[560px]"
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="absolute right-0 top-0 h-[78%] w-[82%] overflow-hidden">
            <Image
              src={atelierImage}
              alt="Luxury jewellery atelier with refined craftsmanship details"
              fill
              sizes="(min-width: 1024px) 48vw, 90vw"
              className="object-cover transition duration-1000 hover:scale-105"
            />
          </div>

          <div className="absolute bottom-0 left-0 h-[42%] w-[48%] overflow-hidden border border-graphite bg-onyx">
            <Image
              src={detailImage}
              alt="Close detail of fine jewellery craftsmanship"
              fill
              sizes="(min-width: 1024px) 24vw, 55vw"
              className="object-cover transition duration-1000 hover:scale-105"
            />
          </div>

          <div className="absolute bottom-10 right-8 hidden max-w-48 border-l border-gold pl-5 text-sm leading-6 text-porcelain/70 sm:block">
            Designed with silence, proportion, and enduring material beauty.
          </div>
        </motion.div>
      </div>
    </section>
  );
}