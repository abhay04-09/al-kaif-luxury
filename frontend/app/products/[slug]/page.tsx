import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInfoTabs } from "@/components/products/product-info-tabs";
import { ProductRail } from "@/components/products/product-rail";
import { ShareButton } from "@/components/products/share-button";
import { ColourOptions } from "@/components/products/colour-options";
import { ScrollToTopOnOpen } from "@/components/products/scroll-to-top-on-open";
import { formatPrice } from "@/lib/products";
import {
  getProductReviews,
  getStoreProductBySlug,
  getStoreProducts
} from "@/lib/product-service";
import { ProductReviews } from "@/components/products/product-reviews";
import { getSessionToken } from "@/lib/session";

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

  const [catalogue, { reviews, summary }, sessionToken] = await Promise.all([
    getStoreProducts(),
    getProductReviews(product.id),
    getSessionToken()
  ]);

  // The same design in its other colours. Matched across the whole catalogue
  // rather than this category, since nothing stops a shop from filing two
  // colours of one piece differently.
  const group = product.colourGroup?.trim().toLowerCase() ?? "";
  const colourOptions = group
    ? catalogue
        .filter((item) => (item.colourGroup ?? "").trim().toLowerCase() === group)
        .sort((a, b) => (a.colourName ?? "").localeCompare(b.colourName ?? ""))
    : [];
  // Earrings beside earrings. The category alone was too broad: a pair of
  // jhumkas was being shown beside bracelets and rings because all three are
  // jewellery. Other colours of this same design are left out too — they are
  // already offered as swatches above, and the piece being read is never
  // suggested back to the client reading it.
  const kind = (product.subcategory ?? "").trim().toLowerCase();
  const colourSiblings = new Set(colourOptions.map((item) => item.id));
  const others = catalogue.filter(
    (item) => item.id !== product.id && !colourSiblings.has(item.id) && item.inStock
  );
  const similarProducts = others
    .filter((item) =>
      kind
        ? (item.subcategory ?? "").trim().toLowerCase() === kind
        : item.category === product.category
    )
    .slice(0, 12);
  const shownIds = new Set(similarProducts.map((item) => item.id));
  // The shop's own picks, which it ticks as featured, beyond what is already
  // shown above.
  const featuredProducts = others
    .filter((item) => item.featured && !shownIds.has(item.id))
    .slice(0, 12);
  // The main image may be updated independently from an existing gallery.
  // Always render it first so the product page matches the catalogue card.
  const productImages = [...new Set([product.image, ...product.gallery])];

  return (
    <>
      <ScrollToTopOnOpen />
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery alt={product.name} images={productImages} />
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="flex items-center justify-end gap-4">
              <ShareButton path={`/products/${product.slug}`} title={product.name} />
            </div>
            <h1 className="mt-3 font-serif text-[1.35rem] leading-snug text-porcelain sm:mt-4 sm:text-3xl lg:text-5xl">
              {product.name}
            </h1>
            {/* The MRP is only shown when the shop has set one that is genuinely
                higher; otherwise the price stands on its own. */}
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <p className="text-2xl text-porcelain">{formatPrice(product.price)}</p>
              {product.mrp && product.mrp > product.price ? (
                <>
                  <p className="text-base text-porcelain/50 line-through">
                    {formatPrice(product.mrp)}
                  </p>
                  <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                  </p>
                </>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-mist">Inclusive of all taxes</p>
            <ColourOptions current={product} options={colourOptions} />

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
            {/* Available or sold out, and nothing more: the shop's count of what
                is on the shelf is not shown to clients. */}
            <p className="mt-6 text-sm text-porcelain/60">
              Availability:{" "}
              {!product.inStock || product.stockQuantity === 0 ? (
                <span className="text-porcelain/45">Sold out</span>
              ) : (
                <span className="text-gold-light">In stock</span>
              )}
            </p>
          </div>
        </section>
        <ProductInfoTabs
          description={product.description}
          details={product.details}
          material={product.material}
          netQuantity={product.netQuantity}
        />
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          reviews={reviews}
          signedIn={Boolean(sessionToken)}
          summary={summary}
        />

        <ProductRail products={similarProducts} title="Similar pieces" />
        <ProductRail products={featuredProducts} title="Featured pieces" />
        <div className="mt-12" />
      </main>
    </>
  );
}
