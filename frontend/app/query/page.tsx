"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  MessageSquare, 
  Mail, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Sparkles
} from "lucide-react";

const faqs = [
  {
    question: "How do I track my shipment?",
    answer: "Open My Orders and choose the order you are waiting for — once the courier has collected it, that page shows the tracking number, the courier's name and every scan along the way. The tracking number is also sent by SMS and email within 24 hours of dispatch."
  },
  {
    question: "How do I report a damaged jewelry or perfume item?",
    answer: "Message us on WhatsApp or email info@alkaif.in with your order number and the mandatory continuous unboxing video, within 48 hours of delivery."
  },
  {
    question: "How long do the perfume fragrances last?",
    answer: "Our perfumes are formulated with high-concentration fragrance oils providing an average longevity of 6 to 10 hours depending on skin chemistry and application."
  },
  {
    question: "How do I maintain artificial jewelry?",
    answer: "Keep jewelry away from direct contact with water, sweat, sanitizers, and alcohol-based perfumes to preserve the polish and luster."
  }
];

export default function QuerySupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        {/* Header section */}
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Concierge & Help Desk
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Client Support & Queries
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            Have a question about your order, fragrance notes, or jewelry care? Connect directly with our concierge team or log your query.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* WhatsApp Live Support Card */}
          <div className="border border-emerald-500/30 bg-emerald-950/20 p-8 flex flex-col justify-between rounded-xl shadow-lg hover:border-emerald-500/60 transition">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/20 mb-4">
                <Sparkles className="h-3 w-3" />
                Instant Support
              </div>
              <h2 className="font-serif text-2xl text-porcelain">WhatsApp Concierge</h2>
              <p className="mt-3 text-xs leading-relaxed text-porcelain/70">
                Chat live with our customer support for instant order status, exchange assistance, and item inquiries.
              </p>
            </div>

            <a
              href="https://wa.me/917096022333?text=Hi%20AL-Kaif,%20I%20have%20a%20query"
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex items-center justify-center gap-3 bg-emerald-600 px-6 py-4 text-xs font-bold uppercase tracking-luxury text-white hover:bg-emerald-500 transition rounded-lg shadow-md"
            >
              <MessageSquare className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Direct Contact Channels Card */}
          <div className="border border-white/10 bg-onyx/40 p-8 flex flex-col justify-between rounded-xl shadow-lg hover:border-white/20 transition">
            <div>
              <h2 className="font-serif text-2xl text-porcelain">Direct Contact Details</h2>
              <p className="mt-2 text-xs text-porcelain/60">Official communication channels.</p>

              <div className="mt-6 space-y-5 text-sm text-porcelain/80">
                <div className="flex items-start gap-3.5">
                  <div className="border border-gold-light/40 p-2 text-gold-light shrink-0 rounded">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-gold-light">Email Address</p>
                    <a href="mailto:info@alkaif.in" className="text-sm font-medium text-porcelain hover:text-gold-light transition">
                      info@alkaif.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-white/10 pt-4">
                  <div className="border border-gold-light/40 p-2 text-gold-light shrink-0 rounded">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-gold-light">Concierge Hours</p>
                    <p className="text-sm text-porcelain">Mon – Sat: 10:00 AM – 6:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-white/10 pt-4">
                  <div className="border border-gold-light/40 p-2 text-gold-light shrink-0 rounded">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-gold-light">Dispatch Hub</p>
                    <p className="text-sm text-porcelain">Vapi, Gujarat, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Common Self-Service FAQs */}
        <section className="mt-20 border-t border-white/10 pt-16">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-gold-light" />
            <h2 className="font-serif text-3xl text-porcelain sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <p className="mt-3 text-sm text-porcelain/70">
            Quick answers to questions regarding tracking, damaged items, fragrances, and jewelry care.
            For delivery charges, payment, cancellations and returns, see the{" "}
            <Link href="/faq" className="text-gold-light underline-offset-4 hover:underline">
              full list of questions
            </Link>
            .
          </p>

          <div className="mt-8 space-y-4 max-w-4xl">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className="border border-white/10 bg-onyx/30 transition hover:border-gold-light/40 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="font-serif text-lg text-porcelain">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-gold-light shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-porcelain/60 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-6 pb-6 pt-4 text-sm leading-8 text-porcelain/75">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
