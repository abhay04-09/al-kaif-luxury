"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import {
  getSupabaseBrowserClient,
  isGoogleSignInConfigured
} from "@/lib/supabase-browser";
import styles from "./login-page.module.css";

function GoogleGlyph() {
  return (
    <svg className={styles.gIcon} viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 6.1 29.6 4 24 4c-7.8 0-14.5 4.4-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.4 39.6 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-0.8 2.3-2.3 4.3-4.2 5.7l6.6 5.4C40.9 35.9 44 30.4 44 24c0-1.4-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const next = params.get("next") ?? undefined;

  function handleClose() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  // Google Sign-In
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Email + Password Sign-In
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setGoogleError(null);

    if (!isGoogleSignInConfigured()) {
      setGoogleError("Google sign-in isn't connected yet.");
      return;
    }

    setGoogleBusy(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setGoogleError("Google sign-in is not available right now.");
      setGoogleBusy(false);
      return;
    }

    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() }
    });

    if (error) {
      setGoogleError(error.message);
      setGoogleBusy(false);
    }
  }

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setEmailError(null);

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!password) {
      setEmailError("Please enter your password.");
      return;
    }

    setEmailBusy(true);

    try {
      const res = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setEmailError(data.error ?? "Invalid email or password. Please try again.");
        setEmailBusy(false);
        return;
      }

      await refresh();
      router.replace(next ?? "/orders");
      router.refresh();
    } catch {
      setEmailError("Could not reach the maison. Please try again.");
      setEmailBusy(false);
    }
  }

  return (
    <div className={styles.loginWrapper}>
      {/* LEFT PANEL */}
      <div className={styles.loginLeft}>
        <div className={`${styles.silkFold} ${styles.fold1}`} />
        <div className={`${styles.silkFold} ${styles.fold2}`} />
        <div className={`${styles.silkFold} ${styles.fold3}`} />

        <svg className={styles.flowersWrap} viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#8a9a6b" strokeWidth="1.2" opacity="0.55" fill="none">
            <path d="M40,30 C60,60 55,100 70,140" />
            <path d="M55,25 C80,55 78,95 95,130" />
            <path d="M20,45 C45,70 40,105 55,150" />
          </g>
          <g fill="#fffdfa" stroke="#e6dcc8" strokeWidth="1">
            <circle cx="38" cy="28" r="6.5" /><circle cx="52" cy="20" r="5.5" /><circle cx="65" cy="34" r="6" />
            <circle cx="24" cy="42" r="5.5" /><circle cx="78" cy="50" r="5" /><circle cx="90" cy="30" r="5.5" />
            <circle cx="45" cy="55" r="5" /><circle cx="60" cy="62" r="4.5" /><circle cx="12" cy="60" r="4.5" />
            <circle cx="100" cy="55" r="4.5" /><circle cx="30" cy="75" r="4" /><circle cx="70" cy="80" r="4" />
            <circle cx="15" cy="20" r="4.5" /><circle cx="85" cy="15" r="4" />
          </g>
          <g fill="#d8cf9e">
            <circle cx="38" cy="28" r="2.2" /><circle cx="52" cy="20" r="2" />
            <circle cx="65" cy="34" r="2.1" /><circle cx="90" cy="30" r="2" />
          </g>
        </svg>

        <svg className={styles.ribbonWrap} viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="satin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e8c583" />
              <stop offset="45%" stopColor="#c9a15c" />
              <stop offset="100%" stopColor="#a9803f" />
            </linearGradient>
          </defs>
          <path
            d="M10,210 C60,170 40,120 90,110 C140,100 130,150 180,140 C210,134 220,160 250,150"
            stroke="url(#satin)" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.9"
          />
          <path
            d="M10,210 C60,170 40,120 90,110 C140,100 130,150 180,140 C210,134 220,160 250,150"
            stroke="#fff3da" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"
          />
        </svg>

        <div className={styles.logoBlock}>
          <img src="/brand/al-kaif-brand-logo.png" alt="Al-Kaif" className={styles.logoImg} />
          <div className={styles.brandLine}>
            <div className={styles.bar} />
            <div className={styles.brandSub}>ARTIFICIAL&nbsp; JEWELLERY</div>
            <div className={styles.bar} />
          </div>
          <div className={styles.tagline}>Shine in Every Moment</div>
          <div className={styles.tagUnderline}>
            <div className={styles.bar2} />
            <div className={styles.heartSmall}>&#9825;</div>
            <div className={styles.bar2} />
          </div>
        </div>

        <div className={styles.jewelStage}>
          <div className={styles.velvetBox} />
          <div className={styles.necklaceWrap}>
            <img src="/login/necklace.jpg" alt="Necklace" />
          </div>
          <div className={styles.earringWrap}>
            <img src="/login/earrings.jpg" alt="Earrings" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.loginRight}>
        <button aria-label="Go back" className={styles.closeX} onClick={handleClose} type="button">
          &#10005;
        </button>

        <div className={styles.formCard}>
          <div className={styles.welcomeRow}>
            <h1>Welcome Back</h1>
            <span className={styles.heart}>&#9825;</span>
          </div>
          <p className={styles.sub}>Login to continue shopping with AL-KAIF</p>

          {/* GOOGLE SIGN-IN */}
          <button className={styles.btnGoogle} disabled={googleBusy} onClick={handleGoogleLogin} type="button">
            {googleBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleGlyph />}
            Continue with Google
          </button>
          {googleError ? <p className={styles.errorText} role="alert">{googleError}</p> : null}

          {/* DIVIDER */}
          <div className={styles.dividerMain}>
            <div className={styles.line} />
            <span>OR SIGN IN WITH EMAIL</span>
            <div className={styles.line} />
          </div>

          {/* EMAIL & PASSWORD MANUAL LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-amber-900/80 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                className={styles.emailInput}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                type="email"
                value={email}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-900/80 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                className={styles.passwordInput}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
                value={password}
                required
              />
            </div>

            <button className={styles.signinBtn} disabled={emailBusy} type="submit" style={{ marginTop: 16 }}>
              {emailBusy ? <Loader2 className="h-4 w-4 animate-spin text-white mx-auto" /> : "Sign In \u2192"}
            </button>

            {emailError ? <p className={styles.errorText} role="alert">{emailError}</p> : null}
          </form>

          <div className={styles.footer}>
            New to AL-KAIF? <Link href="/signup">Create an account &rarr;</Link>
          </div>
          <div className={styles.terms}>
            By continuing, you agree to our <Link href="/privacy-policy">Privacy Policy</Link> &amp;{" "}
            <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
