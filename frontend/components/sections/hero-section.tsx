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
  ArrowRight
} from "lucide-react";

const campaignSlides = [
  {
    id: 1,
    tagline: "THE MAISON",
    headline: "CRAFTED FOR THE RAREST MOMENTS IN TIME.",
    description: "Designed with silence, proportion, and enduring craft — every piece hand-finished in fine gold-tone plating with precision-set stones.",
    usps: ["Skin-Friendly Alloy", "Handcrafted Artisan Finish"],
    video: "/media/intro.mp4",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=90",
    ctaLink: "/products?category=jewellery"
  },
  {
    id: 2,
    tagline: "ROYAL-STYLE BANGLES & CHANDBALIS",
    headline: "STATEMENT BANGLES & DROP EARRINGS",
    description: "Contemporary gold-tone brass creations, designed to look every bit as regal — without the real gold.",
    usps: ["Hand-Set Stone Detail", "Premium Anti-Tarnish Coating"],
    image: "/media/hero-jhumkas.jpg",
    ctaLink: "/products?category=jewellery&search=bangle"
  },
  {
    id: 3,
    tagline: "KUNDAN & MEENAKARI INSPIRED",
    headline: "JAIPUR-STYLE ARTISAN JEWELLERY",
    description: "Handcrafted using traditional Jaipur techniques, reimagined in artificial gold finish for everyday royalty.",
    usps: ["Antique Gold-Tone Polish", "Quality-Checked Craftsmanship"],
    image: "/media/hero-flower-ring.jpg",
    ctaLink: "/products?category=jewellery&search=kundan"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campaignSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = campaignSlides[currentSlide];

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Elevated Campaign Banner Card */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-[24px] border border-brand-border shadow-2xl bg-black min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex flex-col justify-between">
          {/* Background Video / Image & Dark-to-Transparent Scrim */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0 z-0"
            >
              {slide.video ? (
                <video
                  src={slide.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover opacity-80"
                />
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  priority
                  className="object-cover opacity-75"
                  sizes="(min-width: 1280px) 100vw, 100vw"
                />
              )}
              {/* Dark-to-transparent gradient overlays (from-black/90 to-transparent) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Top Controls Overlay */}
          <div className="relative z-10 p-6 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/40 bg-black/70 px-3.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-gold backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-brand-gold animate-spin" />
              AL-KAIF JEWELLERY COLLECTION 2026
            </span>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + campaignSlides.length) % campaignSlides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition hover:bg-brand-gold hover:text-black"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % campaignSlides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition hover:bg-brand-gold hover:text-black"
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
                {/* Sub-brand / Tagline Badge */}
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-brand-gold">
                  {slide.tagline}
                </p>

                {/* Main Headline (Big & Bold) */}
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-none drop-shadow-md">
                  {slide.headline}
                </h1>

                {/* Primary CTA: bg-brand-gold text-black hover:bg-brand-gold-hover font-bold */}
                <div className="pt-2">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold text-black hover:bg-brand-gold-hover font-bold px-8 py-3.5 text-xs uppercase tracking-luxury shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    <span>EXPLORE JEWELLERY</span>
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
                <RefreshCw className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                Easy 48h Exchanges
              </span>
              <span className="flex items-center gap-2">
                <PackageCheck className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                Tamper-Proof Premium Packaging
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-brand-gold shrink-0" />
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
                  ? "w-8 rounded-full bg-brand-gold"
                  : "w-2.5 rounded-full bg-brand-muted/40 hover:bg-brand-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
