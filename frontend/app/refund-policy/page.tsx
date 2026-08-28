import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RefreshCw, Video, AlertTriangle, ShieldCheck, Mail, Phone, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Exchange, Return & Refund Policy | AL-KAIF Artificial Jewellery & Perfumes",
  description:
    "Official Exchange, Return & Refund Policy for AL-KAIF. Eligibility windows, mandatory unboxing video requirements, category conditions, and refund timelines."
};

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Customer Care & Satisfaction
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Exchange, Return & Refund Policy
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            At AL-KAIF, we take immense pride in the craftsmanship of our Artificial Jewellery and Perfumes. Please review our guidelines for exchanges, returns, and refunds below.
          </p>
          <p className="mt-3 text-xs tracking-wider text-porcelain/50">
            Last Updated: August 2026
          </p>
        </div>

        <div className="mt-12 space-y-12 text-porcelain/80">
          {/* Mandatory Unboxing Highlight Box */}
          <div className="border border-gold/40 bg-gold/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Video className="h-7 w-7 text-gold-light shrink-0 mt-1" />
              <div>
                <h3 className="font-serif text-xl text-gold-light">Mandatory Unboxing Video Requirement</h3>
                <p className="mt-2 text-sm leading-7 text-porcelain/80">
                  Due to the delicate nature of artificial jewelry and fragile glass perfume bottles, a clear, continuous unboxing video (showing the sealed outer parcel being opened) is mandatory to claim replacements for items received damaged, missing, or incorrect.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">01.</span>
              Eligibility Window
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Exchange and return requests must be raised within 48 to 72 hours of delivery.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">02.</span>
              Category Conditions
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 mt-4">
              <div className="border border-white/10 bg-onyx/40 p-6">
                <h3 className="font-serif text-lg text-porcelain text-gold-light">Artificial Jewelry</h3>
                <p className="mt-3 text-sm leading-7 text-porcelain/70">
                  Must be unworn, in original condition with tags intact, and in original protective boxes.
                </p>
              </div>
              <div className="border border-white/10 bg-onyx/40 p-6">
                <h3 className="font-serif text-lg text-porcelain text-gold-light">Perfumes</h3>
                <p className="mt-3 text-sm leading-7 text-porcelain/70">
                  Returnable only if damaged in transit or defective. Opened, tested, or unsealed perfume bottles cannot be returned due to hygiene and safety standards.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">03.</span>
              Exchange Process
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Once your exchange request is approved with proof, a reverse pickup will be scheduled. If reverse pickup is unavailable for your pincode, we may request you to self-ship to our warehouse.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-serif text-2xl text-porcelain flex items-center gap-3">
              <span className="text-gold-light text-sm font-sans tracking-luxury">04.</span>
              Refund Timeline
            </h2>
            <p className="text-sm leading-8 text-porcelain/70">
              Approved refunds for returned items are credited back to the original payment source (UPI/Bank/Card) within 5 to 7 business days after the product passes warehouse quality inspection. COD orders receive refunds via direct bank transfer (NEFT/UPI).
            </p>
          </section>

          <section className="border border-gold/30 bg-onyx/60 p-8 mt-12">
            <h3 className="font-serif text-xl text-porcelain flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-gold-light" />
              Raise an Exchange or Return Request
            </h3>
            <p className="mt-3 text-sm leading-7 text-porcelain/70">
              To submit your unboxing video proof or initiate an exchange, please contact our support desk:
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
