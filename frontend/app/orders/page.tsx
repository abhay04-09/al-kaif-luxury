import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { API_BASE } from "@/lib/api";
import { getSessionToken, requireUser } from "@/lib/session";

export const metadata = {
  title: "My Orders | AL-KAIF"
};

// Orders change the moment one is placed, so never serve a cached copy.
export const dynamic = "force-dynamic";

type OrderItem = {
  product: { id: string; name: string; image: string; priceINR: number };
  quantity: number;
  selectedMetal?: string;
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

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid" || normalized === "delivered") {
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  }
  if (normalized === "cancelled" || normalized === "failed") {
    return "border-red-400/40 bg-red-400/10 text-red-200";
  }
  return "border-gold/40 bg-gold/10 text-gold-light";
}

async function fetchOrders(token: string): Promise<Order[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return (await res.json()) as Order[];
  } catch (error) {
    console.warn("Order lookup failed", error);
    return null;
  }
}

export default async function OrdersPage() {
  const user = await requireUser();
  const token = await getSessionToken();
  const orders = token ? await fetchOrders(token) : null;
  const isAdmin = user.role === "admin";

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          {isAdmin ? "Maison / All Commissions" : "Client Order Archive"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">
          {isAdmin ? "All Orders" : "My Orders"}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-porcelain/70">
          Signed in as {user.name} · {user.email}
        </p>

        {orders === null ? (
          <div className="mt-10 border border-red-500/30 bg-red-500/5 p-6">
            <p className="text-porcelain/80">
              We could not reach the maison to load your orders. Please refresh
              in a moment.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 border border-graphite bg-onyx p-8 text-center">
            <p className="font-serif text-2xl text-porcelain">
              No commissions yet
            </p>
            <p className="mt-3 text-sm text-porcelain/70">
              When you place an order it will appear here with its full history.
            </p>
            <Link
              className="mt-6 inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
              href="/products"
            >
              Explore the collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {orders.map((order) => (
              <article className="border border-graphite bg-onyx" key={order.id}>
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite px-6 py-5">
                  <div>
                    <p className="font-serif text-2xl text-porcelain">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-mist">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                      {" · "}
                      {order.paymentMethod}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`border px-3 py-1 text-[0.6rem] uppercase tracking-luxury ${statusTone(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span
                      className={`border px-3 py-1 text-[0.6rem] uppercase tracking-luxury ${statusTone(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </header>

                <ul className="divide-y divide-graphite">
                  {order.items.map((item, index) => (
                    <li
                      className="flex items-center gap-4 px-6 py-4"
                      key={`${order.id}-${item.product.id}-${index}`}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-graphite bg-obsidian">
                        {item.product.image ? (
                          <Image
                            alt=""
                            className="object-cover"
                            fill
                            sizes="64px"
                            src={item.product.image}
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-porcelain">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-xs text-mist">
                          Qty {item.quantity}
                          {item.selectedMetal ? ` · ${item.selectedMetal}` : ""}
                          {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                        </p>
                      </div>

                      <p className="text-sm text-porcelain/80">
                        {inr(item.product.priceINR * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <footer className="grid gap-6 border-t border-graphite px-6 py-5 md:grid-cols-2">
                  <div className="text-sm text-porcelain/70">
                    <p className="mb-2 text-[0.6rem] uppercase tracking-luxury text-gold-light">
                      Delivering to
                    </p>
                    <p className="text-porcelain">{order.customerName}</p>
                    <p>{order.customerPhone}</p>
                    {isAdmin ? <p>{order.customerEmail}</p> : null}
                    <p className="mt-2 whitespace-pre-line">
                      {order.shippingAddress}
                    </p>
                    {order.giftWrapped ? (
                      <p className="mt-2 text-gold-light">Gift wrapped</p>
                    ) : null}
                  </div>

                  <dl className="space-y-2 text-sm md:justify-self-end md:text-right">
                    <div className="flex justify-between gap-8 text-porcelain/70">
                      <dt>Subtotal</dt>
                      <dd>{inr(order.subtotalINR)}</dd>
                    </div>
                    <div className="flex justify-between gap-8 text-porcelain/70">
                      <dt>Tax</dt>
                      <dd>{inr(order.taxINR)}</dd>
                    </div>
                    <div className="flex justify-between gap-8 border-t border-graphite pt-2 font-serif text-lg text-gold-light">
                      <dt>Total</dt>
                      <dd>{inr(order.totalINR)}</dd>
                    </div>
                  </dl>
                </footer>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
