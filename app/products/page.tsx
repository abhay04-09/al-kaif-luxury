import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/products/product-card";
import { getStoreProducts } from "@/lib/product-service";
import type { ProductCategory } from "@/types/product";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: ProductCategory;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getStoreProducts(category);

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">AL-KAIF Shop</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-5xl text-porcelain sm:text-6xl">Collections</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/70">
              Browse jewellery and watches from separate PostgreSQL product tables under one AL-KAIF commerce system.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="border border-white/10 px-4 py-3 text-xs uppercase tracking-luxury text-porcelain hover:border-gold-light" href="/products">
              All
            </a>
            <a className="border border-white/10 px-4 py-3 text-xs uppercase tracking-luxury text-porcelain hover:border-gold-light" href="/products?category=jewellery">
              Jewellery
            </a>
            <a className="border border-white/10 px-4 py-3 text-xs uppercase tracking-luxury text-porcelain hover:border-gold-light" href="/products?category=watches">
              Watches
            </a>
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </>
  );
}
