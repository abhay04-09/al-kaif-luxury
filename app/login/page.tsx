"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false
      });

      if (result?.error) {
        setMessage("Invalid email address or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    setIsSubmitting(true);

    await signIn("google", { callbackUrl: "/" });
  }

  async function handleOtpRequest() {
    setOtpMessage("");
    setIsOtpSubmitting(true);

    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await response.json();

      if (!response.ok) {
        setOtpMessage(data.message ?? "Unable to send OTP.");
        return;
      }

      setOtpRequested(true);
      setOtpMessage("OTP sent. Check the development server terminal.");
    } catch {
      setOtpMessage("Unable to send OTP. Please try again.");
    } finally {
      setIsOtpSubmitting(false);
    }
  }

  async function handleOtpLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpMessage("");
    setIsOtpSubmitting(true);

    try {
      const result = await signIn("otp", {
        phone: phone.trim(),
        code: otp.trim(),
        redirect: false
      });

      if (result?.error) {
        setOtpMessage("OTP is invalid, expired, or has already been used.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setOtpMessage("Unable to verify OTP. Please try again.");
    } finally {
      setIsOtpSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-24 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Account</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Login</h1>

        <form
          className="mt-10 grid gap-5 border border-white/10 bg-onyx p-6"
          onSubmit={handleSubmit}
        >
          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {message ? (
            <p aria-live="polite" className="text-sm text-red-300">
              {message}
            </p>
          ) : null}

          <button
            className="min-h-12 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <button
            className="min-h-12 border border-white/10 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:border-gold-light disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            type="button"
          >
            Continue with Google
          </button>

          <button
            className="min-h-12 border border-white/10 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:border-gold-light"
            onClick={() => {
              setIsOtpOpen((current) => !current);
              setOtpMessage("");
            }}
            type="button"
          >
            {isOtpOpen ? "Close Mobile OTP" : "Login with Mobile OTP"}
          </button>
        </form>

        {isOtpOpen ? (
          <form
            className="mt-5 grid gap-5 border border-white/10 bg-onyx p-6"
            onSubmit={handleOtpLogin}
          >
            <input
              className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
              placeholder="Mobile number, e.g. +919876543210"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              required
            />

            {otpRequested ? (
              <input
                className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
                placeholder="6-digit OTP"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                required
              />
            ) : null}

            {otpMessage ? (
              <p aria-live="polite" className="text-sm text-porcelain/70">
                {otpMessage}
              </p>
            ) : null}

            {otpRequested ? (
              <button
                className="min-h-12 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isOtpSubmitting}
                type="submit"
              >
                {isOtpSubmitting ? "Verifying OTP..." : "Verify & Login"}
              </button>
            ) : (
              <button
                className="min-h-12 bg-gold px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isOtpSubmitting}
                onClick={handleOtpRequest}
                type="button"
              >
                {isOtpSubmitting ? "Sending OTP..." : "Send OTP"}
              </button>
            )}
          </form>
        ) : null}

        <Link className="mt-6 text-sm text-porcelain/70 hover:text-gold-light" href="/signup">
          Create a new account
        </Link>
      </main>
    </>
  );
}
