"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface ProductZoomModalProps {
  images: string[];
  alt: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductZoomModal({
  images,
  alt,
  initialIndex = 0,
  isOpen,
  onClose,
}: ProductZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize index when opening modal or props change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Refs for touch tracking
  const touchStateRef = useRef({
    initialDist: 0,
    initialScale: 1,
    startTouch: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    lastTapTime: 0,
    scale: 1,
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    touchStateRef.current.scale = scale;
    touchStateRef.current.position = position;
  }, [scale, position]);

  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    const el = imageContainerRef.current;
    if (!el) return { x, y };

    const bounds = el.getBoundingClientRect();
    const maxX = (bounds.width * (currentScale - 1)) / 2;
    const maxY = (bounds.height * (currentScale - 1)) / 2;

    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    };
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToImage = (index: number) => {
    resetZoom();
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    if (currentIndex > 0) goToImage(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) goToImage(currentIndex + 1);
  };

  // Keyboard navigation & zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(s + 0.5, 5));
      } else if (e.key === "-") {
        setScale((s) => {
          const next = Math.max(s - 0.5, 1);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, resetZoom]);

  // Touch handlers attached directly to container ref with { passive: false }
  useEffect(() => {
    if (!isOpen) return;
    const el = imageContainerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStateRef.current.initialDist = dist;
        touchStateRef.current.initialScale = touchStateRef.current.scale;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const timeDiff = now - touchStateRef.current.lastTapTime;
        if (timeDiff < 300 && timeDiff > 0) {
          e.preventDefault();
          if (touchStateRef.current.scale > 1.1) {
            resetZoom();
          } else {
            setScale(2.5);
            const rect = el.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left - rect.width / 2;
            const touchY = e.touches[0].clientY - rect.top - rect.height / 2;
            setPosition(clampPosition(-touchX * 1.5, -touchY * 1.5, 2.5));
          }
          touchStateRef.current.lastTapTime = 0;
          return;
        }
        touchStateRef.current.lastTapTime = now;

        if (touchStateRef.current.scale > 1) {
          touchStateRef.current.startTouch = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
          touchStateRef.current.startPos = { ...touchStateRef.current.position };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStateRef.current.initialDist > 0) {
          const ratio = dist / touchStateRef.current.initialDist;
          const nextScale = Math.min(
            Math.max(1, touchStateRef.current.initialScale * ratio),
            5
          );
          setScale(nextScale);
          if (nextScale <= 1) setPosition({ x: 0, y: 0 });
          else setPosition((pos) => clampPosition(pos.x, pos.y, nextScale));
        }
      } else if (e.touches.length === 1 && touchStateRef.current.scale > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStateRef.current.startTouch.x;
        const dy = e.touches[0].clientY - touchStateRef.current.startTouch.y;
        const nextX = touchStateRef.current.startPos.x + dx;
        const nextY = touchStateRef.current.startPos.y + dy;
        setPosition(clampPosition(nextX, nextY, touchStateRef.current.scale));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStateRef.current.initialDist = 0;
      }
      if (touchStateRef.current.scale < 1.05) {
        resetZoom();
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      const nextScale = Math.min(Math.max(1, touchStateRef.current.scale + delta), 5);
      setScale(nextScale);
      if (nextScale <= 1) setPosition({ x: 0, y: 0 });
      else setPosition((pos) => clampPosition(pos.x, pos.y, nextScale));
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
    };
  }, [isOpen, clampPosition, resetZoom]);

  if (!isOpen) return null;

  const currentSrc = images[currentIndex] || images[0];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image Zoom Lightbox"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
      style={{ touchAction: "none" }}
    >
      {/* Top Header Bar */}
      <div className="relative z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-light" />
          <span className="font-serif text-sm tracking-luxury uppercase text-porcelain">
            {alt}
          </span>
          {images.length > 1 && (
            <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Level Indicator */}
          <span className="rounded-full border border-gold-light/30 bg-gold-light/10 px-3 py-1 text-xs font-mono font-bold text-gold-light">
            {Math.round(scale * 100)}%
          </span>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-gold-light hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Zoom Viewport */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-4">
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous Image"
              className="absolute left-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === images.length - 1}
              aria-label="Next Image"
              className="absolute right-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-gold-light hover:text-black disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Interactive Image Container */}
        <div
          ref={imageContainerRef}
          className={`relative h-full w-full max-w-5xl max-h-[80vh] flex items-center justify-center select-none ${
            scale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
          onMouseDown={(e) => {
            if (scale <= 1) return;
            e.preventDefault();
            setIsDragging(true);
            touchStateRef.current.startTouch = { x: e.clientX, y: e.clientY };
            touchStateRef.current.startPos = { ...position };
          }}
          onMouseMove={(e) => {
            if (!isDragging || scale <= 1) return;
            e.preventDefault();
            const dx = e.clientX - touchStateRef.current.startTouch.x;
            const dy = e.clientY - touchStateRef.current.startTouch.y;
            const clamped = clampPosition(
              touchStateRef.current.startPos.x + dx,
              touchStateRef.current.startPos.y + dy,
              scale
            );
            setPosition(clamped);
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div
            className="relative h-full w-full transition-transform duration-100 ease-out flex items-center justify-center"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <Image
              src={currentSrc}
              alt={alt}
              fill
              priority
              sizes="100vw"
              className="object-contain pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Control Dock & Thumbnails */}
      <div className="relative z-30 flex flex-col items-center gap-3 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {/* Mobile touch hint */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
          <span>🤌 Pinch fingertips or double tap/click to zoom in/out</span>
        </div>

        {/* Zoom Controls Bar */}
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/80 p-2 backdrop-blur-xl shadow-2xl">
          <button
            type="button"
            onClick={() =>
              setScale((s) => {
                const next = Math.min(s + 0.5, 5);
                return next;
              })
            }
            disabled={scale >= 5}
            title="Zoom In"
            aria-label="Zoom In"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
          >
            <ZoomIn className="h-4 w-4" />
            <span className="hidden sm:inline">Zoom In</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setScale((s) => {
                const next = Math.max(s - 0.5, 1);
                if (next === 1) setPosition({ x: 0, y: 0 });
                return next;
              })
            }
            disabled={scale <= 1}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
          >
            <ZoomOut className="h-4 w-4" />
            <span className="hidden sm:inline">Zoom Out</span>
          </button>

          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              title="Reset Zoom"
              aria-label="Reset Zoom"
              className="flex items-center gap-1.5 rounded-full bg-gold-light/20 px-3 py-1.5 text-xs font-semibold text-gold-light transition hover:bg-gold-light hover:text-black"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="mt-1 flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-full">
            {images.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => goToImage(idx)}
                className={`relative h-12 w-12 overflow-hidden rounded-lg border transition-all ${
                  currentIndex === idx
                    ? "border-gold-light ring-2 ring-gold-light/40 scale-105"
                    : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
