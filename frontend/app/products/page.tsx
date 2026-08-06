import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/products/product-card";
import { getStoreCategories, getStoreProducts } from "@/lib/product-service";
import type { ProductCategory } from "@/types/product";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: ProductCategory;
    subcategory?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, subcategory } = await searchParams;
  const [visibleProducts, categories] = await Promise.all([
    getStoreProducts(category, subcategory),
    getStoreCategories()
  ]);

  const activeCategory = categories.find((item) => item.id === category);
  const subcategories = activeCategory?.children ?? [];
  const heading = activeCategory?.name ?? "Collections";

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">AL-KAIF Shop</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-5xl text-porcelain sm:text-6xl">{heading}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/70">
              Every piece is hallmarked, individually numbered and dispatched with an AL-KAIF certificate
              of authenticity.
            </p>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <a
                className={`border px-4 py-3 text-xs uppercase tracking-luxury text-porcelain hover:border-gold-light ${
                  category ? "border-white/10" : "border-gold-light"
                }`}
                href="/products"
              >
                All
              </a>
              {categories.map((item) => (
                <a
                  key={item.id}
                  className={`border px-4 py-3 text-xs uppercase tracking-luxury text-porcelain hover:border-gold-light ${
                    category === item.id ? "border-gold-light" : "border-white/10"
                  }`}
                  href={`/products?category=${item.id}`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {subcategories.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-[0.65rem] uppercase tracking-luxury text-porcelain/50">Refine</span>
            {subcategories.map((sub) => (
              <a
                key={sub.id}
                className="rounded-full border border-white/10 px-4 py-2 text-[0.65rem] uppercase tracking-luxury text-porcelain/80 hover:border-gold-light hover:text-porcelain"
                href={`/products?category=${category}&subcategory=${sub.id}`}
              >
                {sub.name}
              </a>
            ))}
          </div>
        )}

        {visibleProducts.length === 0 ? (
          <div className="mx-auto mt-20 max-w-xl border border-gold-light/30 bg-white/[0.02] px-10 py-16 text-center">
            <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">The Atelier</p>
            <h2 className="mt-4 font-serif text-4xl text-porcelain">Creations Coming Soon</h2>
            <p className="mt-5 text-sm leading-7 text-porcelain/70">
              Our artisans are placing the final hallmarks on this collection. Each piece is photographed
              and certified by hand before it appears here — please check back shortly.
            </p>
            <a
              className="mt-8 inline-block border border-gold-light px-6 py-3 text-xs uppercase tracking-luxury text-gold-light hover:bg-gold-light hover:text-ink"
              href="/"
            >
              Return Home
            </a>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
