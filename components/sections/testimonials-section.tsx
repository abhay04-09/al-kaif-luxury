"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "AL-KAIF pieces have the rare quality of feeling personal before they feel precious.",
    name: "Private Collector",
    location: "Dubai"
  },
  {
    quote:
      "Every detail felt considered. The experience was calm, precise, and beautifully restrained.",
    name: "Client of the Maison",
    location: "London"
  },
  {
    quote:
      "Their watches and jewellery carry presence without needing to announce themselves.",
    name: "Heritage Buyer",
    location: "Mumbai"
  }
];

export function TestimonialsSection() {
  return (
    <section className="bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-14 max-w-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
            Client Words
          </p>

          <h2 className="font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-porcelain">
            Spoken softly by those who know.
          </h2>
        </motion.div>

        <div className="grid border border-graphite lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              className="border-b border-graphite bg-obsidian p-8 last:border-b-0 sm:p-10 lg:border-b-0 lg:border-r lg:last:border-r-0"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                delay: index * 0.1,
                duration: 0.85,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              <span className="font-serif text-5xl text-gold-light">“</span>

              <blockquote className="mt-6 font-serif text-3xl leading-tight text-porcelain sm:text-4xl">
                {testimonial.quote}
              </blockquote>

              <div className="mt-10 h-px w-16 bg-gold" />

              <p className="mt-6 text-[0.7rem] uppercase tracking-luxury text-porcelain">
                {testimonial.name}
              </p>

              <p className="mt-2 text-sm text-mist">{testimonial.location}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
