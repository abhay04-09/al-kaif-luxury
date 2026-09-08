"use client";

import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

const HIDDEN_ON = ["/login", "/signup"];

export function AnnouncementBar() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className="bg-gradient-to-r from-[#121212] via-[#7A0C1E] to-[#121212] text-white py-1.5 text-xs text-center font-medium border-b border-white/10 flex items-center justify-between px-4 sm:px-6">
      <div className="hidden opacity-85 md:block text-[11px] uppercase tracking-wider text-amber-200">
        Express Insured Shipping Across India
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 text-center font-medium tracking-wide">
        <Sparkles
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-pulse text-amber-300"
        />
        <span>Royal Craftsmanship &amp; Heritage Jewellery • 100% Skin-Friendly Polish</span>
      </div>

      <div className="hidden items-center gap-3 md:flex text-[11px] text-amber-200">
        <span className="border-b border-amber-300/40">INR (₹)</span>
      </div>
    </div>
  );
}
