import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CollectionsSection } from "@/components/sections/collections-section";
import { ShopByAreaSection } from "@/components/sections/shop-by-area-section";
import { HeroSection } from "@/components/sections/hero-section";
import { TabbedCatalogSection } from "@/components/sections/tabbed-catalog-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { getStoreProducts } from "@/lib/product-service";
import { getFestiveOffer } from "@/lib/festive";
import { FestivePopup } from "@/components/festive/festive-popup";

export default async function Home() {
  const allProducts = await getStoreProducts();
  // Null while the offer is switched off in the panel, so nothing is announced.
  const festive = await getFestiveOffer();

  return (
    <>
      {festive ? <FestivePopup offer={festive} /> : null}
      <Navbar />
      <main>
        <HeroSection />
        <CollectionsSection />
        <TabbedCatalogSection allProducts={allProducts} />
        <ShopByAreaSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
