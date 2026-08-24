"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Gift,
  Loader2,
  Lock,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { getCartSummary } from "@/lib/cart";
import { useCatalogue } from "@/lib/use-catalogue";
import type { CartItem } from "@/types/product";

const CART_KEY = "al-kaif-cart";
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

// The Worker applies 3% tax when it prices the order. Mirroring the rate here
// keeps the summary honest — the figure the client agrees to is the figure the
// maison charges.
const TAX_RATE = 0.03;

type PaymentMethod = "Razorpay" | "COD";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const fieldClass =
  "min-h-12 w-full border border-graphite bg-obsidian px-4 text-porcelain outline-none transition placeholder:text-mist/50 focus:border-gold-light";
const labelClass =
  "mb-2 block text-[0.62rem] uppercase tracking-luxury text-gold-light";

function StepHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 font-serif text-sm text-gold">
        {step}
      </span>
      <h2 className="font-serif text-2xl text-porcelain">{title}</h2>
      <span className="h-px flex-1 bg-graphite" />
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { user, status } = useSession();
  const { catalogue, isLoading } = useCatalogue();

  const [items, setItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("Razorpay");
  const [giftWrapped, setGiftWrapped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_KEY);
      setItems(stored ? (JSON.parse(stored) as CartItem[]) : []);
    } catch {
      setItems([]);
    }
    setCartReady(true);
  }, []);

  const summary = useMemo(
    () => getCartSummary(items, catalogue),
    [items, catalogue]
  );

  const payableLines = summary.lines.filter((line) => line.product.inStock);
  const tax = Math.round(summary.subtotal * TAX_RATE);
  const total = summary.subtotal + tax;

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (payableLines.length === 0) {
      setError("Your bag has nothing available to purchase.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const details = {
      customerName: String(form.get("customerName") ?? "").trim(),
      customerEmail: String(form.get("customerEmail") ?? "").trim(),
      customerPhone: String(form.get("customerPhone") ?? "").trim(),
      shippingAddress: String(form.get("shippingAddress") ?? "").trim(),
      notes: String(form.get("notes") ?? "").trim() || undefined,
      giftWrapped
    };

    const orderItems = payableLines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
      selectedSize: line.size
    }));

    setIsPlacing(true);

    try {
      if (method === "COD") {
        await submitOrder({ ...details, paymentMethod: "COD", items: orderItems });
        return;
      }

      const scriptReady = await loadRazorpay();
      if (!scriptReady) {
        setError("Could not load the secure payment window. Please try again.");
        setIsPlacing(false);
        return;
      }

      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The details go up with the basket so the maison can complete the
        // order from Razorpay's webhook if this browser never comes back.
        body: JSON.stringify({ ...details, items: orderItems })
      });
      const order = (await res.json()) as {
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        error?: string;
      };

      if (!res.ok || !order.razorpayOrderId || !order.keyId) {
        setError(order.error ?? "We could not open the payment window.");
        setIsPlacing(false);
        return;
      }

      const checkout = new window.Razorpay!({
        key: order.keyId,
        order_id: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency ?? "INR",
        name: "AL-KAIF",
        description: "Fine Jewellery & Perfumes",
        prefill: {
          name: details.customerName,
          email: details.customerEmail,
          contact: details.customerPhone
        },
        theme: { color: "#c5a059" },
        // Razorpay closes its own window before calling this, so the page must
        // come back out of its submitting state or the client is left stuck.
        modal: {
          ondismiss: () => {
            setIsPlacing(false);
            setError("Payment was cancelled. Your bag is untouched.");
          }
        },
        handler: async (response: Record<string, string>) => {
          await submitOrder({
            ...details,
            paymentMethod: "Razorpay",
            items: orderItems,
            payment: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }
          });
        }
      });

      checkout.open();
    } catch {
      setError("Something interrupted the order. Please try again.");
      setIsPlacing(false);
    }
  }

  async function submitOrder(payload: Record<string, unknown>) {
    const res = await fetch("/api/checkout/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await res.json()) as { orderNumber?: string; error?: string };

    if (!res.ok) {
      setError(data.error ?? "The order could not be completed.");
      setIsPlacing(false);
      return;
    }

    window.localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("al-kaif-cart-updated"));
    router.replace(`/orders?placed=${data.orderNumber ?? ""}`);
    router.refresh();
  }

  if (!cartReady || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (payableLines.length === 0) {
    return (
      <div className="mx-auto max-w-xl border border-graphite bg-onyx p-10 text-center">
        <p className="font-serif text-3xl text-porcelain">Your bag is empty</p>
        <p className="mt-4 text-sm leading-7 text-porcelain/70">
          Once you have chosen a piece, checkout will open here.
        </p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center border border-gold/70 px-8 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
          href="/products"
        >
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-10 lg:grid-cols-[1fr_24rem]" onSubmit={placeOrder}>
      <div className="space-y-12">
        {status === "unauthenticated" ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-gold/30 bg-gold/5 px-5 py-4">
            <p className="text-sm text-porcelain/80">
              Sign in to keep this order in your archive.
            </p>
            <Link
              className="text-[0.65rem] uppercase tracking-luxury text-gold-light underline-offset-4 hover:underline"
              href="/login?next=/checkout"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        <section>
          <StepHeading step="01" title="Contact" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="customerName">
                Full name
              </label>
              <input
                autoComplete="name"
                className={fieldClass}
                defaultValue={user?.name ?? ""}
                id="customerName"
                name="customerName"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="customerPhone">
                Mobile number
              </label>
              <input
                autoComplete="tel"
                className={fieldClass}
                defaultValue={user?.phone ?? ""}
                id="customerPhone"
                name="customerPhone"
                placeholder="+91"
                required
                type="tel"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="customerEmail">
                Email address
              </label>
              <input
                autoComplete="email"
                className={fieldClass}
                defaultValue={user?.email ?? ""}
                id="customerEmail"
                name="customerEmail"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
          </div>
        </section>

        <section>
          <StepHeading step="02" title="Delivery" />
          <div>
            <label className={labelClass} htmlFor="shippingAddress">
              Shipping address
            </label>
            <textarea
              autoComplete="street-address"
              className={`${fieldClass} min-h-32 resize-y py-3`}
              defaultValue={user?.address ?? ""}
              id="shippingAddress"
              name="shippingAddress"
              placeholder="Flat, building, street, city, state, PIN"
              required
            />
          </div>

          <div className="mt-5">
            <label className={labelClass} htmlFor="notes">
              Notes for the atelier <span className="text-mist">(optional)</span>
            </label>
            <input
              className={fieldClass}
              id="notes"
              name="notes"
              placeholder="Engraving, sizing, delivery timing"
            />
          </div>

          <button
            aria-pressed={giftWrapped}
            className={`mt-5 flex w-full items-center gap-4 border px-5 py-4 text-left transition ${
              giftWrapped
                ? "border-gold bg-gold/10"
                : "border-graphite hover:border-gold/50"
            }`}
            onClick={() => setGiftWrapped((current) => !current)}
            type="button"
          >
            <Gift
              aria-hidden="true"
              className={`h-5 w-5 ${giftWrapped ? "text-gold" : "text-mist"}`}
              strokeWidth={1.4}
            />
            <span className="flex-1">
              <span className="block text-sm text-porcelain">
                Signature velvet box &amp; wax seal
              </span>
              <span className="mt-1 block text-xs text-mist">
                Complimentary gift presentation
              </span>
            </span>
            <span className="text-[0.62rem] uppercase tracking-luxury text-gold-light">
              {giftWrapped ? "Added" : "Add"}
            </span>
          </button>
        </section>

        <section>
          <StepHeading step="03" title="Payment" />
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                {
                  value: "Razorpay" as const,
                  title: "Pay securely now",
                  copy: "Card, UPI, netbanking or wallet",
                  icon: ShieldCheck
                },
                {
                  value: "COD" as const,
                  title: "Cash on delivery",
                  copy: "Settle when the piece arrives",
                  icon: Truck
                }
              ]
            ).map((option) => {
              const Icon = option.icon;
              const isActive = method === option.value;

              return (
                <button
                  aria-pressed={isActive}
                  className={`border px-5 py-5 text-left transition ${
                    isActive
                      ? "border-gold bg-gold/10"
                      : "border-graphite hover:border-gold/50"
                  }`}
                  key={option.value}
                  onClick={() => setMethod(option.value)}
                  type="button"
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-5 w-5 ${isActive ? "text-gold" : "text-mist"}`}
                    strokeWidth={1.4}
                  />
                  <span className="mt-3 block text-sm text-porcelain">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-xs text-mist">
                    {option.copy}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="border border-graphite bg-onyx">
          <h2 className="border-b border-graphite px-6 py-5 font-serif text-xl text-porcelain">
            Order Summary
          </h2>

          <ul className="divide-y divide-graphite">
            {payableLines.map((line) => (
              <li
                className="flex gap-4 px-6 py-4"
                key={`${line.product.id}-${line.size ?? ""}`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-graphite bg-obsidian">
                  {line.product.image ? (
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={line.product.image}
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-porcelain">
                    {line.product.name}
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    Qty {line.quantity}
                    {line.size ? ` · ${line.size}` : ""}
                  </p>
                </div>

                <p className="text-sm text-porcelain/80">{inr(line.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <dl className="space-y-3 border-t border-graphite px-6 py-5 text-sm">
            <div className="flex justify-between text-porcelain/70">
              <dt>Subtotal</dt>
              <dd>{inr(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-porcelain/70">
              <dt>Tax</dt>
              <dd>{inr(tax)}</dd>
            </div>
            <div className="flex justify-between text-porcelain/70">
              <dt>Shipping</dt>
              <dd className="text-gold-light">Complimentary</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-graphite pt-4">
              <dt className="text-[0.62rem] uppercase tracking-luxury text-gold-light">
                Total
              </dt>
              <dd className="font-serif text-3xl text-porcelain">{inr(total)}</dd>
            </div>
          </dl>

          {summary.hasSoldOut ? (
            <p className="mx-6 mb-5 border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-gold-light">
              A sold-out piece in your bag has been left out of this order.
            </p>
          ) : null}

          {error ? (
            <p
              className="mx-6 mb-5 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="px-6 pb-6">
            <button
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-gold px-6 text-[0.7rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPlacing}
              type="submit"
            >
              {isPlacing ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Lock aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
              )}
              {method === "COD" ? "Place order" : `Pay ${inr(total)}`}
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-[0.62rem] uppercase tracking-luxury text-mist">
              <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Hallmarked &amp; insured despatch
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
