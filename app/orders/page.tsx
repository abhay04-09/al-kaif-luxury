import { Navbar } from "@/components/layout/navbar";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await requireUser();

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true
    }
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">My Orders</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Order History</h1>

        {orders.length === 0 ? (
          <div className="mt-10 border border-white/10 bg-onyx p-6">
            <p className="text-porcelain/70">
              You have not placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {orders.map((order) => (
              <div className="grid gap-3 py-6 sm:grid-cols-4" key={order.id}>
                <span className="font-serif text-2xl text-porcelain">
                  #{order.id.slice(-8).toUpperCase()}
                </span>
                <span className="text-sm text-porcelain/70">
                  {order.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
                <span className="text-sm text-gold-light">{order.status}</span>
                <span className="text-sm text-porcelain/80 sm:text-right">
                  ₹{order.total.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}