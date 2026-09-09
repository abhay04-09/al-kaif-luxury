"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartDrawerContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleCartUpdated = (event: Event) => {
      // If event contains details to open drawer, or whenever an item is added
      const customEvent = event as CustomEvent<{ openDrawer?: boolean }>;
      if (customEvent.detail?.openDrawer !== false) {
        setIsOpen(true);
      }
    };

    window.addEventListener("al-kaif-cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("al-kaif-cart-updated", handleCartUpdated);
    };
  }, []);

  return (
    <CartDrawerContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return context;
}
