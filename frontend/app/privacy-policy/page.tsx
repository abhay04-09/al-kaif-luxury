import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Lock, Mail, Phone, ShieldCheck, Database, Cookie, Truck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | AL-KAIF Artificial Jewellery & Perfumes",
  description:
    "Official Privacy Policy for AL-KAIF. Learn how we collect, handle, and secure your personal details and payment data."
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Data Protection & Privacy
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            At AL-KAIF, your privacy and data security are fundamental priorities. Read below to understand how your information is handled when ordering from our platform.
          </p>
          <p className="mt-3 text-xs tracking-wider text-porcelain/50">
            Last Updated: August 2026
          </p>
        </div>

        <div className="mt-12 space-y-12 text-porcelain/80">
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">01.</span>
              Information Collected
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              We collect essential contact information including name, delivery address, phone number, and email address during checkout to process orders and provide delivery updates.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">02.</span>
              Payment Data Security
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              AL-Kaif does not store credit card, debit card, or UPI PIN details. All transactions are routed through PCI-DSS-compliant payment providers.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">03.</span>
              Third-Party Service Providers
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Your delivery details (name, phone, shipping address) are shared strictly with our verified courier aggregators (e.g., Shipmozo, Delhivery, etc.) solely to fulfill parcel delivery.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">04.</span>
              Cookies
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Our platform uses session and analytics cookies to retain cart states and improve browsing performance.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">05.</span>
              Data Rights
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              You may contact support at any time to request updates or deletion of your personal account records.
            </p>
          </section>

          <section className="border border-gold/30 bg-onyx/60 p-8 mt-12">
            <h3 className="font-serif text-xl text-porcelain flex items-center gap-2">
              <Lock className="h-5 w-5 text-gold-light" />
              Privacy & Data Concerns
            </h3>
            <p className="mt-3 text-sm leading-7 text-porcelain/70">
              For any privacy questions or data update requests, please reach out to our client support:
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
