"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles } from "lucide-react";

const HIDDEN_ON = ["/login", "/signup"];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <aside className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Speech Bubble: "How can I help you?" with Dismiss button */}
      {!isDismissed && (
        <div className="relative flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gold/30 bg-white dark:bg-obsidian px-4 py-2.5 shadow-2xl text-xs font-medium text-gray-900 dark:text-porcelain backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span className="flex items-center gap-1.5 font-sans">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-gold-light animate-bounce" />
            How can I help you?
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-0.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
            aria-label="Dismiss chat prompt"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          
          {/* Speech bubble pointer triangle */}
          <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-gray-200 dark:border-gold/30 bg-white dark:bg-obsidian" />
        </div>
      )}

      {/* Floating Concierge Action Button */}
      <a
        href="https://wa.me/917096022333?text=Hi%20AL-Kaif,%20I%20have%20a%20query"
        target="_blank"
        rel="noreferrer"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        aria-label="Contact Concierge on WhatsApp"
        title="Instant Help & WhatsApp Support"
      >
        <WhatsAppIcon className="h-7 w-7 text-white transition-transform group-hover:scale-110 drop-shadow-sm" />

        {/* Active Concierge Online Avatar Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-amber-500" />
        </span>
      </a>
    </aside>
  );
}
