import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Truck, Mail, Phone, Clock, MapPin, PackageCheck, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | AL-KAIF Artificial Jewellery & Perfumes",
  description:
    "Official Shipping and Delivery Policy for AL-KAIF. Details regarding order processing, transit times, liquid fragrance transport, and tracking."
};

export default function DeliveryPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Shipping & Fulfillment
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            We strive to deliver your AL-KAIF Artificial Jewellery and Perfumes as quickly and safely as possible through our trusted courier network.
          </p>
          <p className="mt-3 text-xs tracking-wider text-porcelain/50">
            Last Updated: August 2026
          </p>
        </div>

        <div className="mt-12 space-y-12 text-porcelain/80">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border border-white/10 bg-onyx/40 p-6">
              <Clock className="h-6 w-6 text-gold-light" />
              <h3 className="mt-4 font-serif text-lg text-porcelain">1-2 Days Dispatch</h3>
              <p className="mt-2 text-xs leading-6 text-porcelain/65">
                Quick verification and dispatch excluding Sundays & national holidays.
              </p>
            </div>
            <div className="border border-white/10 bg-onyx/40 p-6">
              <Truck className="h-6 w-6 text-gold-light" />
              <h3 className="mt-4 font-serif text-lg text-porcelain">3-7 Days Delivery</h3>
              <p className="mt-2 text-xs leading-6 text-porcelain/65">
                Standard delivery across India with 3-4 day metro delivery.
              </p>
            </div>
            <div className="border border-white/10 bg-onyx/40 p-6">
              <PackageCheck className="h-6 w-6 text-gold-light" />
              <h3 className="mt-4 font-serif text-lg text-porcelain">Live Tracking</h3>
              <p className="mt-2 text-xs leading-6 text-porcelain/65">
                Instant AWB tracking number and link via SMS / Email upon pickup.
              </p>
            </div>
          </div>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">01.</span>
              Order Processing
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Orders are verified and dispatched within 1 to 2 business days (excluding Sundays and national holidays).
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">02.</span>
              Delivery Timelines
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Standard transit times range from 3 to 7 business days depending on the destination pincode. Metro cities typically receive deliveries within 3 to 4 days.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">03.</span>
              Fragrance & Liquid Transit
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Due to regulatory standards for bottled fragrances and liquid goods, perfume orders may be routed via specialized surface courier networks, which can add 1–2 days in remote locations.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">04.</span>
              Tracking Orders
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              A tracking Air Waybill (AWB) number and live tracking link will be sent via SMS/Email as soon as the courier scans the package at pickup.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">05.</span>
              Shipping Charges
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Standard shipping rates and any free shipping thresholds are clearly calculated and displayed at final checkout.
            </p>
          </section>

          <section className="border border-gold/30 bg-onyx/60 p-8 mt-12">
            <h3 className="font-serif text-xl text-porcelain flex items-center gap-2">
              <Truck className="h-5 w-5 text-gold-light" />
              Delivery Assistance
            </h3>
            <p className="mt-3 text-sm leading-7 text-porcelain/70">
              For any questions regarding your parcel delivery status or shipping timelines, reach out to our team:
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
