"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

const instagramUrl =
  "https://www.instagram.com/alkaif.jewellery?igsh=OG5jYnNxdGI0dGlm";

const galleryItems = [
  {
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=90",
    alt: "Diamond ring in warm luxury light",
    className: "sm:col-span-2 sm:row-span-2"
  },
  {
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=90",
    alt: "Luxury watch detail"
  },
  {
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=90",
    alt: "Fine jewellery detail"
  },
  {
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=90",
    alt: "Gold bracelet detail"
  },
  {
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=90",
    alt: "Luxury necklace still life"
  }
];

export function InstagramGallerySection() {
  return (
    <section className="bg-obsidian px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-14 flex flex-col gap-8 border-t border-graphite pt-12 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <div>
            <p className="mb-5 text-[0.72rem] uppercase tracking-luxury text-gold-light">
              Social Atelier
            </p>

            <h2 className="max-w-3xl font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-porcelain">
              Seen in quiet detail.
            </h2>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            @alkaif.maison
          </a>
        </motion.div>

        <div className="grid auto-rows-[260px] gap-3 sm:grid-cols-4 sm:auto-rows-[220px] lg:auto-rows-[260px]">
          {galleryItems.map((item, index) => (
            <motion.a
              key={item.image}
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="View AL-KAIF Instagram post"
              className={`group relative overflow-hidden border border-graphite bg-onyx ${
                item.className ?? ""
              }`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                delay: index * 0.06,
                duration: 0.85,
                ease: [0.19, 1, 0.22, 1]
              }}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-85 transition duration-[1200ms] group-hover:scale-105 group-hover:opacity-100"
              />

              <div className="absolute inset-0 bg-obsidian/0 transition duration-500 group-hover:bg-obsidian/35" />

              <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[0.65rem] uppercase tracking-luxury text-porcelain opacity-0 transition duration-500 group-hover:opacity-100">
                <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} />
                View
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}