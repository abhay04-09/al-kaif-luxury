"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  RefreshCw, 
  PackageCheck, 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight
} from "lucide-react";

const campaignSlides = [
  {
    id: 1,
    tagline: "THE MAISON",
    headline: "CRAFTED FOR THE RAREST MOMENTS IN TIME.",
    description: "Designed with silence, proportion, and enduring craft. Every jewel, every fragrance, and every surface is considered with patience, precision, and restraint.",
    usps: ["100% Skin-Friendly Polish", "Artisanal Heritage Craft"],
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=90",
    ctaLink: "/products"
  },
  {
    id: 2,
    tagline: "ROYAL PERFUMERY",
    headline: "SIGNATURE OUD & ATTARS",
    description: "Formulated with rare botanical fragrance oils providing an average longevity of 6 to 10 hours.",
    usps: ["Natural Botanical Extracts", "10+ Hours Scent Projection"],
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1920&q=90",
    ctaLink: "/products?category=perfumes"
  },
  {
    id: 3,
    tagline: "HERITAGE ATELIER",
    headline: "KUNDAN & MEENAKARI JEWELRY",
    description: "Individually handcrafted Jaipur heritage creations, certified for authenticity.",
    usps: ["Handcrafted Artisanal Finish", "Certificate of Authenticity"],
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=90",
    ctaLink: "/products?category=jewellery"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campaignSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = campaignSlides[currentSlide];

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Elevated Campaign Banner Card */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-[24px] border border-gray-200 dark:border-white/10 shadow-2xl bg-black min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex flex-col justify-between">
          {/* High-Res Background Image & Gradient Scrim */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0 z-0"
            >
              <Image
                src={slide.image}
                alt={slide.headline}
                fill
                priority
                className="object-cover opacity-75"
                sizes="(min-width: 1280px) 100vw, 100vw"
              />
              {/* Dark Linear Gradient Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35" />
            </motion.div>
          </AnimatePresence>

          {/* Top Controls Overlay */}
          <div className="relative z-10 p-6 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/70 px-3.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gold-light backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-gold-light animate-spin" />
              AL-KAIF COLLECTION 2026
            </span>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + campaignSlides.length) % campaignSlides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition hover:bg-gold-light hover:text-black"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % campaignSlides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition hover:bg-gold-light hover:text-black"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Card Content Stack (Top to Bottom) */}
          <div className="relative z-10 px-6 sm:px-12 pb-8 pt-6 text-center flex flex-col items-center justify-end max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-4 sm:space-y-6 text-center flex flex-col items-center"
              >
                {/* Sub-brand / Tagline Badge: e.g. THE MAISON */}
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-gold-light">
                  {slide.tagline}
                </p>

                {/* Main Headline: Bold Uppercase Serif Typography (CRAFTED FOR THE RAREST MOMENTS IN TIME) */}
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-none drop-shadow-md">
                  {slide.headline}
                </h1>

                {/* Maison Description Subtitle */}
                <p className="max-w-2xl text-xs sm:text-sm font-light leading-relaxed text-porcelain/85">
                  {slide.description}
                </p>

                {/* Feature Highlights: 2-Column Pill Box Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 max-w-xl w-full my-1">
                  {slide.usps.map((usp) => (
                    <div
                      key={usp}
                      className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-[11px] sm:text-xs font-medium text-porcelain/90 backdrop-blur-md flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-gold-light shrink-0" />
                      <span>{usp}</span>
                    </div>
                  ))}
                </div>

                {/* Primary CTA: Centered Solid White Pill Button */}
                <div className="pt-2">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-extrabold uppercase tracking-luxury text-black shadow-2xl hover:bg-gold-light hover:text-black transition-all transform hover:scale-105 active:scale-95"
                  >
                    <span>EXPLORE NOW</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom USP Ticker Strip inside Card */}
          <div className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-md px-4 py-3 text-white">
            <div className="flex flex-wrap items-center justify-around gap-4 text-center text-[10px] sm:text-xs uppercase tracking-wider text-porcelain/80">
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-gold-light shrink-0" />
                Easy 48h Exchanges
              </span>
              <span className="flex items-center gap-2">
                <PackageCheck className="h-3.5 w-3.5 text-gold-light shrink-0" />
                Tamper-Proof Premium Packaging
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-gold-light shrink-0" />
                Express Insured Delivery Across India
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Diamond / Pill Pagination Indicators */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {campaignSlides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 transition-all duration-300 ${
                currentSlide === index
                  ? "w-8 rounded-full bg-amber-600 dark:bg-gold-light"
                  : "w-2.5 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
