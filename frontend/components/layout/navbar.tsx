"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Menu, 
  Moon, 
  Search, 
  ShoppingBag, 
  Sun, 
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
import { useTheme } from "@/components/theme/theme-provider";
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
  const { theme, toggleTheme } = useTheme();
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
      {/* Top Main Navigation Bar */}
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Left: Mobile Drawer Hamburger Button */}
        <div className="flex items-center gap-3">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg focus:outline-none"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            )}
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-6 lg:flex">
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
        </div>

        {/* Center: Brand Logo Image + Typography */}
        <Link className="flex items-center justify-center py-1 gap-2 text-brand-gold font-serif" href="/" aria-label="AL-KAIF Home">
          <AlKaifMark className="h-10 sm:h-12 w-auto shrink-0 drop-shadow-sm" />
        </Link>

        {/* Right Icons Row */}
        <div className="flex items-center gap-1 sm:gap-2">
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

          {/* Theme Toggle Button */}
          <button
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-brand-gold" strokeWidth={1.8} />
            ) : (
              <Moon className="h-4 w-4 text-brand-text" strokeWidth={1.8} />
            )}
          </button>

          {/* Shopping Cart Bag Icon with Active Circular Count Badge: bg-[#8B0000] text-white font-bold rounded-full */}
          <Link
            aria-label={
              cartCount > 0
                ? `Open shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
                : "Open shopping bag"
            }
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-bg hover:text-brand-gold"
            href="/cart"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            <span
              className={`absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[0.65rem] font-bold text-white transition-all shadow-sm ${
                cartCount > 0 ? "bg-[#8B0000] text-white font-bold rounded-full" : "bg-brand-muted text-white rounded-full"
              }`}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </Link>
        </div>
      </nav>

      {/* Global Full-Width Search Bar */}
      <div className="mx-auto max-w-7xl px-4 pb-3 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
            }
          }}
          className="relative flex items-center"
        >
          <Search className="absolute left-4 h-4 w-4 text-brand-muted pointer-events-none" strokeWidth={1.8} />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholders[placeholderIndex]}
            className="w-full rounded-full border border-brand-border bg-brand-bg pl-11 pr-20 py-2.5 text-xs sm:text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all shadow-inner"
          />

          {/* Trailing Camera & Voice Search Icons */}
          <div className="absolute right-3 flex items-center gap-1.5 text-brand-muted">
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
      </div>

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
              <button onClick={toggleTheme} className="flex items-center gap-1.5 hover:text-brand-gold">
                {theme === "dark" ? <Sun className="h-4 w-4 text-brand-gold" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
