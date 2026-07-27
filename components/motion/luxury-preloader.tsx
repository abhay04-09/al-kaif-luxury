"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LuxuryPreloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(false), 2600);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          aria-label="AL-KAIF experience loading"
          aria-live="polite"
          className="fixed inset-0 z-[100] grid place-items-center bg-obsidian"
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        >
          <motion.div
            className="flex w-full max-w-xl flex-col items-center px-6 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.div
              className="relative h-52 w-52 sm:h-64 sm:w-64"
              initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{
                duration: 1.35,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              <Image
                src="/brand/al-kaif-logo.png"
                alt="AL-KAIF logo"
                fill
                priority
                sizes="256px"
                className="object-contain"
              />
            </motion.div>

            <motion.div
              className="mt-2 h-px w-32 bg-gold"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.65,
                duration: 0.9,
                ease: [0.19, 1, 0.22, 1]
              }}
            />

            <motion.p
              className="mt-6 text-[0.68rem] uppercase tracking-luxury text-gold-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.9,
                duration: 0.8,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              Premium and royal since 2019
            </motion.p>

            <motion.p
              className="mt-3 text-[0.65rem] uppercase tracking-luxury text-mist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1.15,
                duration: 0.8,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              Fine Jewellery & Watches
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}