import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="flex items-center justify-between border-b border-graphite/80 bg-abyss px-4 py-2 text-center text-[11px] font-light uppercase tracking-[0.2em] text-gold-light">
      <div className="hidden opacity-75 md:block">
        Express Courier Shipping Worldwide
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 text-center font-medium">
        <Sparkles
          aria-hidden="true"
          className="h-3 w-3 animate-pulse text-gold-bright"
        />
        <span>Royal Craftsmanship &amp; Bespoke Tailoring Since 1988</span>
      </div>

      {/*
       * The reference site toggles INR/USD here. Prices in this app are stored
       * and rendered in a single currency, so this stays a label rather than a
       * control that would claim to convert and not.
       */}
      <div className="hidden items-center gap-3 md:flex">
        <span className="border-b border-gold/40">INR (₹)</span>
      </div>
    </div>
  );
}
