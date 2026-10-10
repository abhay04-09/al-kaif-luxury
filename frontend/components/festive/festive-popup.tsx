"use client";

import { useEffect, useState } from "react";
import { Gift, Sparkles, X } from "lucide-react";
import Link from "next/link";
import type { FestiveOffer } from "@/lib/festive";
import { tierRange } from "@/lib/festive";

/**
 * The festive offer, announced once.
 *
 * A pop-up that reappears on every visit stops being an announcement and
 * becomes an obstacle, so a dismissal is remembered for the day. It is keyed
 * on the offer's own heading: change the offer in the panel and everyone sees
 * the new one, including those who closed the last.
 *
 * It waits a moment before appearing — arriving on top of a page that is still
 * drawing itself reads as an error rather than an invitation.
 */
export function FestivePopup({ offer }: { offer: FestiveOffer }) {
  const [open, setOpen] = useState(false);

  const key = `alkaif-festive:${offer.title}`;

  useEffect(() => {
    let dismissedToday = false;
    try {
      dismissedToday = window.localStorage.getItem(key) === today();
    } catch {
      // A browser with storage blocked still deserves the offer, just every visit.
    }
    if (dismissedToday) return;

    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, [key]);

  // Escape closes it, as it closes any dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(key, today());
    } catch {
      // Nothing to do: it will simply show again next time.
    }
  }

  if (!open) return null;

  const tiers = [...offer.tiers].sort((a, b) => a.minINR - b.minINR);

  return (
    <div
      aria-labelledby="festive-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-gold/40 bg-onyx p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/15 text-porcelain/70 transition hover:border-gold hover:text-gold-light"
          onClick={close}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-luxury text-gold-light">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Festive Season
        </div>

        <h2
          className="mt-3 font-serif text-3xl leading-tight text-porcelain sm:text-4xl"
          id="festive-title"
        >
          {offer.title}
        </h2>

        {offer.subtitle ? (
          <p className="mt-3 text-sm leading-7 text-porcelain/70">{offer.subtitle}</p>
        ) : null}

        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {tiers.map((tier, index) => (
            <li
              className="flex items-center justify-between gap-4 py-3"
              key={`${tier.minINR}-${tier.percent}`}
            >
              <span className="text-sm text-porcelain/75">{tierRange(tiers, index)}</span>
              <span className="flex items-center gap-3 text-right">
                <span className="font-serif text-2xl text-gold-light">{tier.percent}%</span>
                {tier.gifts > 0 ? (
                  <span className="flex items-center gap-1 text-[0.68rem] uppercase tracking-wider text-porcelain/60">
                    <Gift aria-hidden="true" className="h-3.5 w-3.5 text-gold-light" />
                    {tier.gifts} gift{tier.gifts > 1 ? "s" : ""}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-6 text-mist">
          The discount is applied at checkout on qualifying pieces. Free gifts are packed with
          your parcel.
        </p>

        <Link
          className="mt-6 inline-flex w-full items-center justify-center border border-gold bg-gold/10 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-gold-light transition hover:bg-gold hover:text-black"
          href="/products"
          onClick={close}
        >
          Shop the offer
        </Link>
      </div>
    </div>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
