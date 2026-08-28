import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { API_BASE } from "@/lib/api";
import { getSessionToken, requireUser } from "@/lib/session";

export const metadata = {
  title: "Order | AL-KAIF"
};

export const dynamic = "force-dynamic";

type OrderItem = {
  product: { id: string; name: string; image: string; priceINR: number };
  quantity: number;
  selectedSize?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotalINR: number;
  taxINR: number;
  totalINR: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  giftWrapped?: boolean;
};

const inr = (value: number) => `₹${(value ?? 0).toLocaleString("en-IN")}`;

const JOURNEY = [
  "Placed",
  "In Artisan Crafting",
  "Quality Assured",
  "Shipped via Express",
  "Delivered"
];

function tone(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "paid" || s === "delivered") {
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  }
  if (s === "cancelled" || s === "failed") {
    return "border-red-400/40 bg-red-400/10 text-red-200";
  }
  return "border-gold/40 bg-gold/10 text-gold-light";
}

async function fetchOrder(
  orderNumber: string,
  token: string | null
): Promise<Order | null> {
  if (!token) return null;
  try {
    const res = await fetch(
      `${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as Order;
  } catch {
    return null;
  }
}

export default async function OrderPage({
  params,
  searchParams
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  await requireUser();
  const { orderNumber } = await params;
  const { placed } = await searchParams;

  const token = await getSessionToken();
  const order = await fetchOrder(orderNumber, token);
  if (!order) notFound();

  const isCancelled = (order.orderStatus ?? "").toLowerCase() === "cancelled";
  const stepIndex = JOURNEY.findIndex(
    (step) => step.toLowerCase() === (order.orderStatus ?? "").toLowerCase()
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-4xl px-5 pb-24 pt-16 sm:px-8">
        <Link
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-luxury text-gold-light transition hover:text-gold"
          href="/orders"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          All orders
        </Link>

        {/* The moment after paying deserves more than a line of small print. */}
        {placed ? (
          <section className="mt-8 border border-emerald-400/30 bg-emerald-400/5 p-8 text-center">
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto h-10 w-10 text-emerald-300"
              strokeWidth={1.3}
            />
            <h1 className="mt-5 font-serif text-4xl text-porcelain">
              Thank you, {order.customerName.split(/\s+/)[0]}.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-porcelain/72">
              Your order is confirmed. We have sent nothing to your inbox yet —
              this page is your receipt, and it will always be here under your
              orders.
            </p>
            <p className="mt-6 font-serif text-2xl tracking-wide text-gold-light">
              {order.orderNumber}
            </p>
          </section>
        ) : (
          <section className="mt-8">
            <p className="text-[0.65rem] uppercase tracking-luxury text-gold-light">
              Order {order.orderNumber}
            </p>
            <h1 className="mt-3 font-serif text-4xl text-porcelain sm:text-5xl">
              Your order
            </h1>
          </section>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={`border px-3 py-1.5 text-[0.6rem] uppercase tracking-luxury ${tone(order.orderStatus)}`}
          >
            {order.orderStatus}
          </span>
          <span
            className={`border px-3 py-1.5 text-[0.6rem] uppercase tracking-luxury ${tone(order.paymentStatus)}`}
          >
            {order.paymentStatus}
          </span>
          <span className="text-xs text-mist">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </span>
        </div>

        {/* Progress */}
        {isCancelled ? null : (
          <section className="mt-10 border border-graphite bg-onyx p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl text-porcelain">
              <Package aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Progress
            </h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-5">
              {JOURNEY.map((step, index) => {
                const done = stepIndex >= index;
                return (
                  <li key={step}>
                    <span
                      aria-hidden="true"
                      className={`block h-0.5 w-full ${done ? "bg-gold" : "bg-graphite"}`}
                    />
                    <p
                      className={`mt-3 text-[0.6rem] uppercase leading-5 tracking-luxury ${
                        done ? "text-gold-light" : "text-mist"
                      }`}
                    >
                      {step}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Pieces */}
        <section className="mt-6 border border-graphite bg-onyx">
          <h2 className="border-b border-graphite px-6 py-5 font-serif text-xl text-porcelain">
            {order.items?.length === 1 ? "The piece" : "The pieces"}
          </h2>
          <ul className="divide-y divide-graphite">
            {(order.items ?? []).map((item, index) => (
              <li
                className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-6 py-5"
                key={`${item.product?.id}-${index}`}
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-white/10 bg-obsidian">
                  {item.product?.image ? (
                    <Image
                      alt={item.product.name}
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={item.product.image}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg text-porcelain">
                    {item.product?.name}
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    Quantity {item.quantity}
                    {item.selectedSize ? ` · Size ${item.selectedSize}` : ""}
                  </p>
                </div>
                <p className="text-sm text-porcelain">
                  {inr((item.product?.priceINR ?? 0) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="space-y-3 border-t border-graphite px-6 py-5 text-sm">
            <div className="flex justify-between text-porcelain/70">
              <dt>Subtotal</dt>
              <dd>{inr(order.totalINR)}</dd>
            </div>
            <div className="flex justify-between text-porcelain/70">
              <dt>GST (included)</dt>
              <dd>{inr(order.taxINR)}</dd>
            </div>
            <div className="flex justify-between text-porcelain/70">
              <dt>Shipping</dt>
              <dd className="text-gold-light">Complimentary</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-graphite pt-4">
              <dt className="text-[0.62rem] uppercase tracking-luxury text-gold-light">
                Total paid
              </dt>
              <dd className="font-serif text-3xl text-porcelain">
                {inr(order.totalINR)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Where and how */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border border-graphite bg-onyx p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl text-porcelain">
              <MapPin aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Delivering to
            </h2>
            <p className="mt-5 text-sm leading-7 text-porcelain/72">
              {order.customerName}
              <br />
              <span className="whitespace-pre-line">{order.shippingAddress}</span>
              <br />
              {order.customerPhone}
            </p>
          </div>

          <div className="border border-graphite bg-onyx p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl text-porcelain">
              <CreditCard aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Payment
            </h2>
            <p className="mt-5 text-sm leading-7 text-porcelain/72">
              {order.paymentMethod === "COD"
                ? "Cash on delivery"
                : "Paid online via Razorpay"}
              <br />
              Status: {order.paymentStatus}
              {order.giftWrapped ? (
                <>
                  <br />
                  Gift wrapped
                </>
              ) : null}
            </p>
            <p className="mt-4 text-xs leading-6 text-mist">
              A question about this order? Quote {order.orderNumber} when you
              write to us.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            className="inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
            href="/orders"
          >
            View all orders
          </Link>
          <Link
            className="inline-flex min-h-12 items-center border border-graphite px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain/80 transition hover:border-gold-light hover:text-gold-light"
            href="/products"
          >
            Continue shopping
          </Link>
          <Link
            className="inline-flex min-h-12 items-center px-4 text-[0.7rem] uppercase tracking-luxury text-porcelain/70 transition hover:text-gold-light"
            href="/contact"
          >
            Need help?
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
