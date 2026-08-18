"use client";

import { MessageCircle, X, Send, ShieldCheck, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_PHONE_NUMBER = "917096022333";
const DISPLAY_PHONE_NUMBER = "+91 70960 22333";
const ENQUIRY_MESSAGE =
  "Hello AL-KAIF Concierge, I would like to inquire about your fine jewellery & luxury perfumes collection.";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    DEFAULT_PHONE_NUMBER;

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    ENQUIRY_MESSAGE
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end select-none">
      {/* Support Chat Drawer Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-4 w-80 sm:w-96 rounded-2xl border border-gold/40 bg-black/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl text-porcelain"
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gold/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/20 border border-[#25D366]/40">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#25D366] ring-2 ring-black animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-gold-light">
                    AL-KAIF Concierge
                  </h3>
                  <p className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online • Direct Support
                  </p>
                </div>
              </div>
              <button
                aria-label="Close WhatsApp support menu"
                className="rounded-full p-1.5 text-mist transition hover:bg-gold/10 hover:text-gold"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="my-4 space-y-3">
              <div className="rounded-xl border border-gold/10 bg-obsidian/80 p-3.5 text-xs text-mist leading-relaxed">
                <p className="text-porcelain font-medium mb-1">
                  Welcome to AL-KAIF Personal Assistance
                </p>
                <p>
                  Connect directly with our luxury advisors for bespoke order assistance, product inquiries, and instant support.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gold/70 px-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 24/7 Available
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> {DISPLAY_PHONE_NUMBER}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <a
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#25D366] px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_10px_25px_rgba(37,211,102,0.3)] transition-all duration-300 hover:bg-[#22c35e] hover:shadow-[0_12px_30px_rgba(37,211,102,0.5)] active:scale-[0.98]"
              href={whatsappUrl}
              onClick={() => setIsOpen(false)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-4 w-4 fill-black" />
              <span>Start Chat on WhatsApp</span>
              <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        aria-label="Toggle WhatsApp Support"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.5)] transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-[0_15px_35px_rgba(37,211,102,0.65)] focus:outline-none sm:h-16 sm:w-16"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute -inset-1 rounded-full border-2 border-[#25D366]/50 animate-ping pointer-events-none opacity-75" />

        {/* Status Indicator Badge */}
        <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        </span>

        {isOpen ? (
          <X className="h-7 w-7 transition-transform duration-300 rotate-90" />
        ) : (
          <MessageCircle className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8" />
        )}
      </button>
    </div>
  );
}
