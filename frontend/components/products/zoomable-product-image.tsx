"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

interface ZoomableProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onOpenModal?: () => void;
}

export function ZoomableProductImage({
  src,
  alt,
  fill = true,
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  className = "",
  onOpenModal,
}: ZoomableProductImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs for tracking mutable touch state without re-registering listeners
  const touchStateRef = useRef({
    initialDist: 0,
    initialScale: 1,
    startTouch: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    lastTapTime: 0,
    scale: 1,
    position: { x: 0, y: 0 },
  });

  // Keep ref up to date with current state
  useEffect(() => {
    touchStateRef.current.scale = scale;
    touchStateRef.current.position = position;
  }, [scale, position]);

  // Helper to clamp pan positions based on current scale and container bounds
  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    const el = containerRef.current;
    if (!el) return { x, y };

    const bounds = el.getBoundingClientRect();
    // Maximum overflow allowed in each direction
    const maxX = (bounds.width * (currentScale - 1)) / 2;
    const maxY = (bounds.height * (currentScale - 1)) / 2;

    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    };
  }, []);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.min(prev + 0.5, 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      else setPosition((pos) => clampPosition(pos.x, pos.y, next));
      return next;
    });
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Attach native non-passive event listeners for mobile pinch & pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStateRef.current.initialDist = dist;
        touchStateRef.current.initialScale = touchStateRef.current.scale;
      } else if (e.touches.length === 1) {
        // Double tap detection
        const now = Date.now();
        const timeDiff = now - touchStateRef.current.lastTapTime;
        if (timeDiff < 300 && timeDiff > 0) {
          e.preventDefault();
          if (touchStateRef.current.scale > 1.1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          } else {
            setScale(2.5);
            // Center around touch point
            const rect = el.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left - rect.width / 2;
            const touchY = e.touches[0].clientY - rect.top - rect.height / 2;
            setPosition(clampPosition(-touchX * 1.5, -touchY * 1.5, 2.5));
          }
          touchStateRef.current.lastTapTime = 0;
          return;
        }
        touchStateRef.current.lastTapTime = now;

        // Pan start if zoomed in
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
        // Pinch zooming
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStateRef.current.initialDist > 0) {
          const ratio = dist / touchStateRef.current.initialDist;
          const nextScale = Math.min(
            Math.max(1, touchStateRef.current.initialScale * ratio),
            4
          );
          setScale(nextScale);
          if (nextScale <= 1) {
            setPosition({ x: 0, y: 0 });
          } else {
            setPosition((pos) => clampPosition(pos.x, pos.y, nextScale));
          }
        }
      } else if (e.touches.length === 1 && touchStateRef.current.scale > 1) {
        // Panning zoomed image
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStateRef.current.startTouch.x;
        const dy = e.touches[0].clientY - touchStateRef.current.startTouch.y;
        const nextX = touchStateRef.current.startPos.x + dx;
        const nextY = touchStateRef.current.startPos.y + dy;
        const clamped = clampPosition(nextX, nextY, touchStateRef.current.scale);
        setPosition(clamped);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStateRef.current.initialDist = 0;
      }
      if (touchStateRef.current.scale < 1.05) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (touchStateRef.current.scale > 1 || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.3 : 0.3;
        const nextScale = Math.min(Math.max(1, touchStateRef.current.scale + delta), 4);
        setScale(nextScale);
        if (nextScale <= 1) setPosition({ x: 0, y: 0 });
        else setPosition((pos) => clampPosition(pos.x, pos.y, nextScale));
      }
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
  }, [clampPosition]);

  // Desktop Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    touchStateRef.current.startTouch = { x: e.clientX, y: e.clientY };
    touchStateRef.current.startPos = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const dx = e.clientX - touchStateRef.current.startTouch.x;
    const dy = e.clientY - touchStateRef.current.startTouch.y;
    const nextX = touchStateRef.current.startPos.x + dx;
    const nextY = touchStateRef.current.startPos.y + dy;
    setPosition(clampPosition(nextX, nextY, scale));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden select-none ${
        scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ touchAction: scale > 1 ? "none" : "pan-y" }}
    >
      {/* Zoomed Image Container */}
      <div
        className="h-full w-full transition-transform duration-100 ease-out flex items-center justify-center"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={`object-cover pointer-events-none ${className}`}
        />
      </div>

      {/* Fingertip Pinch & Double-tap hint badge for Mobile */}
      <div
        className={`pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/90 backdrop-blur-md transition-opacity duration-300 ${
          scale > 1 ? "opacity-0" : "opacity-90 group-hover:opacity-100"
        }`}
      >
        <span className="text-gold-light font-bold">🤌</span>
        <span className="hidden sm:inline">Pinch with fingertips or double click to zoom</span>
        <span className="sm:hidden">Pinch or double tap to zoom</span>
      </div>

      {/* Floating Zoom Controls & Fullscreen Trigger */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 p-1 backdrop-blur-md transition-opacity duration-300 opacity-90 hover:opacity-100">
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= 4}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className="grid h-7 w-7 place-items-center rounded-full text-white/90 transition hover:bg-white/20 hover:text-white disabled:opacity-40"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= 1}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          className="grid h-7 w-7 place-items-center rounded-full text-white/90 transition hover:bg-white/20 hover:text-white disabled:opacity-40"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        {scale > 1 && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset Zoom"
            aria-label="Reset Zoom"
            className="grid h-7 w-7 place-items-center rounded-full text-gold-light transition hover:bg-white/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        {onOpenModal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            title="Open Fullscreen Zoom"
            aria-label="Open Fullscreen Zoom"
            className="grid h-7 w-7 place-items-center rounded-full text-white/90 transition hover:bg-gold-light hover:text-black border-l border-white/15 pl-1"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Active Zoom Scale Badge */}
      {scale > 1 && (
        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-gold-light/30 bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold text-gold-light backdrop-blur-md">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}
