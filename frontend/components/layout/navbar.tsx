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
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  // Where the search bar sits inside the header, measured from the logo and the
  // search icon so it grows out of the icon and stops short of the logo.
  const [searchBox, setSearchBox] = useState({ left: 0, right: 0 });

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

  // Keep the bar's footprint in step with the header as it is resized.
  useEffect(() => {
    function measure() {
      const nav = navRef.current;
      const logo = logoRef.current;
      const button = searchButtonRef.current;
      if (!nav || !logo || !button) return;

      const navBox = nav.getBoundingClientRect();
      // On a phone there is no room beside the logo, so the bar takes the row.
      if (window.innerWidth < 1024) {
        setSearchBox({ left: 12, right: 12 });
        return;
      }
      setSearchBox({
        left: logo.getBoundingClientRect().right - navBox.left + 24,
        right: navBox.right - button.getBoundingClientRect().right
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // A tap or click anywhere outside the bar folds it back into its icon.
  useEffect(() => {
    if (!isSearchOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (searchBarRef.current?.contains(event.target as Node)) return;
      setIsSearchOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isSearchOpen]);

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
        className="relative mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        ref={navRef}
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
              ref={logoRef}
            >
              <AlKaifMark className="h-11 sm:h-14 lg:h-16 w-auto shrink-0 drop-shadow-sm" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div
            className={`hidden shrink-0 items-center gap-7 transition-opacity duration-200 lg:flex xl:gap-9 h-full ${
              isSearchOpen ? "pointer-events-none opacity-0" : ""
            }`}
          >
            {navigation.map((item) => {
              const hasSub = Boolean(item.subItems && item.subItems.length > 0);

              return (
                <div key={item.label} className="relative group flex h-full items-center">
                  <Link
                    className="inline-flex items-center gap-1 text-[0.8rem] uppercase tracking-luxury text-brand-text transition hover:text-brand-gold font-semibold xl:text-sm"
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
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open search bar"
            aria-expanded={isSearchOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold"
            ref={searchButtonRef}
            title="Search Products"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
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

        {/* Search bar: grows out of the search icon, inside the header itself.
            It folds back into the icon when a finger or cursor is put down
            anywhere outside it, and on Escape. */}
        <div
          className={`absolute inset-y-0 z-20 flex items-center justify-end ${
            isSearchOpen ? "" : "pointer-events-none"
          }`}
          ref={searchBarRef}
          style={{ left: searchBox.left, right: searchBox.right }}
        >
          <form
            className={`relative flex h-11 items-center overflow-hidden rounded-full border bg-brand-surface shadow-lg transition-[width,opacity] duration-300 ease-out focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/20 sm:h-12 ${
              isSearchOpen
                ? "w-full border-brand-gold/50 opacity-100"
                : "w-9 border-transparent opacity-0"
            }`}
            inert={!isSearchOpen}
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none ml-4 h-[18px] w-[18px] shrink-0 text-brand-muted"
              strokeWidth={1.8}
            />

            <input
              aria-label="Search products"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholders[placeholderIndex]}
              ref={searchInputRef}
              type="text"
              value={searchQuery}
            />

            {searchQuery ? (
              <button
                aria-label="Clear search input"
                className="shrink-0 rounded-full p-1.5 text-brand-muted transition hover:bg-brand-border/40 hover:text-brand-text"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                title="Clear"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            <button
              className="mr-1.5 shrink-0 rounded-full bg-brand-gold px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-brand-gold-hover sm:px-5 sm:py-2"
              type="submit"
            >
              Search
            </button>

            <button
              aria-label="Close search"
              className="mr-1.5 shrink-0 rounded-full p-1.5 text-brand-muted transition hover:bg-brand-border/40 hover:text-brand-text"
              onClick={() => setIsSearchOpen(false)}
              title="Close"
              type="button"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
          </form>
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

