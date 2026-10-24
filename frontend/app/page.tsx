import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CollectionsSection } from "@/components/sections/collections-section";
import { HeroSection } from "@/components/sections/hero-section";
import { TabbedCatalogSection } from "@/components/sections/tabbed-catalog-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { getStoreProducts } from "@/lib/product-service";

export default async function Home() {
  const allProducts = await getStoreProducts();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TabbedCatalogSection allProducts={allProducts} />
        <CollectionsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
