import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LuxuryPreloader } from "@/components/motion/luxury-preloader";
import { BrandStorySection } from "@/components/sections/brand-story-section";
import { CollectionsSection } from "@/components/sections/collections-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { HeroSection } from "@/components/sections/hero-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { getFeaturedStoreProducts } from "@/lib/product-service";

export default async function Home() {
  const featuredProducts = await getFeaturedStoreProducts();

  return (
    <>
      <LuxuryPreloader />
      <Navbar />
      <main>
        <HeroSection />
        <BrandStorySection />
        <CollectionsSection />
        <FeaturedProductsSection products={featuredProducts} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
