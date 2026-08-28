import { Navbar } from "@/components/layout/navbar";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata = {
  title: "Secure Checkout | AL-KAIF"
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          Commission
        </p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain sm:text-6xl">
          Secure Checkout
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-porcelain/70">
          Every piece leaves the atelier hallmarked, individually numbered and
          despatched insured.
        </p>

        <div className="mt-12">
          <CheckoutView />
        </div>
      </main>
    </>
  );
}
