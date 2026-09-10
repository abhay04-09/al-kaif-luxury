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
  Mic,
  ChevronDown
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
    <header className="sticky top-0 z-50 bg-brand-surface/95 border-b border-brand-border backdrop-blur-md transition-colors duration-300">
      {/* Navigation Header Bar */}
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8"
      >
        {/* Left Section: Mobile Hamburger + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Drawer Hamburger Button */}
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg focus:outline-none lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            )}
          </button>

          {/* AL-KAIF Brand Logo (Vertically aligned with baseline of nav links) */}
          <Link
            href="/"
            aria-label="AL-KAIF Home"
            className="shrink-0 flex items-center transition hover:opacity-90 -mt-1 sm:-mt-1.5"
          >
            <AlKaifMark className="h-6 sm:h-7.5 w-auto shrink-0 drop-shadow-sm" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden shrink-0 items-center gap-6 lg:flex h-full">
          {navigation.map((item) => {
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);

            return (
              <div key={item.label} className="relative group flex h-full items-center">
                <Link
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-luxury text-brand-text transition hover:text-brand-gold font-medium"
                  href={item.href}
                >
                  {item.label}
                  {hasSub && (
                    <ChevronDown className="h-3 w-3 text-brand-muted transition-transform group-hover:rotate-180 group-hover:text-brand-gold" />
                  )}
                </Link>

                {/* Sub-Items Luxury Dropdown Menu */}
                {hasSub && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block pt-1 z-50 w-52">
                    <div className="rounded-xl border border-brand-border bg-brand-surface/95 backdrop-blur-xl p-2 shadow-xl animate-in fade-in-50 slide-in-from-top-1">
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block rounded-lg px-3.5 py-2.5 text-xs font-medium text-brand-text transition hover:bg-brand-bg hover:text-brand-gold"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Search Bar - Responsive Flex Layout */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
            }
          }}
          className="relative flex flex-1 min-w-[120px] max-w-md lg:max-w-lg items-center"
        >
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-brand-muted pointer-events-none sm:h-4 sm:w-4" strokeWidth={1.8} />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholders[placeholderIndex]}
            className="w-full rounded-full border border-brand-border bg-brand-bg/90 py-2 pl-9 pr-14 text-xs text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all shadow-inner sm:py-2.5 sm:pl-10 sm:pr-20 sm:text-sm"
          />

          {/* Trailing Camera & Voice Search Icons */}
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

        {/* Right Action Icons Row: Store Locator, Wishlist, Account, Cart */}
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
            title={isLoggedIn ? "My Profile" : "Sign In"}
          >
            <UserRound className="h-4 w-4" strokeWidth={1.8} />
          </Link>

          {/* Shopping Cart Bag Icon */}
          <button
            type="button"
            onClick={openCart}
            aria-label={
              cartCount > 0
                ? `Open shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
                : "Open shopping bag"
            }
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold focus:outline-none"
            title="Shopping Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5" strokeWidth={1.8} />
            <span
              className={`absolute -top-0.5 -right-0.5 grid h-4.5 min-w-[18px] place-items-center rounded-full px-1 text-[0.6rem] font-bold text-white transition-all shadow-sm ${
                cartCount > 0 ? "bg-[#8B0000]" : "bg-brand-muted"
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
              const hasSub = Boolean(item.subItems && item.subItems.length > 0);

              return (
                <div key={item.label} className="border-b border-brand-border py-2">
                  <Link
                    aria-current={isCurrent ? "page" : undefined}
                    className="flex min-h-10 items-center justify-between text-xs uppercase tracking-luxury font-medium text-brand-text transition hover:text-brand-gold"
                    href={item.href}
                    onClick={closeMenu}
                  >
                    <span>{item.label}</span>
                  </Link>

                  {/* Sub category links in mobile drawer */}
                  {hasSub && (
                    <div className="mt-1 pl-3 grid gap-1 border-l-2 border-brand-gold/30">
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={closeMenu}
                          className="block py-1.5 text-xs text-brand-muted hover:text-brand-gold font-normal"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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

