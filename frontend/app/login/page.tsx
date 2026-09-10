import { Suspense } from "react";
import { redirect } from "next/navigation";
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

  if (await getCurrentUser()) {
    // Someone sent here from the checkout should land back on the checkout,
    // not be dropped into their order history wondering what happened.
    // Only in-site paths, so ?next= cannot be used to bounce anyone elsewhere.
    redirect(safeNext(next));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efe4d2] p-0 sm:p-6">
      <Suspense fallback={null}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
