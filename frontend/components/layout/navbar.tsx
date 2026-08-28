"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";
import { AlKaifMark } from "@/components/brand/al-kaif-mark";
import { useSession } from "@/components/auth/session-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { useCartCount } from "@/lib/use-cart-count";

export function Navbar() {
  const pathname = usePathname();
  const { user, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();

  const isLoggedIn = status === "authenticated" && Boolean(user);
  const isAdmin = isLoggedIn && user?.role === "admin";
  // The admin panel is a separate application.
  const navigation = isAdmin
    ? [...primaryNavigation, { label: "Admin", href: "https://al-kaiff-admin.pages.dev" }]
    : primaryNavigation;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-obsidian/90 shadow-2xl backdrop-blur-md">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-10 w-10 items-center justify-center text-porcelain transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.4} />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.4} />
          )}
        </button>

        <Link className="group flex items-center gap-3 text-left py-1" href="/">
          <AlKaifMark className="h-12 w-auto shrink-0 drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] transition-transform duration-500 group-hover:scale-105 sm:h-14" />

          <span className="leading-tight">
            <span className="gold-gradient-text block font-serif text-xl font-medium uppercase tracking-[0.25em] sm:text-2xl">
              AL-KAIF
            </span>
            <span className="block text-[9px] font-light uppercase tracking-imperial text-gold-light opacity-85">
              Fine Jewellery &amp; Perfumes
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-10 lg:flex">
          {navigation.map((item) => (
            <Link
              className="text-[0.68rem] uppercase tracking-luxury text-porcelain/80 transition duration-300 hover:text-gold-light"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search AL-KAIF"
            className="hidden h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light sm:inline-flex"
            type="button"
          >
            <Search aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
          </button>

          <button
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "dark" ? (
              <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
            ) : (
              <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
            )}
          </button>

          {/* Signing out belongs on the account page, as it does on any shop —
              a logout button in the header is one slip from losing a bag. */}
          <Link
            aria-label={isLoggedIn ? "My account" : "Sign in"}
            className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            href={isLoggedIn ? "/profile" : "/login"}
          >
            <UserRound aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
          </Link>

          <Link
            aria-label={
              cartCount > 0
                ? `Open shopping bag, ${cartCount} ${cartCount === 1 ? "piece" : "pieces"}`
                : "Open shopping bag"
            }
            className="relative inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            href="/cart"
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
            {cartCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-medium leading-none text-obsidian"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </nav>

      {isMenuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-obsidian px-5 py-5 lg:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {navigation.map((item) => {
              const isCurrent = item.href === pathname;

              return (
                <Link
                  aria-current={isCurrent ? "page" : undefined}
                  className="flex min-h-12 items-center border-b border-white/10 py-3 text-sm uppercase tracking-luxury text-porcelain/85 transition hover:border-gold-light hover:text-gold-light"
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
