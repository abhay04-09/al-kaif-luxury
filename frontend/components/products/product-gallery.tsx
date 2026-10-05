"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { ZoomableProductImage } from "./zoomable-product-image";
import { ProductZoomModal } from "./product-zoom-modal";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              className="relative aspect-[4/5] w-full shrink-0 snap-center border border-white/10 bg-onyx rounded-2xl overflow-hidden"
              key={image}
            >
              <ZoomableProductImage
                alt={alt}
                src={image}
                priority={index === 0}
                sizes="(min-width: 1024px) 40vw, 100vw"
                onOpenModal={() => {
                  setActiveIndex(index);
                  setIsModalOpen(true);
                }}
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

        {/* Global Expand Fullscreen Trigger */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="absolute right-3 bottom-5 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black shadow-lg"
        >
          <Maximize2 className="h-3.5 w-3.5 text-gold-light group-hover:text-black" />
          <span>Fullscreen Zoom</span>
        </button>
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

      {/* Fullscreen Zoom Lightbox Modal */}
      <ProductZoomModal
        alt={alt}
        images={images}
        initialIndex={activeIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

