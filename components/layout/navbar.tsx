"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-obsidian/10 backdrop-blur-sm">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <button
          aria-label="Open navigation menu"
          className="inline-flex h-10 w-10 items-center justify-center text-porcelain transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light lg:hidden"
          type="button"
        >
          <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.4} />
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
    </header>
  );
}
