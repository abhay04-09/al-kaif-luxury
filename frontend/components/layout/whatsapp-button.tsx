"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, X, Sparkles, Headset } from "lucide-react";

export function WhatsAppButton() {
  const [isDismissed, setIsDismissed] = useState(false);

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
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        aria-label="Contact Concierge on WhatsApp"
        title="Instant Help & WhatsApp Support"
      >
        <MessageSquare className="h-6 w-6 text-white transition-transform group-hover:scale-110" />

        {/* Active Concierge Online Avatar Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-amber-500" />
        </span>
      </a>
    </aside>
  );
}
