import { Navbar } from "@/components/layout/navbar";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await requireUser();
  // Read the current role from PostgreSQL so an old browser session cannot
  // expose the all-orders view after an administrator has been demoted.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  const isAdmin = user?.role === "ADMIN";

  const orders = await prisma.order.findMany({
    ...(isAdmin ? {} : { where: { userId: session.user.id } }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      ...(isAdmin
        ? {
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            shippingAddress: true,
            items: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                price: true
              }
            }
          }
        : {})
    }
  });

  const title = isAdmin ? "Order Management" : "Order History";
  const eyebrow = isAdmin ? "Admin / All Orders" : "My Orders";
  const emptyMessage = isAdmin
    ? "No customer orders have been placed yet."
    : "You have not placed any orders yet.";

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">{title}</h1>
        {isAdmin ? (
          <p className="mt-5 max-w-2xl text-base leading-8 text-porcelain/70">
            Review every customer order, its delivery details, and the products purchased.
          </p>
        ) : null}

        {orders.length === 0 ? (
          <div className="mt-10 border border-white/10 bg-onyx p-6">
            <p className="text-porcelain/70">{emptyMessage}</p>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {orders.map((order) => (
              <div className="py-6" key={order.id}>
                <div className="grid gap-3 sm:grid-cols-4">
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

                {isAdmin ? (
                  <div className="mt-5 grid gap-5 border-l border-gold/40 pl-4 text-sm text-porcelain/70 md:grid-cols-2">
                    <div>
                      <p className="text-porcelain">{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                      <p>{order.customerPhone}</p>
                      <p className="mt-2 whitespace-pre-line">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-[0.68rem] uppercase tracking-luxury text-gold-light">Items</p>
                      <ul className="space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.productName} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
