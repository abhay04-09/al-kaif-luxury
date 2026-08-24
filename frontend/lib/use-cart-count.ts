"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/types/product";

const CART_KEY = "al-kaif-cart";

function readCount(): number {
  try {
    const stored = window.localStorage.getItem(CART_KEY);
    if (!stored) return 0;
    return (JSON.parse(stored) as CartItem[]).reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0
    );
  } catch {
    return 0;
  }
}

/**
 * How many pieces are in the bag.
 *
 * Starts at zero on every render so the server and the first client pass agree
 * — the bag lives in localStorage, which the server cannot see, and guessing at
 * it produces a hydration mismatch.
 *
 * Two events are watched: the one the site fires when it changes the bag
 * itself, and the browser's own storage event, which fires when the same client
 * adds a piece in another tab.
 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCount());
    sync();

    window.addEventListener("al-kaif-cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("al-kaif-cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return count;
}
