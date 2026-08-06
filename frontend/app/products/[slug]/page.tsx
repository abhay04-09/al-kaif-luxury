import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import { formatPrice } from "@/lib/products";
import { getStoreProductBySlug, getStoreProducts } from "@/lib/product-service";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Pages are rendered on demand from the live catalogue, so nothing is baked in
// at build time — new products appear as soon as they are added in the admin panel.
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const products = await getStoreProducts(product.category);
  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);
  // The main image may be updated independently from an existing gallery.
  // Always render it first so the product page matches the catalogue card.
  const productImages = [...new Set([product.image, ...product.gallery])];

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-32 sm:px-8 lg:px-10">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {productImages.map((image) => (
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-onyx" key={image}>
                <Image
                  alt={product.name}
                  className="object-cover"
                  fill
                  priority={image === product.image}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  src={image}
                />
              </div>
            ))}
          </div>
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
              {product.collection} / {product.category}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-porcelain sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-2xl text-porcelain">{formatPrice(product.price)}</p>
            <p className="mt-6 text-base leading-8 text-porcelain/72">{product.description}</p>
            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
            <div className="mt-10 border-y border-white/10 py-6">
              <h2 className="font-serif text-2xl text-porcelain">Details</h2>
              <ul className="mt-5 space-y-3 text-sm text-porcelain/68">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-sm text-porcelain/60">Material: {product.material}</p>
            <p className="mt-2 text-sm text-porcelain/60">Available stock: {product.stock}</p>
          </div>
        </section>
        <section className="mt-24">
          <h2 className="font-serif text-4xl text-porcelain">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
