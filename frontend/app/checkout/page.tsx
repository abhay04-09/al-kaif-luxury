import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Secure Checkout | AL-KAIF"
};

// Checked on the server, before a line of the page is sent. A guard that runs
// in the browser is a guard that flickers, and one a client can step around.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // An order has to belong to someone: it is how a client finds it again, how
  // they track it, and how they cancel it. The bag is untouched by the detour.
  if (!(await getCurrentUser())) redirect("/login?next=/checkout");

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
          Every piece leaves the atelier quality-checked, individually curated and
          dispatched with tamper-proof packaging.
        </p>

        <div className="mt-12">
          <CheckoutView />
        </div>
      </main>
    </>
  );
}
