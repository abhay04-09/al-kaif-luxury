"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";

export function NewsletterSection() {
  return (
    <section
  id="newsletter"
  className="bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
>
      <motion.div
        className="mx-auto grid max-w-7xl gap-12 border border-graphite bg-onyx px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-14"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
      >
        <div>
          <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
            Private Access
          </p>

          <h2 className="max-w-3xl font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] text-porcelain">
            Receive the first word from the maison.
          </h2>

          <p className="mt-7 max-w-xl text-base leading-8 text-porcelain/68 sm:text-lg">
            Be invited into new collections, private previews, and carefully
            selected stories from the world of AL-KAIF.
          </p>
        </div>

        <form className="space-y-5" aria-label="Newsletter subscription form">
          <label
            htmlFor="newsletter-email"
            className="text-[0.7rem] uppercase tracking-luxury text-mist"
          >
            Email Address
          </label>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Mail
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-light"
                strokeWidth={1.4}
              />

              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="client@example.com"
                className="h-14 w-full border-0 border-b border-graphite bg-transparent pl-8 pr-4 text-porcelain outline-none transition placeholder:text-mist/60 focus:border-gold-light"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-3 border border-gold px-6 text-[0.7rem] uppercase tracking-luxury text-porcelain transition duration-500 hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            >
              Subscribe
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <p className="text-xs leading-6 text-mist">
            By subscribing, you agree to receive carefully selected AL-KAIF
            communications. No noise, only considered updates.
          </p>
        </form>
      </motion.div>
    </section>
  );
}
