"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AreaCategory {
  id: string;
  name: string;
  bodyArea: string;
  link: string;
  image: string;
}

const shopByAreaCategories: AreaCategory[] = [
  {
    id: "royal-rings",
    name: "Royal Heritage Rings",
    bodyArea: "Hand & Fingers",
    link: "/products?category=jewellery&search=ring",
    image: "/media/area-rings.jpg"
  },
  {
    id: "classic-bangles",
    name: "Classic Bangles & Bracelets",
    bodyArea: "Wrist & Forearm",
    link: "/products?category=jewellery&search=bangle",
    image: "/media/area-bracelets.jpg"
  },
  {
    id: "jhumkas",
    name: "Jhumkas & Drop Earrings",
    bodyArea: "Ear & Drop Jhumkas",
    link: "/products?category=jewellery&search=earring",
    image: "/media/area-jhumkas.jpg"
  },
  {
    id: "necklaces",
    name: "Necklace & Choker Sets",
    bodyArea: "Neck & Collarbone",
    link: "/products?category=jewellery&search=necklace",
    image: "/media/area-necklace.jpg"
  },
  {
    id: "chains",
    name: "Chains & Chain Jewellery",
    bodyArea: "Neck & Neckline",
    link: "/products?category=jewellery&search=chain",
    image: "/media/area-chains.jpg"
  },
  {
    id: "mangalsutras",
    name: "Mangalsutras & Heritage Long Sets",
    bodyArea: "Neck & Décolletage",
    link: "/products?category=jewellery&search=mangalsutra",
    image: "/media/area-mangalsutra.jpg"
  }
];

export function ShopByAreaSection() {
  return (
    <section className="w-full bg-obsidian py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light mb-1">
              Curated by Body Area
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold uppercase tracking-wider text-porcelain">
              Shop by Area
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-porcelain/70">
              Discover handcrafted jewellery designed specifically for every part of your ensemble.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-porcelain/50">
            <Sparkles className="h-4 w-4 text-gold-light shrink-0" />
            <span>6 Body Adornment Categories</span>
          </div>
        </div>

        {/* Responsive Grid: 6 columns desktop → 3 tablet → 2 mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {shopByAreaCategories.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group flex flex-col focus:outline-none"
            >
              {/* Card Image Box */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/15 bg-onyx transition-all duration-300 group-hover:border-gold-light/60 shadow-lg">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Subtle Overlay Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Category Label */}
              <div className="mt-3">
                <h3 className="font-sans font-medium text-sm text-porcelain transition-colors group-hover:text-gold-light">
                  {item.name}
                </h3>
                <p className="text-xs text-porcelain/50 mt-0.5">
                  {item.bodyArea}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
