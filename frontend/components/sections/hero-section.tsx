"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  PackageCheck, 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Search,
  X
} from "lucide-react";

const searchPlaceholders = [
  "Search for bridal kundan chokers...",
  "Search for meenakari jhumkas & chandbalis...",
  "Search for royal heritage rings & bangles...",
  "Search for necklaces, earrings, bangles, rings...",
  "Search for 100% skin-friendly gold polish jewellery..."
];

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
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campaignSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const slide = campaignSlides[currentSlide];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Elevated Campaign Banner Card */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-[24px] border border-brand-border shadow-2xl bg-black min-h-[560px] sm:min-h-[620px] lg:min-h-[660px] flex flex-col justify-between">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
            </motion.div>
          </AnimatePresence>

          {/* Top Controls Overlay */}
          <div className="relative z-10 p-6 flex items-center justify-end">
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

          {/* Card Content Stack: Headline, Hero Search Bar, CTA */}
          <div className="relative z-10 px-4 sm:px-8 pb-8 pt-4 text-center flex flex-col items-center justify-end max-w-4xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center"
              >
                {/* Main Headline (Big & Bold) */}
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-tight drop-shadow-md max-w-3xl">
                  {slide.headline}
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* Prominent Hero Search Bar (Slightly bigger, automatic) */}
            <div className="w-full max-w-2xl sm:max-w-3xl my-5 sm:my-6">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full shadow-2xl rounded-full group"
              >
                <Search
                  className="absolute left-4 sm:left-5 h-5 w-5 text-gray-400 pointer-events-none transition-colors group-focus-within:text-brand-gold"
                  strokeWidth={2}
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholders[placeholderIndex]}
                  className="w-full rounded-full border-2 border-white/30 bg-white/95 text-gray-900 placeholder:text-gray-500 shadow-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-28 sm:pr-32 text-sm sm:text-base focus:border-brand-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-gold/30 transition-all font-medium"
                />

                <div className="absolute right-2 sm:right-2.5 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1.5 text-gray-400 hover:text-gray-700 transition rounded-full"
                      aria-label="Clear search input"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="rounded-full bg-brand-gold px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-black shadow-md hover:bg-brand-gold-hover hover:scale-105 active:scale-95 transition-all"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Trending Quick Search Chips */}
              <div className="mt-3 sm:mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-white/80 font-semibold drop-shadow-sm text-[11px] sm:text-xs">
                  Trending Searches:
                </span>
                {[
                  { label: "Kundan Chokers", query: "kundan" },
                  { label: "Jhumkas", query: "jhumka" },
                  { label: "Classic Bangles", query: "bangle" },
                  { label: "Royal Rings", query: "ring" },
                  { label: "Mangalsutra", query: "mangalsutra" }
                ].map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag.query);
                      router.push(`/products?search=${encodeURIComponent(tag.query)}`);
                    }}
                    className="rounded-full border border-white/20 bg-black/55 backdrop-blur-md px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs text-white/90 shadow-md transition hover:border-brand-gold hover:bg-brand-gold hover:text-black font-medium"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary CTA: EXPLORE JEWELLERY */}
            <div className="pt-1">
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold text-black hover:bg-brand-gold-hover font-bold px-7 sm:px-9 py-3 sm:py-3.5 text-xs uppercase tracking-luxury shadow-2xl transition-all transform hover:scale-105 active:scale-95"
              >
                <span>EXPLORE JEWELLERY</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
