"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden border border-white/10 bg-onyx"
              key={image}
            >
              <Image
                alt={alt}
                className="object-cover"
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={image}
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black disabled:pointer-events-none disabled:opacity-0"
              disabled={activeIndex === 0}
              onClick={() => goTo(activeIndex - 1)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black disabled:pointer-events-none disabled:opacity-0"
              disabled={activeIndex === images.length - 1}
              onClick={() => goTo(activeIndex + 1)}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((image, index) => (
            <button
              aria-label={`Show image ${index + 1} of ${images.length}`}
              className={`h-2 transition-all duration-300 ${
                activeIndex === index
                  ? "w-6 rounded-full bg-gold-light"
                  : "w-2 rounded-full bg-white/25 hover:bg-white/40"
              }`}
              key={image}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
