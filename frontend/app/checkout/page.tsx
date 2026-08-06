import { Navbar } from "@/components/layout/navbar";

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Checkout</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Secure Checkout</h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <form className="grid gap-5 border border-white/10 bg-onyx p-6">
            <input className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light" placeholder="Full name" />
            <input className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light" placeholder="Email address" type="email" />
            <input className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light" placeholder="Mobile number" />
            <input className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light" placeholder="Shipping address" />
            <button className="min-h-12 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light" type="button">
              Pay with Razorpay
            </button>
          </form>
          <aside className="h-fit border border-white/10 bg-onyx p-6">
            <h2 className="font-serif text-3xl text-porcelain">Next Backend Step</h2>
            <p className="mt-4 text-sm leading-7 text-porcelain/68">
              This page will call /api/payments/razorpay/order after PostgreSQL orders are saved.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
