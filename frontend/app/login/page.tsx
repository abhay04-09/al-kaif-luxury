import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginClient } from "./login-client";

export const metadata = {
  title: "Sign In | AL-KAIF"
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/orders");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efe4d2] p-0 sm:p-6">
      <Suspense fallback={null}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
