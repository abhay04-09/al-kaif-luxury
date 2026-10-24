import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { OrdersArchive } from "@/components/orders/orders-archive";
import Home from "@/app/page";
import { getCurrentUser } from "@/lib/session";
import { LoginClient } from "./login-client";
import { safeNext } from "@/lib/safe-next";

export const metadata = {
  title: "Sign In | AL-KAIF"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  const user = await getCurrentUser();
  if (user) {
    // Someone sent here from the checkout should land back on the checkout,
    // not be dropped into their order history wondering what happened.
    // Only in-site paths, so ?next= cannot be used to bounce anyone elsewhere.
    if (next) redirect(safeNext(next));

    // Otherwise a signed-in client is shown their orders here, in place of the
    // sign-in form they no longer need.
    return (
      <>
        <Navbar />
        <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
          <OrdersArchive user={user} />
        </main>
      </>
    );
  }

  return (
    <>
      {/* The shop itself, behind the sign-in card. It is for looking at, not
          using: inert keeps it out of reach of the keyboard and screen readers
          while the form is open. */}
      <div aria-hidden="true" inert>
        <Home />
      </div>

      <main className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-md sm:items-center sm:p-6">
        <Suspense fallback={null}>
          <LoginClient />
        </Suspense>
      </main>
    </>
  );
}
