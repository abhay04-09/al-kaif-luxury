"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";
import { PhoneAuth } from "@/components/auth/phone-auth";
import { useSession } from "@/components/auth/session-provider";
import { safeNext } from "@/lib/safe-next";

const fieldClass =
  "min-h-12 w-full rounded-md border border-graphite bg-onyx px-4 text-sm text-porcelain outline-none transition focus:border-gold-light";
const labelClass =
  "mb-2 block text-[0.65rem] uppercase tracking-luxury text-gold-light";

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-graphite" />
      <span className="text-[0.6rem] uppercase tracking-luxury text-mist">
        {label}
      </span>
      <span className="h-px flex-1 bg-graphite" />
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The email step for login is split in two so the card matches a
  // "welcome back" flow: address first, password only once it is needed.
  const [emailStep, setEmailStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";
  const next = params.get("next") ?? undefined;

  async function submitCredentials(payload: {
    name?: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    setError(null);
    setIsSubmitting(true);

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
      router.replace(safeNext(next));
      router.refresh();
    } catch {
      setError("Could not reach the maison. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await submitCredentials({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      phone: String(form.get("phone") ?? "").trim() || undefined
    });
  }

  function handleContinueWithEmail(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setEmailStep("password");
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCredentials({ email: email.trim(), password });
  }

  if (isRegister) {
    return (
      <div className="grid gap-5">
        <GoogleButton next={next} />
        <PhoneAuth mode={mode} next={next} />
        <Divider label="Sign up with email" />

        <form className="grid gap-5" onSubmit={handleRegisterSubmit}>
          <div>
            <label className={labelClass} htmlFor="name">
              Full name
            </label>
            <input autoComplete="name" className={fieldClass} id="name" name="name" required type="text" />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">
              Email address
            </label>
            <input autoComplete="email" className={fieldClass} id="email" name="email" required type="email" />
          </div>

          <div>
            <label className={labelClass} htmlFor="phone">
              Mobile number <span className="text-mist">(optional)</span>
            </label>
            <input autoComplete="tel" className={fieldClass} id="phone" name="phone" type="tel" />
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              autoComplete="new-password"
              className={fieldClass}
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
            <p className="mt-2 text-xs text-mist">At least 8 characters.</p>
          </div>

          {error ? (
            <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            Create account
          </button>
        </form>

        <p className="text-sm text-porcelain/70">
          Already a client?{" "}
          <Link className="text-gold-light underline-offset-4 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <GoogleButton next={next} />

      <Divider label="Or use mobile / email" />

      <div className="rounded-lg border border-graphite bg-onyx/60 p-5 sm:p-6">
        <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-luxury text-porcelain/70">
          Mobile or Email Login
        </p>

        <PhoneAuth mode={mode} next={next} />

        <div className="my-5">
          <Divider label="Or use email instead" />
        </div>

        {emailStep === "email" ? (
          <form className="grid gap-4" onSubmit={handleContinueWithEmail}>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
              />
              <input
                aria-label="Email address"
                autoComplete="email"
                className={`${fieldClass} pl-11`}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                type="email"
                value={email}
              />
            </div>

            {error ? (
              <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-graphite bg-onyx px-6 py-3 text-sm font-semibold text-porcelain transition hover:border-gold-light disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
            >
              Continue &rarr;
            </button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleLoginSubmit}>
            <div className="flex items-center justify-between rounded-md border border-graphite bg-onyx px-4 py-3 text-sm text-porcelain/80">
              <span className="truncate">{email}</span>
              <button
                className="ml-3 shrink-0 text-xs text-gold-light underline-offset-4 hover:underline"
                onClick={() => {
                  setEmailStep("email");
                  setError(null);
                }}
                type="button"
              >
                Change
              </button>
            </div>

            <div>
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                autoFocus
                className={fieldClass}
                id="password"
                name="password"
                onChange={e => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {error ? (
              <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-porcelain/70">
        New to AL-KAIF?{" "}
        <Link className="font-semibold text-gold-light underline-offset-4 hover:underline" href="/signup">
          Create an account &rarr;
        </Link>
      </p>

      <p className="text-center text-xs leading-5 text-mist">
        By continuing, you agree to our{" "}
        <Link className="underline-offset-4 hover:underline hover:text-gold-light" href="/privacy-policy">
          Privacy Policy
        </Link>{" "}
        &amp;{" "}
        <Link className="underline-offset-4 hover:underline hover:text-gold-light" href="/terms-and-conditions">
          Terms &amp; Conditions
        </Link>
      </p>
    </div>
  );
}
