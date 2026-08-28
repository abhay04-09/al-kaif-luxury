import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { GoogleCallback } from "@/components/auth/google-callback";

export const metadata = {
  title: "Signing you in | AL-KAIF"
};

export default function AuthCallbackPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center sm:px-8">
        <Suspense fallback={null}>
          <GoogleCallback />
        </Suspense>
      </main>
    </>
  );
}
