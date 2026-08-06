"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";

type SignupForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialForm: SignupForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: ""
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof SignupForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "Unable to create your account.");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false
      });

      if (loginResult?.error) {
        router.push("/login?registered=true");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-24 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Account</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">Create Account</h1>

        <form
          className="mt-10 grid gap-5 border border-white/10 bg-onyx p-6"
          onSubmit={handleSubmit}
        >
          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="name"
            required
          />

          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Mobile number (optional)"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            autoComplete="tel"
          />

          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Password (minimum 8 characters)"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <input
            className="min-h-12 border border-white/10 bg-obsidian px-4 text-porcelain outline-none focus:border-gold-light"
            placeholder="Confirm password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            autoComplete="new-password"
            minLength={8}
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
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <Link className="mt-6 text-sm text-porcelain/70 hover:text-gold-light" href="/login">
          Already have an account?
        </Link>
      </main>
    </>
  );
}