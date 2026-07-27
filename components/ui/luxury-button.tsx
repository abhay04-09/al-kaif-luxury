import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type LuxuryButtonProps = {
  href: string;
  children: ReactNode;
};

export function LuxuryButton({ href, children }: LuxuryButtonProps) {
  return (
    <Link
      className="group inline-flex min-h-12 items-center gap-3 border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition duration-500 hover:border-gold-light hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
      href={href}
    >
      <span>{children}</span>
      <ArrowUpRight
        aria-hidden="true"
        className="h-4 w-4 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.5}
      />
    </Link>
  );
}
