"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function GoogleCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [error, setError] = useState<string | null>(null);
  // React runs effects twice in development; exchanging the same code twice
  // fails, so the attempt is guarded rather than left to chance.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function complete() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Google sign-in is not configured.");
        return;
      }

      const oauthError = params.get("error_description") ?? params.get("error");
      if (oauthError) {
        setError(oauthError);
        return;
      }

      const code = params.get("code");
      if (!code) {
        setError("Google did not return a sign-in code.");
        return;
      }

      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      const accessToken = data?.session?.access_token;

      if (exchangeError || !accessToken) {
        setError(exchangeError?.message ?? "Could not complete Google sign-in.");
        return;
      }

      // Hand the verified Google identity to the maison's own API, which checks
      // it with Supabase before issuing the session this site actually runs on.
      const res = await fetch("/api/session/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken })
      });
      const body = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(body.error ?? "Could not complete Google sign-in.");
        return;
      }

      // The Supabase session was only ever a courier for the Google identity.
      await supabase.auth.signOut();

      await refresh();
      router.replace(params.get("next") ?? "/orders");
      router.refresh();
    }

    void complete().catch(() => setError("Something interrupted the sign-in."));
  }, [params, refresh, router]);

  if (error) {
    return (
      <>
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          Sign-in failed
        </p>
        <p className="mt-4 text-sm leading-7 text-porcelain/80">{error}</p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
          href="/login"
        >
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-gold" />
      <p className="mt-6 text-[0.7rem] uppercase tracking-luxury text-gold-light">
        Signing you in
      </p>
      <p className="mt-3 text-sm text-porcelain/70">One moment.</p>
    </>
  );
}
