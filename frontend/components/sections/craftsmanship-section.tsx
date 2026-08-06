"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Gem, Hammer, Watch } from "lucide-react";

const craftPillars = [
  {
    icon: Gem,
    title: "Stone Selection",
    description:
      "Each diamond and precious stone is chosen for fire, clarity, proportion, and quiet character."
  },
  {
    icon: Hammer,
    title: "Hand Finishing",
    description:
      "Gold surfaces are shaped, refined, and polished with patience until the material feels alive."
  },
  {
    icon: Watch,
    title: "Mechanical Precision",
    description:
      "Every watch is considered through movement, balance, finishing, and enduring reliability."
  }
];

export function CraftsmanshipSection() {
  return (
    <section
      id="craftsmanship"
      className="bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="relative min-h-[620px] overflow-hidden border border-graphite bg-onyx"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
        >
          <Image
            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=2200&q=90"
            alt="Luxury craftsmanship atelier with refined hand finishing"
            fill
            sizes="100vw"
            className="object-cover opacity-70 transition duration-[1600ms] hover:scale-105"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--color-obsidian)/0.9)_0%,rgb(var(--color-obsidian)/0.58)_48%,rgb(var(--color-obsidian)/0.22)_100%)]" />

          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 lg:p-16">
            <motion.div
              className="max-w-4xl"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{
                delay: 0.15,
                duration: 1,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
                Craftsmanship
              </p>

              <h2 className="font-serif text-[clamp(3.2rem,8vw,8rem)] leading-[0.9] text-porcelain">
                The quiet theatre of making.
              </h2>

              <p className="mt-8 max-w-2xl text-base leading-8 text-porcelain/72 sm:text-lg">
                Behind every AL-KAIF creation is a discipline of touch, timing,
                and restraint. Nothing is hurried. Nothing is accidental.
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid border-x border-b border-graphite lg:grid-cols-3">
          {craftPillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <motion.article
                key={pillar.title}
                className="border-t border-graphite bg-obsidian p-8 sm:p-10 lg:border-t-0 lg:border-r lg:last:border-r-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.85,
                  ease: [0.19, 1, 0.22, 1]
                }}
              >
                <Icon className="h-6 w-6 text-gold-light" strokeWidth={1.4} />

                <h3 className="mt-8 font-serif text-3xl text-porcelain">
                  {pillar.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-porcelain/65 sm:text-base">
                  {pillar.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}