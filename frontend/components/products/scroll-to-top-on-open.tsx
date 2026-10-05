"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Opens a product page at the top of the product, every time.
 *
 * A client reported arriving at the "You may also like" section instead of the
 * piece they had just clicked. It could not be reproduced here across the
 * listing, the home page, search, related cards, the back button or a slow
 * connection, on either a phone or a desktop — so rather than guess at the
 * browser behaviour behind it, the page now simply puts itself at the top when
 * it opens.
 *
 * A reload is left alone: someone refreshing halfway down a page expects to
 * stay where they were.
 */
export function ScrollToTopOnOpen() {
  const pathname = usePathname();

  useEffect(() => {
    const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (entry?.type === "reload") return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
