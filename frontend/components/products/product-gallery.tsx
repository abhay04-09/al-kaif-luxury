"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductZoomModal } from "./product-zoom-modal";

/**
 * The product's photographs: swipe, or tap an arrow.
 *
 * Zoom lives inside the photograph and nowhere else. On a pointer device the
 * piece magnifies under the cursor, within its own frame; a tap or click opens
 * the viewer, where pinching and the wheel scale the image alone and the page
 * behind stays put. Nothing is drawn over the photograph — the zoom controls
 * that once sat on it were taken off at the shop's request, because they
 * covered the piece a client came to look at.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

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

  // Keeps the magnified point under the cursor. Written straight to the image
  // so a mouse move does not re-render the page.
  function followPointer(event: React.MouseEvent<HTMLButtonElement>) {
    const frame = event.currentTarget.getBoundingClientRect();
    const image = event.currentTarget.querySelector("img");
    if (!image) return;
    const x = ((event.clientX - frame.left) / frame.width) * 100;
    const y = ((event.clientY - frame.top) / frame.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
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
            <button
              aria-label={`Zoom image ${index + 1} of ${images.length}`}
              className="group relative aspect-[4/5] w-full shrink-0 cursor-zoom-in snap-center overflow-hidden rounded-2xl border border-white/10 bg-onyx"
              key={image}
              onClick={() => {
                setActiveIndex(index);
                setZoomOpen(true);
              }}
              onMouseMove={followPointer}
              type="button"
            >
              <Image
                alt={alt}
                className="object-cover transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:scale-[2]"
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={image}
              />
            </button>
          ))}
        </div>

        {/* The only thing over the photograph, and barely there until needed. */}
        {images.length > 1 ? (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:pointer-events-none disabled:opacity-0"
              disabled={activeIndex === 0}
              onClick={() => goTo(activeIndex - 1)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:pointer-events-none disabled:opacity-0"
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
                  : "w-2 rounded-full bg-black/15 hover:bg-black/30"
              }`}
              key={image}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}

      <ProductZoomModal
        alt={alt}
        images={images}
        initialIndex={activeIndex}
        isOpen={zoomOpen}
        onClose={() => setZoomOpen(false)}
      />
    </div>
  );
}
