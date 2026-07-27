"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { LogOut, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";
import { useTheme } from "@/components/theme/theme-provider";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.replace("/");
    router.refresh();
  }

  const isLoggedIn = status === "authenticated" && Boolean(session?.user);
  const isAdmin = isLoggedIn && session?.user.role === "ADMIN";
  const navigation = isAdmin
    ? [...primaryNavigation, { label: "Admin", href: "/admin" }]
    : primaryNavigation;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-obsidian/95 backdrop-blur-sm">
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

        <Link
          className="font-serif text-xl tracking-[0.26em] text-porcelain sm:text-2xl"
          href="/"
        >
          AL-KAIF
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

          {isLoggedIn ? (
            <>
              <Link
                aria-label="View my orders"
                className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                href="/profile"
              >
                <UserRound aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
              </Link>

              <button
                aria-label="Log out"
                className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light lg:w-auto lg:gap-2 lg:border lg:border-white/10 lg:px-3"
                onClick={handleLogout}
                type="button"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
                <span className="hidden text-[0.68rem] uppercase tracking-luxury lg:inline">
                  Logout
                </span>
              </button>
            </>
          ) : (
            <Link
              aria-label="Open account"
              className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              href="/login"
            >
              <UserRound aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
            </Link>
          )}

          <Link
            aria-label="Open shopping bag"
            className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            href="/cart"
          >
            <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
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
