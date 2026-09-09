"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  UserRound, 
  X, 
  Heart, 
  MapPin, 
  Camera, 
  Mic 
} from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";
import { AlKaifMark } from "@/components/brand/al-kaif-mark";
import { useSession } from "@/components/auth/session-provider";
import { useCartCount } from "@/lib/use-cart-count";
import { useCartDrawer } from "@/components/cart/cart-drawer-context";

const searchPlaceholders = [
  "Search for necklaces, earrings, bangles, rings...",
  "Search for bridal kundan chokers...",
  "Search for meenakari jhumkas & chandbalis...",
  "Search for 100% skin-friendly gold polish jewellery..."
];

export function Navbar() {
  const pathname = usePathname();
  const { user, status } = useSession();
  const { openCart } = useCartDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = useCartCount();

  const isLoggedIn = status === "authenticated" && Boolean(user);
  const isAdmin = isLoggedIn && user?.role === "admin";
  const navigation = isAdmin
    ? [...primaryNavigation, { label: "Admin", href: "https://al-kaiff-admin.pages.dev" }]
    : primaryNavigation;

  // Cycle search placeholders smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-brand-surface border-b border-brand-border backdrop-blur-md transition-colors duration-300">
      {/* Single Merged Navigation Row: Hamburger + Logo + Search + Icons */}
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8"
      >
        {/* Mobile Drawer Hamburger Button */}
        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg focus:outline-none"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          )}
        </button>

        {/* AL-KAIF Logo */}
        <Link
          href="/"
          aria-label="AL-KAIF Home"
          className="shrink-0 flex items-center transition hover:opacity-90"
        >
          <AlKaifMark className="h-7 sm:h-9 w-auto shrink-0 drop-shadow-sm" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden shrink-0 items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              className="text-xs uppercase tracking-luxury text-brand-text transition hover:text-brand-gold font-medium"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Compact Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
            }
          }}
          className="relative flex flex-1 min-w-0 items-center"
        >
          <Search className="absolute left-3 h-3.5 w-3.5 text-brand-muted pointer-events-none sm:left-4 sm:h-4 sm:w-4" strokeWidth={1.8} />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholders[placeholderIndex]}
            className="w-full min-w-0 rounded-full border border-brand-border bg-brand-bg py-2 pl-8 pr-8 text-xs text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all shadow-inner sm:py-2.5 sm:pl-11 sm:pr-20 sm:text-sm"
          />

          {/* Trailing Camera & Voice Search Icons (hidden on the smallest screens to keep the bar compact) */}
          <div className="absolute right-3 hidden items-center gap-1.5 text-brand-muted sm:flex">
            <button
              type="button"
              title="Visual / Camera Search"
              onClick={() => alert("Visual / Camera search enabled!")}
              className="p-1 hover:text-brand-gold transition"
            >
              <Camera className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              title="Voice Search"
              onClick={() => alert("Voice search listening...")}
              className="p-1 hover:text-brand-gold transition"
            >
              <Mic className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </form>

        {/* Right Icons Row */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Store Locator Icon */}
          <Link
            href="/query"
            aria-label="Store locator / Atelier Location"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold"
            title="AL-KAIF Atelier & Support"
          >
            <MapPin className="h-4 w-4" strokeWidth={1.8} />
          </Link>

          {/* Wishlist Heart Icon */}
          <Link
            href="/products"
            aria-label="Wishlist"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-[#8B0000]"
            title="Wishlist"
          >
            <Heart className="h-4 w-4 hover:fill-[#8B0000]" strokeWidth={1.8} />
          </Link>

          {/* Account Icon */}
          <Link
            aria-label={isLoggedIn ? "My account" : "Sign in"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold"
            href={isLoggedIn ? "/profile" : "/login"}
          >
            <UserRound className="h-4 w-4" strokeWidth={1.8} />
          </Link>


          {/* Shopping Cart Bag Icon with Active Circular Count Badge: bg-[#8B0000] text-white font-bold rounded-full */}
          <button
            type="button"
            onClick={openCart}
            aria-label={
              cartCount > 0
                ? `Open shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
                : "Open shopping bag"
            }
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold focus:outline-none"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            <span
              className={`absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[0.65rem] font-bold text-white transition-all shadow-sm ${
                cartCount > 0 ? "bg-[#8B0000] text-white font-bold rounded-full" : "bg-brand-muted text-white rounded-full"
              }`}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMenuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-brand-border bg-brand-surface px-5 py-5 lg:hidden animate-in slide-in-from-top-2 duration-200"
          id="mobile-navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {navigation.map((item) => {
              const isCurrent = item.href === pathname;

              return (
                <Link
                  aria-current={isCurrent ? "page" : undefined}
                  className="flex min-h-12 items-center border-b border-brand-border py-3 text-xs uppercase tracking-luxury font-medium text-brand-text transition hover:text-brand-gold"
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 flex items-center justify-between text-xs text-brand-muted">
              <Link href="/query" onClick={closeMenu} className="flex items-center gap-2 hover:text-brand-gold">
                <MapPin className="h-4 w-4" /> Vapi Atelier Hub
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
