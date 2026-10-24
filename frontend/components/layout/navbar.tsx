"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  UserRound, 
  X, 
  Heart, 
  MapPin, 
  ChevronDown
} from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";
import { AlKaifMark } from "@/components/brand/al-kaif-mark";
import { useSession } from "@/components/auth/session-provider";
import { useCartCount } from "@/lib/use-cart-count";

const searchPlaceholders = [
  "Search for necklaces, earrings, bangles, rings...",
  "Search for bridal kundan chokers...",
  "Search for meenakari jhumkas & chandbalis...",
  "Search for 100% skin-friendly gold polish jewellery..."
];

export function Navbar() {
  const pathname = usePathname();
  const { user, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = useCartCount();

  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus input when search tab opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Close search tab on route changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-brand-surface/95 border-b border-brand-border backdrop-blur-md transition-colors duration-300">
      {/* Navigation Header Bar */}
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Left Section: Mobile Hamburger + Logo + Desktop Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8 lg:gap-10 h-full shrink-0">
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

            {/* AL-KAIF Brand Logo - sits fully inside the header bar, vertically centred, on every page */}
            <Link
              href="/"
              aria-label="AL-KAIF Home"
              className="shrink-0 flex items-center transition hover:opacity-90"
            >
              <AlKaifMark className="h-11 sm:h-14 lg:h-16 w-auto shrink-0 drop-shadow-sm" />
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
                    <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block pt-2 z-50 w-56">
                      <div className="rounded-xl border border-brand-gold/30 bg-brand-surface p-2 shadow-2xl shadow-black/20 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                        {item.subItems?.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide text-brand-text transition-all duration-200 hover:bg-brand-gold/10 hover:text-brand-gold hover:translate-x-1"
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
        </div>

        {/* Right Action Icons Row: Search, Wishlist, Account, Cart */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Search Icon Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label={isSearchOpen ? "Close search bar" : "Open search bar"}
            aria-expanded={isSearchOpen}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
              isSearchOpen
                ? "bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/40"
                : "text-brand-text hover:bg-brand-bg hover:text-brand-gold"
            }`}
            title="Search Products"
          >
            {isSearchOpen ? (
              <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
            ) : (
              <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
            )}
          </button>

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
          <Link
            href="/cart"
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
          </Link>
        </div>
      </nav>

      {/* Expandable Luxury Search Tab / Panel */}
      {isSearchOpen && (
        <div
          className="border-t border-brand-border bg-brand-surface/98 px-4 py-4 sm:py-5 backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2"
        >
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search
                className="absolute left-4 h-4 w-4 text-brand-muted pointer-events-none sm:h-5 sm:w-5"
                strokeWidth={1.8}
              />

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholders[placeholderIndex]}
                className="w-full rounded-full border border-brand-border bg-brand-bg/95 py-2.5 pl-11 pr-28 text-xs text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all shadow-inner sm:py-3.5 sm:pl-12 sm:pr-36 sm:text-sm"
              />

              {/* Trailing Controls: Clear Text & Submit */}
              <div className="absolute right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-brand-muted hover:text-brand-text transition rounded-full hover:bg-brand-border/40"
                    aria-label="Clear search input"
                    title="Clear"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="rounded-full bg-brand-gold/20 px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-gold hover:bg-brand-gold hover:text-black transition"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Search Tag Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-brand-muted font-medium">Trending Searches:</span>
              {[
                { label: "Kundan Chokers", query: "kundan" },
                { label: "Jhumkas", query: "jhumka" },
                { label: "Classic Bangles", query: "bangle" },
                { label: "Royal Rings", query: "ring" },
                { label: "Mangalsutra", query: "mangalsutra" }
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag.query);
                    router.push(`/products?search=${encodeURIComponent(tag.query)}`);
                    setIsSearchOpen(false);
                  }}
                  className="rounded-full border border-brand-border bg-brand-bg/80 px-3 py-1 text-xs text-brand-text/80 transition hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/10"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

