"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2400&q=90";

export function HeroSection() {
  return (
    <section className="film-grain relative isolate flex min-h-screen overflow-hidden bg-obsidian">
      <div className="absolute inset-0 -z-20">
        <video
          aria-hidden="true"
          autoPlay
          className="h-full w-full object-cover opacity-75"
          loop
          muted
          playsInline
          poster={heroImage}
        >
          <source src="/media/al-kaif-hero-film.mp4" type="video/mp4" />
        </video>

        <Image
          alt="A refined diamond ring illuminated in warm atelier light"
          className="-z-10 object-cover"
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(var(--color-obsidian)/0.92)_0%,rgb(var(--color-obsidian)/0.68)_42%,rgb(var(--color-obsidian)/0.36)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-obsidian via-obsidian/75 to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl items-end px-5 pb-24 pt-32 sm:px-8 sm:pb-28 lg:px-10 lg:pb-32">
        <motion.div
          className="max-w-4xl"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.15, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        >
          <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
            High Jewellery & Bespoke Perfumes
          </p>

          <h1 className="font-serif text-[clamp(4rem,12vw,10.5rem)] leading-[0.86] text-porcelain">
            AL-KAIF
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-porcelain/78 sm:text-lg">
            A private world of heirloom jewellery and rare bespoke perfumes,
            composed with restraint, rarity, and a devotion to lasting craft.
          </p>

          <div className="mt-10">
            <a
              href="#collections"
              className="group inline-flex min-h-12 items-center gap-3 border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition duration-500 hover:border-gold-light hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            >
              <span>Discover the Collection</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
            </a>
          </div>
        </motion.div>
      </div>

      <motion.a
        aria-label="Scroll to brand story"
        className="absolute bottom-8 right-5 hidden items-center gap-4 text-[0.68rem] uppercase tracking-luxury text-porcelain/70 transition hover:text-gold-light sm:right-8 md:flex lg:right-10"
        href="#story"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.8 }}
      >
        Scroll
        <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
      </motion.a>
    </section>
  );
}