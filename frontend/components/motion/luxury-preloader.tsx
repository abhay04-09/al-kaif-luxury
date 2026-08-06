"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const SPLASH_SOURCE = "/media/al-kaif-splash.mp4";
const SESSION_KEY = "al-kaif:splash-seen";
const MAX_DURATION_MS = 12000;

export function LuxuryPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    window.sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      setIsVisible(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      dismiss();
      return;
    }

    // Safety net: never trap the visitor if the file stalls or fails to decode.
    const timeout = window.setTimeout(dismiss, MAX_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [dismiss]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVisible || !video) {
      return;
    }

    // Some browsers ignore the autoplay attribute until the element is ready.
    const play = video.play();
    if (play) {
      play.catch(() => dismiss());
    }
  }, [dismiss, isVisible]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          aria-label="AL-KAIF experience loading"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        >
          <video
            ref={videoRef}
            autoPlay
            className="h-full w-full object-contain"
            muted
            onEnded={dismiss}
            onError={dismiss}
            playsInline
            preload="auto"
          >
            <source src={SPLASH_SOURCE} type="video/mp4" />
          </video>

          <button
            className="absolute bottom-8 right-5 min-h-11 border border-gold/50 px-5 py-2 text-[0.65rem] uppercase tracking-luxury text-mist transition duration-500 hover:border-gold-light hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light sm:right-8 lg:right-10"
            onClick={dismiss}
            type="button"
          >
            Skip
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
