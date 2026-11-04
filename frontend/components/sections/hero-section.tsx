"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The home page banners. To change one, drop the image in public/banners and
// edit this list; the whole banner is a link to `href`.
const banners = [
  {
    id: "earring-edit",
    image: "/banners/elegance-in-every-detail.webp",
    alt: "The Earring Edit — Elegance in every detail",
    href: "/products?category=jewellery&search=earrings"
  },
  {
    id: "brass-elegance",
    image: "/banners/timeless-brass-elegance.webp",
    alt: "Timeless Brass Elegance — AL-KAIF artificial jewellery",
    href: "/products?category=jewellery&search=ring"
  },
  {
    id: "mangalsutra",
    image: "/banners/timeless-mangalsutra.webp",
    alt: "Timeless Mangalsutra — a symbol of love, a bond forever",
    href: "/products?category=jewellery&search=mangalsutra"
  }
];

const AUTOPLAY_MS = 5000;

export function HeroSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: "smooth"
    });
  }, []);

  // Follow the swipe: whichever banner sits nearest the middle is the active one.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const middle = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const el = child as HTMLElement;
      const distance = Math.abs(el.offsetLeft + el.clientWidth / 2 - middle);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setActive(nearest);
  };

  useEffect(() => {
    if (paused || banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goTo((active + 1) % banners.length), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, paused, goTo]);

  return (
    <section
      className="relative w-full py-3 sm:py-6"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[4%] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 sm:px-[5%] lg:px-[7%] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((banner, index) => (
            <Link
              key={banner.id}
              href={banner.href}
              aria-label={banner.alt}
              className="relative aspect-video w-full shrink-0 snap-center overflow-hidden rounded-xl border border-brand-border shadow-xl sm:rounded-2xl lg:rounded-[24px]"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 86vw, 92vw"
                className="object-cover"
              />
            </Link>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo((active - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition hover:bg-brand-gold hover:text-black md:grid lg:left-6"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo((active + 1) % banners.length)}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition hover:bg-brand-gold hover:text-black md:grid lg:right-6"
              aria-label="Next banner"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => goTo(index)}
              aria-label={`Show banner ${index + 1}`}
              aria-current={active === index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                active === index
                  ? "w-8 bg-brand-gold"
                  : "w-2.5 bg-brand-muted/40 hover:bg-brand-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
