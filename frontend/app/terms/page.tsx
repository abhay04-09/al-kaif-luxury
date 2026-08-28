import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, Mail, Phone } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | AL-KAIF Artificial Jewellery & Perfumes",
  description:
    "Official Terms and Conditions for AL-KAIF. Read our rules regarding product representations, pricing, payments, intellectual property, and governing law."
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Legal & Compliance
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Terms & Conditions
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            Welcome to AL-KAIF. By accessing our platform and placing an order, you agree to be bound by these Terms and Conditions and applicable laws.
          </p>
          <p className="mt-3 text-xs tracking-wider text-porcelain/50">
            Last Updated: August 2026
          </p>
        </div>

        <div className="mt-12 space-y-12 text-porcelain/80">
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">01.</span>
              Acceptance of Terms
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              By accessing and placing an order on AL-KAIF, you agree to be bound by these Terms and Conditions and applicable laws.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">02.</span>
              Product Representations
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              We make every effort to display the colors, textures, and details of our Artificial Jewelry and Perfumes accurately. Minor visual variations in color or packaging may occur due to monitor displays or natural lighting.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">03.</span>
              Pricing & Payment
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              All prices are listed in INR (₹) inclusive of applicable taxes unless stated otherwise. Payments are processed securely via encrypted gateways (Cards, UPI, Netbanking). We reserve the right to cancel orders arising from typographical or technical pricing errors.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">04.</span>
              Intellectual Property
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              All content, images, brand marks, and product descriptions on AL-KAIF are the property of AL-KAIF and protected under intellectual property laws.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">05.</span>
              Governing Law
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Any dispute or claim arising from website use or purchases will be subject to the jurisdiction of the local courts of India.
            </p>
          </section>

          <section className="border border-gold/30 bg-onyx/60 p-8 mt-12">
            <h3 className="font-serif text-xl text-porcelain flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold-light" />
              Concierge & Legal Support
            </h3>
            <p className="mt-3 text-sm leading-7 text-porcelain/70">
              If you have any questions or require clarification regarding our Terms & Conditions, please contact our support team:
            </p>
            <div className="mt-6 grid gap-4 text-sm text-porcelain/80 sm:grid-cols-2">
              <a href="mailto:info@alkaif.in" className="flex items-center gap-3 transition hover:text-gold-light">
                <Mail className="h-4 w-4 text-gold-light" />
                info@alkaif.in
              </a>
              <a href="tel:+917096022333" className="flex items-center gap-3 transition hover:text-gold-light">
                <Phone className="h-4 w-4 text-gold-light" />
                +91 70960 22333
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
