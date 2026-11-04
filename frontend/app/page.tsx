import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CollectionsSection } from "@/components/sections/collections-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HomeProductSections } from "@/components/sections/home-product-sections";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { getStoreCombos, getStoreProducts } from "@/lib/product-service";

export default async function Home() {
  const [allProducts, combos] = await Promise.all([getStoreProducts(), getStoreCombos()]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HomeProductSections allProducts={allProducts} combos={combos} />
        <CollectionsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
