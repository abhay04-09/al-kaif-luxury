import { Navbar } from "@/components/layout/navbar";
import { OrdersArchive } from "@/components/orders/orders-archive";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "My Orders | AL-KAIF"
};

// Orders change the moment one is placed, so never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <OrdersArchive user={user} />
      </main>
    </>
  );
}
