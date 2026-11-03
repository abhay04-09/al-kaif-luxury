import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { comboHeadline } from "@/lib/combos";
import { formatPrice } from "@/lib/products";
import { getStoreCombos, getStoreProducts } from "@/lib/product-service";

export const metadata = {
  title: "Combo Offers | AL-KAIF",
  description: "Choose your favourite pieces and pay one special price."
};

// Offers are set up in the admin panel and change without a deploy.
export const dynamic = "force-dynamic";

export default async function CombosPage() {
  const [combos, products] = await Promise.all([getStoreCombos(), getStoreProducts()]);
  const byId = new Map(products.map((product) => [product.id, product]));

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-8 sm:px-8 sm:pt-16 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">AL-KAIF Offers</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-porcelain sm:text-5xl lg:text-6xl">
          Combo Offers
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-porcelain/70 sm:mt-5 sm:text-base sm:leading-8">
          Choose your own pieces and pay one special price for the set.
        </p>

        {combos.length === 0 ? (
          <div className="mt-12 border border-white/10 p-10 text-center">
            <p className="font-serif text-2xl text-porcelain">No combo offers right now.</p>
            <p className="mt-3 text-sm text-porcelain/70">
              Please check back soon, or browse the collection in the meantime.
            </p>
            <Link
              className="mt-6 inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
              href="/products"
            >
              Shop Collection
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => {
              const pool = combo.productIds
                .map((id) => byId.get(id))
                .filter((piece) => piece !== undefined);
              const prices = pool.map((piece) => piece.price).sort((a, b) => b - a);
              // The most the same number of pieces could be worth: the honest
              // ceiling of "up to", never a figure that cannot be reached.
              const bestWorth = prices.slice(0, combo.pieces).reduce((a, b) => a + b, 0);
              const save = bestWorth - combo.price;
              const cover = combo.image ?? pool[0]?.image ?? "";

              return (
                <li key={combo.id}>
                  <Link
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-sm transition-all duration-300 hover:shadow-xl"
                    href={`/combos/${combo.id}`}
                  >
                    <span className="relative block aspect-[4/3] w-full overflow-hidden bg-brand-bg/50">
                      {cover ? (
                        <Image
                          alt={combo.name}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          src={cover}
                        />
                      ) : null}
                      {save > 0 ? (
                        <span className="discount-pill absolute left-3 top-3 rounded-full bg-[#8B0000] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                          Save up to {formatPrice(save)}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex flex-1 flex-col p-5">
                      <span className="font-serif text-xl text-brand-text">{combo.name}</span>
                      <span className="mt-2 text-sm font-semibold text-brand-gold">
                        {comboHeadline(combo, formatPrice(combo.price))}
                      </span>
                      {combo.description ? (
                        <span className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">
                          {combo.description}
                        </span>
                      ) : null}
                      <span className="mt-auto pt-5 text-[0.7rem] font-bold uppercase tracking-luxury text-brand-text group-hover:text-brand-gold">
                        Choose your pieces →
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
