import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LuxuryPreloader } from "@/components/motion/luxury-preloader";
import { BrandStorySection } from "@/components/sections/brand-story-section";
import { CollectionsSection } from "@/components/sections/collections-section";
import { HeroSection } from "@/components/sections/hero-section";
import { TabbedCatalogSection } from "@/components/sections/tabbed-catalog-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { getStoreProducts } from "@/lib/product-service";

export default async function Home() {
  const allProducts = await getStoreProducts();

  return (
    <>
      <LuxuryPreloader />
      <Navbar />
      <main>
        <HeroSection />
        <BrandStorySection />
        <CollectionsSection />
        <TabbedCatalogSection allProducts={allProducts} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
