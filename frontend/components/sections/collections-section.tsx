"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const collectionsList = [
  {
    id: "bridal",
    title: "BRIDAL JEWELRY",
    subtitle: "Heritage Kundan & Meenakari Masterpieces",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=90",
    link: "/products?category=jewellery"
  },
  {
    id: "oud",
    title: "SIGNATURE OUD",
    subtitle: "Rare Botanical Perfume Oils & Attars",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=90",
    link: "/products?category=perfumes"
  },
  {
    id: "everyday",
    title: "EVERYDAY GLAM",
    subtitle: "Minimalist Anti-Tarnish Daily Wear",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=90",
    link: "/products?category=jewellery"
  },
  {
    id: "royal",
    title: "ROYAL KUNDAN",
    subtitle: "Jaipur Heritage Artisan Chokers & Jhumkas",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90",
    link: "/products?category=jewellery"
  }
];

export function CollectionsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  function prevSlide() {
    setActiveIndex((prev) => (prev - 1 + collectionsList.length) % collectionsList.length);
  }

  function nextSlide() {
    setActiveIndex((prev) => (prev + 1) % collectionsList.length);
  }

  return (
    <section id="collections" className="w-full bg-obsidian py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 flex flex-row items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light mb-1">Curated Catalogue</p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold uppercase tracking-wider text-porcelain">
              COLLECTIONS
            </h2>
          </div>

          <Link
            href="/products"
            className="group flex items-center gap-2 text-xs uppercase tracking-luxury text-gold-light hover:text-white transition"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3D Overlapping Card Slider Showcase */}
        <div className="relative my-8 flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
          {/* Navigation Prev Button */}
          <button
            onClick={prevSlide}
            aria-label="Previous Collection"
            className="absolute left-2 sm:left-6 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black shadow-2xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Cards Stack */}
          <div className="relative w-full max-w-lg h-[400px] sm:h-[480px] flex items-center justify-center">
            {collectionsList.map((item, index) => {
              const count = collectionsList.length;
              let offset = (index - activeIndex + count) % count;
              if (offset > count / 2) offset -= count;

              const isCurrent = offset === 0;
              const isPrev = offset === -1 || (activeIndex === 0 && index === count - 1);
              const isNext = offset === 1 || (activeIndex === count - 1 && index === 0);

              let zIndex = 10;
              let scale = 0.85;
              let opacity = 0.4;
              let translateX = 0;

              if (isCurrent) {
                zIndex = 25;
                scale = 1;
                opacity = 1;
                translateX = 0;
              } else if (isPrev) {
                zIndex = 15;
                scale = 0.9;
                opacity = 0.7;
                translateX = -60;
              } else if (isNext) {
                zIndex = 15;
                scale = 0.9;
                opacity = 0.7;
                translateX = 60;
              }

              return (
                <motion.article
                  key={item.id}
                  animate={{
                    scale,
                    opacity,
                    x: translateX,
                    zIndex
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onClick={() => setActiveIndex(index)}
                  className={`absolute w-[280px] sm:w-[360px] h-[380px] sm:h-[460px] rounded-3xl lg:rounded-[24px] overflow-hidden border border-white/20 shadow-2xl cursor-pointer bg-black ${
                    isCurrent ? "ring-2 ring-gold-light/60 shadow-gold/20" : ""
                  }`}
                >
                  {/* Card Background Artwork */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 640px) 360px, 280px"
                    className="object-cover"
                  />

                  {/* Dark Linear Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Bottom Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-2 text-left">
                    <p className="text-[10px] uppercase tracking-widest text-gold-light font-medium">
                      {item.subtitle}
                    </p>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                      {item.title}
                    </h3>
                    
                    <Link
                      href={item.link}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-luxury text-white underline underline-offset-4 decoration-gold-light hover:text-gold-light transition"
                    >
                      <span>SHOP NOW</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Navigation Next Button */}
          <button
            onClick={nextSlide}
            aria-label="Next Collection"
            className="absolute right-2 sm:right-6 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black shadow-2xl"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dash / Pill Pagination Bar */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {collectionsList.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${item.title}`}
              className={`h-2 transition-all duration-300 ${
                activeIndex === index
                  ? "w-8 rounded-full bg-gold-light"
                  : "w-3 rounded-full bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}