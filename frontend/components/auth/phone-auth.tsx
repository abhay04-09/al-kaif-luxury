"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Smartphone } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import {
  getSupabaseBrowserClient,
  isPhoneSignInEnabled
} from "@/lib/supabase-browser";

const fieldClass =
  "min-h-12 w-full border border-white/10 bg-obsidian px-4 text-porcelain outline-none transition focus:border-gold-light";
const labelClass =
  "mb-2 block text-[0.65rem] uppercase tracking-luxury text-gold-light";

const RESEND_SECONDS = 30;

/** Indian mobile numbers: ten digits, first one 6–9. */
const isValidMobile = (digits: string) => /^[6-9]\d{9}$/.test(digits);

export function PhoneAuth({
  mode,
  next
}: {
  mode: "login" | "register";
  next?: string;
}) {
  const router = useRouter();
  const { refresh } = useSession();

  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"number" | "code">("number");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    void isPhoneSignInEnabled().then(on => {
      if (alive) setAvailable(on);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  // Rendering an option that cannot work is worse than rendering nothing, so it
  // stays hidden until an SMS gateway is actually connected.
  if (!available) return null;

  const e164 = `+91${mobile}`;

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setError(null);

    if (!isValidMobile(mobile)) {
      setError("Please enter a ten-digit Indian mobile number.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Mobile sign-in is not available right now.");
      return;
    }

    setBusy(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({
      phone: e164,
      // On the sign-in form an unknown number is a mistake worth naming, rather
      // than an account quietly conjured out of a typo.
      options: { shouldCreateUser: mode === "register" }
    });
    setBusy(false);

    if (sendError) {
      setError(sendError.message);
      return;
    }

    setStep("code");
    setSecondsLeft(RESEND_SECONDS);
    window.setTimeout(() => codeInput.current?.focus(), 50);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError("Please enter the six-digit code.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Mobile sign-in is not available right now.");
      return;
    }

    setBusy(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code,
      type: "sms"
    });
    const accessToken = data?.session?.access_token;

    if (verifyError || !accessToken) {
      setBusy(false);
      setError(verifyError?.message ?? "That code did not match. Please retry.");
      return;
    }

    try {
      // Supabase only proves the number. The session this site runs on is still
      // issued by the maison's own API, so one users table stays authoritative.
      const res = await fetch("/api/session/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, name: name.trim() || undefined })
      });
      const body = (await res.json()) as { error?: string };

      if (!res.ok) {
        setBusy(false);
        setError(body.error ?? "Could not complete sign-in.");
        return;
      }

      await supabase.auth.signOut();
      await refresh();
      router.replace(next ?? "/orders");
      router.refresh();
    } catch {
      setBusy(false);
      setError("Could not reach the maison. Please try again.");
    }
  }

  if (!open) {
    return (
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-graphite bg-obsidian px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain transition hover:border-gold-light hover:text-gold-light"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Smartphone aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        Continue with mobile number
      </button>
    );
  }

  return (
    <div className="grid gap-5 border border-graphite bg-obsidian/60 p-5">
      {step === "number" ? (
        <form className="grid gap-5" onSubmit={sendCode}>
          {mode === "register" ? (
            <div>
              <label className={labelClass} htmlFor="otp-name">
                Full name
              </label>
              <input
                autoComplete="name"
                className={fieldClass}
                id="otp-name"
                onChange={e => setName(e.target.value)}
                type="text"
                value={name}
              />
            </div>
          ) : null}

          <div>
            <label className={labelClass} htmlFor="otp-mobile">
              Mobile number
            </label>
            <div className="flex">
              <span className="flex min-h-12 items-center border border-r-0 border-white/10 bg-abyss px-4 text-sm text-mist">
                +91
              </span>
              <input
                autoComplete="tel-national"
                className={`${fieldClass} tracking-[0.2em]`}
                id="otp-mobile"
                inputMode="numeric"
                onChange={e =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
                value={mobile}
              />
            </div>
            <p className="mt-2 text-xs text-mist">
              We will send a six-digit code by SMS.
            </p>
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
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : null}
            Send code
          </button>
        </form>
      ) : (
        <form className="grid gap-5" onSubmit={verify}>
          <div>
            <label className={labelClass} htmlFor="otp-code">
              Enter the code sent to +91 {mobile}
            </label>
            <input
              autoComplete="one-time-code"
              className={`${fieldClass} text-center text-2xl tracking-[0.6em]`}
              id="otp-code"
              inputMode="numeric"
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              ref={codeInput}
              value={code}
            />
            <button
              className="mt-3 text-xs text-gold-light underline-offset-4 hover:underline"
              onClick={() => {
                setStep("number");
                setCode("");
                setError(null);
              }}
              type="button"
            >
              Change number
            </button>
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
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : null}
            {mode === "register" ? "Verify and create account" : "Verify and sign in"}
          </button>

          <button
            className="text-xs text-mist transition hover:text-gold-light disabled:cursor-not-allowed"
            disabled={busy || secondsLeft > 0}
            onClick={() => void sendCode()}
            type="button"
          >
            {secondsLeft > 0
              ? `Resend code in ${secondsLeft}s`
              : "Didn't get it? Send again"}
          </button>
        </form>
      )}
    </div>
  );
}
