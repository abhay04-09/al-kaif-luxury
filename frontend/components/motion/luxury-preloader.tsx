"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const LOGO_SRC = "/media/al-kaif-logo.png";
const SESSION_KEY = "al-kaif:splash-seen";
const ANIMATION_DURATION_MS = 2800;

export function LuxuryPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

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

    // Animate progress indicator smoothly
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / ANIMATION_DURATION_MS) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= ANIMATION_DURATION_MS) {
        clearInterval(interval);
        dismiss();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [dismiss]);

  useEffect(() => {
    if (!isVisible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          aria-label="AL-KAIF luxury experience loading"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black select-none"
          exit={{ opacity: 0, scale: 1.04 }}
          initial={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle Ambient Radial Glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.7, 0.4],
              scale: [0.9, 1.1, 1.0],
            }}
            className="absolute h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-amber-900/10 to-transparent blur-3xl pointer-events-none"
            transition={{
              duration: 2.8,
              ease: "easeInOut",
            }}
          />

          {/* Floating Gold Particles (Decorative Ambient Dots) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ y: [0, -30], opacity: [0, 0.6, 0] }}
              className="absolute left-1/4 top-1/3 h-1 w-1 rounded-full bg-amber-300 blur-[0.5px]"
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              animate={{ y: [0, -40], opacity: [0, 0.8, 0] }}
              className="absolute right-1/3 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-400 blur-[0.5px]"
              transition={{ duration: 2.6, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              animate={{ y: [0, -25], opacity: [0, 0.5, 0] }}
              className="absolute left-1/2 bottom-1/3 h-1 w-1 rounded-full bg-amber-200 blur-[0.5px]"
              transition={{ duration: 2.0, repeat: Infinity, delay: 0.8 }}
            />
          </div>

          {/* Main Logo Container */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center justify-center p-4 max-w-sm sm:max-w-md"
            initial={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Animated Logo Image */}
            <div className="relative overflow-hidden rounded-lg">
              <motion.div
                animate={{ opacity: [0.7, 1, 0.9] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <Image
                  alt="AL-KAIF Exports Premium Quality Products"
                  className="h-auto w-64 sm:w-80 object-contain drop-shadow-[0_10px_25px_rgba(217,119,6,0.25)]"
                  height={500}
                  priority
                  src={LOGO_SRC}
                  width={400}
                />
              </motion.div>

              {/* Metallic Light Sweep Effect */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent skew-x-12 pointer-events-none"
                transition={{
                  duration: 1.4,
                  ease: "easeInOut",
                  repeat: 1,
                  repeatDelay: 0.6,
                }}
              />
            </div>

            {/* Minimal Luxury Progress Bar */}
            <div className="mt-8 w-40 sm:w-48 h-[2px] bg-neutral-900 overflow-hidden rounded-full relative">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            {/* Subdued Brand Tagline */}
            <motion.p
              animate={{ opacity: [0, 1] }}
              className="mt-3 text-[0.65rem] uppercase tracking-[0.3em] text-amber-200/60 font-light"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Excellence Since 1998
            </motion.p>
          </motion.div>

          {/* Skip Button */}
          <button
            className="absolute bottom-8 right-6 z-20 min-h-11 border border-amber-500/40 bg-black/40 backdrop-blur-sm px-5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-amber-100/70 transition duration-300 hover:border-amber-400 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:right-8 lg:right-10"
            onClick={dismiss}
            type="button"
          >
            Skip Intro
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
