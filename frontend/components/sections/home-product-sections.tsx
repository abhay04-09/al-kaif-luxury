import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ComboCard } from "@/components/sections/combo-offers-section";
import { ScrollBox } from "@/components/sections/scroll-box";
import type { Combo, Product } from "@/types/product";

type HomeProductSectionsProps = {
  allProducts: Product[];
  combos: Combo[];
};

// Pieces whose names mark them as traditional work. The shop has no
// "traditional" tick of its own, so the name is what we go by.
const TRADITIONAL = /kundan|temple|antique|polki|meenakari|mangal|jhumka|chandbali|haar|bridal|royal|heritage/i;

/** How many pieces each box holds; the first four show, the rest are scrolled to. */
const PER_BOX = 24;

function Box({
  title,
  href,
  children
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="min-w-0">
      <div className="flex items-end justify-between gap-4 border-b border-brand-border pb-3">
        <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-brand-text sm:text-2xl">
          {title}
        </h2>
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-luxury text-brand-gold transition hover:text-brand-text"
        >
          <span>View all</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * The home page's product boxes: New Arrivals, Best Sellers, Traditional
 * Collections and Combo Offers. Each shows four cards, two across, and scrolls
 * up and down inside itself for the rest. On a wide screen two boxes sit side
 * by side, so a card is never stretched across the whole page.
 */
export function HomeProductSections({ allProducts, combos }: HomeProductSectionsProps) {
  const available = allProducts.filter((product) => product.inStock);

  // The shop's own ticks decide what is new and what is a best seller. Until
  // anything is ticked as new, the newest pieces stand in, so the box is never
  // left empty on a home page.
  const ticked = available.filter((product) => product.isNewArrival);
  const newArrivals = (ticked.length > 0 ? ticked : available).slice(0, PER_BOX);
  const shownIds = new Set(newArrivals.slice(0, 4).map((product) => product.id));

  const bestSellers = available
    .filter((product) => product.featured && !shownIds.has(product.id))
    .slice(0, PER_BOX);

  const traditional = available
    .filter((product) => TRADITIONAL.test(product.name))
    .slice(0, PER_BOX);

  const byId = new Map(allProducts.map((product) => [product.id, product]));

  return (
    <section className="w-full border-t border-brand-border bg-brand-bg px-3 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-12 lg:grid-cols-2">
        {newArrivals.length > 0 && (
          <Box title="New Arrivals" href="/products?category=jewellery">
            <ScrollBox>
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollBox>
          </Box>
        )}
        {bestSellers.length > 0 && (
          <Box title="Best Sellers" href="/products?category=jewellery">
            <ScrollBox>
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollBox>
          </Box>
        )}
        {traditional.length > 0 && (
          <Box title="Traditional Collections" href="/products?category=jewellery">
            <ScrollBox>
              {traditional.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollBox>
          </Box>
        )}
        {combos.length > 0 && (
          <Box title="Combo Offers" href="/combos">
            <ScrollBox>
              {combos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} byId={byId} />
              ))}
            </ScrollBox>
          </Box>
        )}
      </div>
    </section>
  );
}
