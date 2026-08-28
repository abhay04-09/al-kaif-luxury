import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Sign In | AL-KAIF"
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/orders");

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-md px-5 pb-24 pt-16 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          Client Portal
        </p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Sign In</h1>
        <p className="mt-5 text-sm leading-7 text-porcelain/70">
          Access your commissions, order history and account details.
        </p>

        <div className="mt-10 border border-graphite bg-onyx p-6">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </main>
    </>
  );
}
