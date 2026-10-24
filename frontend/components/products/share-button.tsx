"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Mail, MessageCircle, Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  /** The product's path, e.g. /products/jhumka. The origin is added in the browser. */
  path: string;
};

/**
 * Sends a friend to this piece.
 *
 * Where the phone or browser has its own share sheet, that is used: it lists
 * the apps the client actually has. Everywhere else a small menu offers the
 * link itself, WhatsApp and email. The link is the product's own address, with
 * no tracking attached.
 */
export function ShareButton({ title, path }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const productUrl = () => `${window.location.origin}${path}`;

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: `${title} - AL-KAIF`, url: productUrl() });
        return;
      } catch (error) {
        // Closing the sheet is not a failure; anything else falls to the menu.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setOpen((current) => !current);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(productUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", productUrl());
    }
  }

  const message = () => encodeURIComponent(`${title} - AL-KAIF\n${productUrl()}`);

  const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-brand-text transition hover:bg-brand-gold/10 hover:text-brand-gold";

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-border px-4 text-[0.7rem] font-bold uppercase tracking-luxury text-brand-text transition hover:border-brand-gold hover:text-brand-gold"
        onClick={share}
        type="button"
      >
        <Share2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        Share
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-brand-gold/30 bg-brand-surface p-2 shadow-2xl shadow-black/20"
          role="menu"
        >
          <button className={itemClass} onClick={copyLink} role="menuitem" type="button">
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Link2 aria-hidden="true" className="h-4 w-4" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>
          <a
            className={itemClass}
            href={`https://wa.me/?text=${message()}`}
            onClick={() => setOpen(false)}
            rel="noreferrer"
            role="menuitem"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            className={itemClass}
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${message()}`}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            Email
          </a>
        </div>
      ) : null}
    </div>
  );
}
