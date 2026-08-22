"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";
import { PhoneAuth } from "@/components/auth/phone-auth";
import { useSession } from "@/components/auth/session-provider";

const fieldClass =
  "min-h-12 w-full border border-white/10 bg-obsidian px-4 text-porcelain outline-none transition focus:border-gold-light";
const labelClass =
  "mb-2 block text-[0.65rem] uppercase tracking-luxury text-gold-light";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = isRegister
      ? {
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
          phone: String(form.get("phone") ?? "").trim() || undefined
        }
      : {
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? "")
        };

    try {
      const res = await fetch(
        isRegister ? "/api/session/register" : "/api/session/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      await refresh();
      // Send people back where they came from, so a nudge to sign in from the
      // bag does not dump them on the home page afterwards.
      router.replace(params.get("next") ?? "/orders");
      router.refresh();
    } catch {
      setError("Could not reach the maison. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        {isRegister ? (
          <div>
            <label className={labelClass} htmlFor="name">
              Full name
            </label>
            <input
              autoComplete="name"
              className={fieldClass}
              id="name"
              name="name"
              required
              type="text"
            />
          </div>
        ) : null}

        <div>
          <label className={labelClass} htmlFor="email">
            Email address
          </label>
          <input
            autoComplete="email"
            className={fieldClass}
            id="email"
            name="email"
            required
            type="email"
          />
        </div>

        {isRegister ? (
          <div>
            <label className={labelClass} htmlFor="phone">
              Mobile number <span className="text-mist">(optional)</span>
            </label>
            <input
              autoComplete="tel"
              className={fieldClass}
              id="phone"
              name="phone"
              type="tel"
            />
          </div>
        ) : null}

        <div>
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            className={fieldClass}
            id="password"
            minLength={isRegister ? 8 : undefined}
            name="password"
            required
            type="password"
          />
          {isRegister ? (
            <p className="mt-2 text-xs text-mist">At least 8 characters.</p>
          ) : null}
        </div>

        {error ? (
          <p
            className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : null}
          {isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <GoogleButton next={params.get("next") ?? undefined} />

      <PhoneAuth mode={mode} next={params.get("next") ?? undefined} />

      <p className="text-sm text-porcelain/70">
        {isRegister ? "Already a client? " : "New to AL-KAIF? "}
        <Link
          className="text-gold-light underline-offset-4 hover:underline"
          href={isRegister ? "/login" : "/signup"}
        >
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
