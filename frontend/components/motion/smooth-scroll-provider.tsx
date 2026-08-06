"use client";

import Lenis from "@studio-freight/lenis";
import type { ReactNode } from "react";
import { useEffect } from "react";

export function SmoothScrollProvider({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (time: number) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      wheelMultiplier: 0.82
    });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
