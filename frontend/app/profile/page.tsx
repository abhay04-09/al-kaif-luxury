import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LogoutButton } from "@/components/auth/logout-button";
import { AccountDetailsForm } from "@/components/account/account-details-form";
import { API_BASE } from "@/lib/api";
import { getSessionToken, requireUser } from "@/lib/session";

export const metadata = {
  title: "My Account | AL-KAIF"
};

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  shippingAddress: string;
  items: { product: { name: string; image: string }; quantity: number }[];
  totalINR: number;
  paymentStatus: string;
  orderStatus: string;
};

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

async function fetchOrders(token: string | null): Promise<Order[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return (await res.json()) as Order[];
  } catch {
    // An account page that cannot reach the archive is still worth showing.
    return [];
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ProfilePage() {
  const user = await requireUser();
  const token = await getSessionToken();
  const orders = await fetchOrders(token);

  // Admins see every order through this endpoint; the figures below are meant
  // to describe one person's own account, so they are not shown to them.
  const isAdmin = user.role === "admin";
  const mine = isAdmin ? [] : orders;

  const spent = mine.reduce((total, order) => total + (order.totalINR ?? 0), 0);
  const inTransit = mine.filter((order) =>
    ["shipped via express", "in artisan crafting", "quality assured", "placed"].includes(
      (order.orderStatus ?? "").toLowerCase()
    )
  ).length;

  const recent = mine.slice(0, 3);
  const lastAddress = mine.find((order) => order.shippingAddress)?.shippingAddress;

  const stats = [
    { label: "Orders placed", value: String(mine.length), icon: Package },
    { label: "On its way", value: String(inTransit), icon: Truck },
    { label: "Total spent", value: inr(spent), icon: ShieldCheck }
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8">
        {/* Identity */}
        <section className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-gold/40 bg-onyx font-serif text-2xl text-gold">
            {initials(user.name) || "AK"}
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] uppercase tracking-luxury text-gold-light">
              {isAdmin ? "Maison Admin" : "Private Client"}
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-porcelain sm:text-5xl">
              {user.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-porcelain/70">
              {user.email ? (
                <span className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {user.email}
                </span>
              ) : null}
              {user.phone ? (
                <span className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {user.phone}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {/* At a glance */}
        {isAdmin ? null : (
          <section className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div className="border border-graphite bg-onyx p-6" key={label}>
                <Icon aria-hidden="true" className="h-5 w-5 text-gold" strokeWidth={1.5} />
                <p className="mt-4 font-serif text-3xl text-porcelain">{value}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-luxury text-mist">
                  {label}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Recent orders */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl text-porcelain">
              {isAdmin ? "Orders" : "Recent orders"}
            </h2>
            <Link
              className="flex items-center gap-1 text-[0.65rem] uppercase tracking-luxury text-gold-light transition hover:text-gold"
              href="/orders"
            >
              View all
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isAdmin ? (
            <p className="mt-6 border border-graphite bg-onyx p-6 text-sm leading-7 text-porcelain/70">
              You are signed in as an administrator. Every client order is listed
              under Orders, and the full panel is at{" "}
              <a
                className="text-gold-light underline-offset-4 hover:underline"
                href="https://al-kaiff-admin.pages.dev"
                rel="noreferrer"
                target="_blank"
              >
                the admin panel
              </a>
              .
            </p>
          ) : recent.length === 0 ? (
            <div className="mt-6 border border-graphite bg-onyx p-8 text-center">
              <p className="font-serif text-2xl text-porcelain">
                No orders yet.
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-porcelain/65">
                When you commission your first piece it will appear here, with
                its progress from the atelier to your door.
              </p>
              <Link
                className="mt-6 inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
                href="/products"
              >
                Shop the collection
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-graphite border-y border-graphite">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5 transition"
                    href="/orders"
                  >
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden border border-white/10 bg-obsidian">
                      {order.items?.[0]?.product?.image ? (
                        <Image
                          alt={order.items[0].product.name}
                          className="object-cover"
                          fill
                          sizes="56px"
                          src={order.items[0].product.image}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.62rem] uppercase tracking-luxury text-gold-light">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 truncate font-serif text-lg text-porcelain transition group-hover:text-gold-light">
                        {order.items?.[0]?.product?.name ?? "Your order"}
                        {order.items?.length > 1
                          ? ` and ${order.items.length - 1} more`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-mist">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}{" "}
                        · {order.orderStatus}
                      </p>
                    </div>
                    <p className="text-sm text-porcelain">{inr(order.totalINR)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Details — editable, because a client's address changes */}
        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <AccountDetailsForm
            address={user.address ?? ""}
            name={user.name}
            phone={user.phone ?? ""}
          />

          <div className="border border-graphite bg-onyx p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl text-porcelain">
              <MapPin aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Last delivered to
            </h2>
            {lastAddress ? (
              <>
                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-porcelain/72">
                  {lastAddress}
                </p>
                <p className="mt-4 text-xs leading-6 text-mist">
                  Where your most recent order went. Your saved address is what
                  checkout fills in next time.
                </p>
              </>
            ) : (
              <p className="mt-5 text-sm leading-7 text-porcelain/65">
                Nothing delivered yet. Once an order arrives, where it went will
                be shown here.
              </p>
            )}

            <h2 className="mt-8 font-serif text-xl text-porcelain">Sign-in</h2>
            <p className="mt-4 text-sm leading-7 text-porcelain/72">
              {user.email ?? "No email on this account"}
            </p>
            <p className="mt-2 text-xs leading-6 text-mist">
              Your email address identifies the account and cannot be changed
              here. Write to us if it needs correcting.
            </p>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-graphite pt-8">
          <Link
            className="inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
            href="/orders"
          >
            View my orders
          </Link>
          <Link
            className="inline-flex min-h-12 items-center border border-graphite px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain/80 transition hover:border-gold-light hover:text-gold-light"
            href="/contact"
          >
            Need help?
          </Link>
          <LogoutButton />
        </div>
      </main>
      <Footer />
    </>
  );
}
