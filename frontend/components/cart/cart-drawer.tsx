"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useCartDrawer } from "@/components/cart/cart-drawer-context";
import { getCartSummary } from "@/lib/cart";
import { useCatalogue } from "@/lib/use-catalogue";
import { formatPrice } from "@/lib/products";
import type { CartItem } from "@/types/product";

const CART_KEY = "al-kaif-cart";

export function CartDrawer() {
  const { isOpen, closeCart } = useCartDrawer();
  const [items, setItems] = useState<CartItem[]>([]);
  const { catalogue } = useCatalogue();

  // Load and sync cart items
  useEffect(() => {
    const syncCart = () => {
      try {
        const stored = window.localStorage.getItem(CART_KEY);
        setItems(stored ? JSON.parse(stored) : []);
      } catch {
        setItems([]);
      }
    };

    syncCart();

    window.addEventListener("al-kaif-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("al-kaif-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  // Lock body scroll when drawer is open
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

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  const summary = useMemo(() => getCartSummary(items, catalogue), [items, catalogue]);

  const persist = (nextItems: CartItem[]) => {
    setItems(nextItems);
    window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("al-kaif-cart-updated"));
  };

  const isSameLine = (item: CartItem, productId: string, size?: string) =>
    item.productId === productId && (item.size ?? null) === (size ?? null);

  const updateQuantity = (
    productId: string,
    size: string | undefined,
    direction: "increase" | "decrease"
  ) => {
    const nextItems = items
      .map((item) =>
        isSameLine(item, productId, size)
          ? {
              ...item,
              quantity:
                direction === "increase"
                  ? item.quantity + 1
                  : Math.max(0, item.quantity - 1)
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    persist(nextItems);
  };

  const removeItem = (productId: string, size?: string) => {
    persist(items.filter((item) => !isSameLine(item, productId, size)));
  };

  const totalItemCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-brand-surface border-l border-brand-border shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right sm:max-w-lg">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border bg-brand-surface/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl font-medium tracking-wide text-brand-text">
                Your Cart
              </h2>
              {totalItemCount > 0 && (
                <span className="rounded-full bg-[#8B0000] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              type="button"
              className="rounded-full p-2 text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors focus:outline-none"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Complimentary Shipping Banner */}
          {totalItemCount > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-brand-gold/15 to-amber-500/10 px-6 py-2.5 border-b border-brand-gold/20 flex items-center gap-2 text-xs text-brand-text">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
              <span>
                You qualify for <strong className="font-semibold text-brand-gold">FREE Express Shipping</strong> & Luxury Packaging!
              </span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {summary.lines.length === 0 ? (
              /* EMPTY CART STATE (Matching Reference Image Style) */
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                {/* Empty Cart Illustration / Icon Container */}
                <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-brand-bg border border-brand-border shadow-inner">
                  <div className="relative">
                    <ShoppingBag className="h-12 w-12 text-brand-muted stroke-[1.2]" />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-brand-bg font-bold text-[0.65rem]">
                      0
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-medium text-brand-text">
                  Your cart is feeling lonely
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-brand-muted max-w-xs leading-relaxed">
                  Explore our luxury Kundan, Meenakari & handcrafted bridal jewellery collections to add elegance to your wardrobe.
                </p>

                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] hover:bg-black text-white dark:bg-brand-gold dark:text-obsidian dark:hover:bg-gold-light px-8 py-3.5 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md hover:scale-[1.02]"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* POPULATED CART ITEMS LIST */
              <div className="divide-y divide-brand-border">
                {summary.lines.map(({ product, quantity, size, lineTotal }) => (
                  <div
                    key={`${product.id}-${size ?? ""}`}
                    className="py-4 flex gap-4 first:pt-0 last:pb-0"
                  >
                    {/* Item Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={closeCart}
                      className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-md border border-brand-border bg-brand-bg group"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[0.65rem] uppercase tracking-luxury font-semibold text-brand-gold">
                              {product.collection}
                            </span>
                            <h4 className="font-serif text-base font-medium text-brand-text line-clamp-1">
                              <Link
                                href={`/products/${product.slug}`}
                                onClick={closeCart}
                                className="hover:text-brand-gold transition-colors"
                              >
                                {product.name}
                              </Link>
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(product.id, size)}
                            className="text-brand-muted hover:text-[#8B0000] p-1 transition-colors"
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>

                        {!product.inStock && (
                          <span className="inline-block mt-1 text-[0.65rem] uppercase font-bold text-red-500">
                            Sold Out
                          </span>
                        )}

                        <p className="text-xs text-brand-muted mt-0.5 line-clamp-1">
                          {product.material}
                        </p>

                        {size && (
                          <span className="inline-block mt-1 rounded bg-brand-bg px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-brand-text font-medium border border-brand-border">
                            Size: {size}
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector & Price */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-brand-border bg-brand-bg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, size, "decrease")}
                            className="p-1.5 text-brand-muted hover:text-brand-text transition-colors rounded-l-full"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-brand-text">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, size, "increase")}
                            className="p-1.5 text-brand-muted hover:text-brand-text transition-colors rounded-r-full"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-semibold text-brand-text">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (If items in cart) */}
          {summary.lines.length > 0 && (
            <div className="border-t border-brand-border bg-brand-surface p-6 space-y-4">
              <div className="space-y-2 text-xs text-brand-muted">
                <div className="flex justify-between text-sm text-brand-text">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-brand-border text-base font-serif text-brand-text">
                  <span>Total (Incl. Taxes)</span>
                  <span className="font-bold font-sans text-lg">{formatPrice(summary.total)}</span>
                </div>
              </div>

              {summary.hasSoldOut ? (
                <div className="rounded-lg bg-red-500/10 p-3 text-center text-xs font-medium text-red-500">
                  Please remove sold-out pieces to continue.
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1A1A1A] hover:bg-black text-white dark:bg-brand-gold dark:text-obsidian dark:hover:bg-gold-light py-3.5 text-xs uppercase tracking-luxury font-semibold transition-all shadow-md hover:scale-[1.01]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex w-full items-center justify-center rounded-full border border-brand-border py-2.5 text-xs uppercase tracking-luxury font-medium text-brand-text hover:bg-brand-bg transition-colors"
                  >
                    View Full Shopping Bag
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[0.65rem] text-brand-muted pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
                <span>100% Certified Authentic & Safe Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
