import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ComboBuilder, type ComboPiece } from "@/components/combos/combo-builder";
import { comboHeadline } from "@/lib/combos";
import { formatPrice } from "@/lib/products";
import { getStoreCombos, getStoreProducts } from "@/lib/product-service";

type ComboPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ComboPage({ params }: ComboPageProps) {
  const { id } = await params;
  const [combos, products] = await Promise.all([getStoreCombos(), getStoreProducts()]);

  // Only offers that can be bought are listed, so a withdrawn or short-stocked
  // combo is simply not found — better than a page that cannot be completed.
  const combo = combos.find((item) => item.id === id);
  if (!combo) notFound();

  const allowed = new Set(combo.productIds);
  const pieces: ComboPiece[] = products
    .filter((product) => allowed.has(product.id) && product.inStock)
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      kind: product.subcategory ?? "",
      sizes: product.sizes
    }));

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-56 pt-8 sm:px-8 sm:pt-12 lg:px-10">
        <Link
          className="text-[0.7rem] uppercase tracking-luxury text-gold-light hover:underline"
          href="/combos"
        >
          ← All combo offers
        </Link>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-porcelain sm:text-5xl">
          {combo.name}
        </h1>
        <p className="mt-3 text-lg font-semibold text-brand-gold">
          {comboHeadline(combo, formatPrice(combo.price))}
        </p>
        {combo.description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-porcelain/70 sm:text-base sm:leading-8">
            {combo.description}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-mist">
          Tap {combo.pieces === 1 ? "a piece" : `${combo.pieces} pieces`} below. Inclusive of all taxes.
        </p>

        <ComboBuilder combo={combo} pieces={pieces} />
      </main>
    </>
  );
}
