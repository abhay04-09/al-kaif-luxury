"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getSupabaseBrowserClient,
  isGoogleSignInConfigured
} from "@/lib/supabase-browser";

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.2 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2A19.6 19.6 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function GoogleButton({ next }: { next?: string }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rendering a button that cannot work is worse than rendering nothing, so it
  // stays hidden until the Supabase keys are actually present.
  if (!isGoogleSignInConfigured()) return null;

  async function signIn() {
    setError(null);
    setIsRedirecting(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Google sign-in is not available right now.");
      setIsRedirecting(false);
      return;
    }

    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", next);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() }
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsRedirecting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-graphite" />
        <span className="text-[0.6rem] uppercase tracking-luxury text-mist">
          or
        </span>
        <span className="h-px flex-1 bg-graphite" />
      </div>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-graphite bg-obsidian px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:border-gold-light hover:text-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRedirecting}
        onClick={signIn}
        type="button"
      >
        {isRedirecting ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleGlyph />
        )}
        Continue with Google
      </button>

      {error ? (
        <p className="text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
