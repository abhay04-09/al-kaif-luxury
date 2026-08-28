import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CollectionsSection } from "@/components/sections/collections-section";

export const metadata = {
  title: "Collections | AL-KAIF Fine Jewellery & Perfumes",
  description:
    "Explore AL-KAIF collections of handcrafted artificial jewellery, Kundan & Meenakari pieces, and signature botanical perfumes."
};

export default function CollectionsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-obsidian">
        <CollectionsSection />
      </main>
      <Footer />
    </>
  );
}
