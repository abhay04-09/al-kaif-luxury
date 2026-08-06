"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const editorialLinks = [
  { index: "01", label: "New Arrivals", href: "/products" },
  { index: "02", label: "The Atelier", href: "#story" },
  { index: "03", label: "Rare Fragrances", href: "/products?category=perfumes" }
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] w-full select-none flex-col justify-between overflow-hidden border-b border-graphite/60 bg-onyx px-6 py-6 text-porcelain md:px-12 lg:h-[92vh] lg:py-10">
      <div className="editorial-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-10" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="relative z-10 my-auto grid flex-1 grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        <div className="hidden flex-col justify-between border-r border-graphite/40 pb-6 pr-8 lg:col-span-3 lg:flex">
          <div className="space-y-4 pt-4">
            <span className="block text-[10px] uppercase tracking-regal text-gold">
              Haute Editions
            </span>
            <p className="text-xs font-light leading-relaxed text-mist">
              Fine Jewellery &amp; Rare Fragrances formulated with Jaipur
              heritage gems and Grasse natural oils.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                Founded
              </p>
              <p className="font-accent text-lg italic text-gold-light">
                MCMXCVII
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                Location
              </p>
              <p className="font-accent text-lg italic text-porcelain">
                Global Atelier
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-8 text-center md:px-8 lg:col-span-6">
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="pointer-events-none absolute -inset-4 animate-pulse rounded-full border border-gold/20" />
            <span className="rounded-full border border-gold/30 bg-obsidian/80 px-4 py-1.5 text-[10px] uppercase tracking-[0.6em] text-gold backdrop-blur-md sm:text-[11px] md:tracking-[0.8em]">
              The 2026 Archive Collection
            </span>
          </motion.div>

          <motion.h1
            className="mb-8 font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl md:text-8xl xl:text-9xl"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Timeless
            <br />
            <span className="gold-gradient-text pl-2 font-accent font-normal italic md:pl-10">
              Elegance
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 max-w-md text-xs font-light leading-relaxed tracking-wide text-mist md:text-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Discover the intersection of heritage craftsmanship and modern
            sophistication. A curated journey through the world&apos;s most
            exquisite gold, diamonds &amp; rare oud.
          </motion.p>

          <motion.div
            className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              className="group relative w-full overflow-hidden border border-gold/50 bg-black/40 px-8 py-4 sm:w-auto"
              href="/products?category=jewellery"
            >
              <div className="absolute inset-0 translate-y-full bg-gold transition-transform duration-500 group-hover:translate-y-0" />
              <span className="relative z-10 text-[10px] font-semibold uppercase tracking-imperial text-porcelain transition-colors group-hover:text-onyx md:text-xs">
                Discover Jewellery
              </span>
            </Link>

            <Link
              className="group relative w-full overflow-hidden border border-gold/50 bg-gold/10 px-8 py-4 sm:w-auto"
              href="/products?category=perfumes"
            >
              <div className="absolute inset-0 translate-y-full bg-gold transition-transform duration-500 group-hover:translate-y-0" />
              <span className="relative z-10 text-[10px] font-semibold uppercase tracking-imperial text-gold-light transition-colors group-hover:text-onyx md:text-xs">
                Exotic Perfumes
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="hidden flex-col justify-between border-l border-graphite/40 pb-6 pl-8 lg:col-span-3 lg:flex">
          <div className="flex flex-col space-y-6 pt-4 text-right">
            {editorialLinks.map((item) => (
              <Link className="group" href={item.href} key={item.index}>
                <p className="text-[10px] uppercase tracking-widest text-gold opacity-40 transition-opacity group-hover:opacity-100">
                  {item.index}
                </p>
                <h2 className="flex items-center justify-end gap-1 font-serif text-lg transition-colors group-hover:text-gold">
                  <span>{item.label}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </h2>
              </Link>
            ))}
          </div>

          {/*
           * The reference fills this card with a stock photo of a branded
           * competitor bottle. Left as a gold-washed panel until AL-KAIF's own
           * product photography is available.
           */}
          <Link
            className="group relative h-44 w-full overflow-hidden border border-graphite bg-black/60 p-1 transition-colors hover:border-gold"
            href="/products?category=perfumes"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgb(var(--color-gold)/0.28),transparent_60%)] transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-4 text-left">
              <span className="mb-0.5 block text-[8px] uppercase tracking-[0.2em] text-gold">
                Maison Exclusive
              </span>
              <h3 className="font-serif text-sm text-gold-bright transition-colors group-hover:text-white">
                Signature Oud No. 7
              </h3>
            </div>
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-graphite/40 pt-4 text-[10px] uppercase tracking-imperial text-mist/70">
        <span className="hidden sm:inline">AL-KAIF Heritage Archive</span>

        <a
          className="mx-auto flex items-center gap-2 text-gold-light transition-colors hover:text-gold-bright"
          href="#story"
        >
          <span>Scroll To Explore</span>
          <ChevronDown
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-bounce"
          />
        </a>

        <span className="hidden sm:inline">Est. 1988 Jaipur</span>
      </div>
    </section>
  );
}
