import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LuxuryPreloader } from "@/components/motion/luxury-preloader";
import { BrandStorySection } from "@/components/sections/brand-story-section";
import { CollectionsSection } from "@/components/sections/collections-section";
import { CraftsmanshipSection } from "@/components/sections/craftsmanship-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { HeroSection } from "@/components/sections/hero-section";
import { InstagramGallerySection } from "@/components/sections/instagram-gallery-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
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
        <CraftsmanshipSection />
        <TestimonialsSection />
        <InstagramGallerySection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
