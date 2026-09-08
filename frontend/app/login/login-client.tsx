"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import {
  getSupabaseBrowserClient,
  isGoogleSignInConfigured,
  isPhoneSignInEnabled
} from "@/lib/supabase-browser";
import styles from "./login-page.module.css";

const RESEND_SECONDS = 30;
const isValidMobile = (digits: string) => /^[6-9]\d{9}$/.test(digits);

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
    // Prefer returning to wherever the shopper actually came from; only fall
    // back to the homepage when there is no in-site history to go back to.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  // Google
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Mobile OTP
  const [phoneAvailable, setPhoneAvailable] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"number" | "code">("number");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);

  // Email + password
  const [emailStep, setEmailStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void isPhoneSignInEnabled().then(on => {
      if (alive) setPhoneAvailable(on);
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

  const e164 = `+91${mobile}`;

  async function handleSendOtp(event?: FormEvent) {
    event?.preventDefault();
    setPhoneError(null);

    if (!phoneAvailable) {
      setPhoneError("Mobile sign-in isn't connected yet.");
      return;
    }
    if (!isValidMobile(mobile)) {
      setPhoneError("Please enter a ten-digit Indian mobile number.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setPhoneError("Mobile sign-in is not available right now.");
      return;
    }

    setPhoneBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { shouldCreateUser: false }
    });
    setPhoneBusy(false);

    if (error) {
      setPhoneError(error.message);
      return;
    }

    setPhoneStep("code");
    setSecondsLeft(RESEND_SECONDS);
    window.setTimeout(() => codeInput.current?.focus(), 50);
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setPhoneError(null);

    if (code.length !== 6) {
      setPhoneError("Please enter the six-digit code.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setPhoneError("Mobile sign-in is not available right now.");
      return;
    }

    setPhoneBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code,
      type: "sms"
    });
    const accessToken = data?.session?.access_token;

    if (error || !accessToken) {
      setPhoneBusy(false);
      setPhoneError(error?.message ?? "That code did not match. Please retry.");
      return;
    }

    try {
      const res = await fetch("/api/session/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken })
      });
      const body = (await res.json()) as { error?: string };

      if (!res.ok) {
        setPhoneBusy(false);
        setPhoneError(body.error ?? "Could not complete sign-in.");
        return;
      }

      await supabase.auth.signOut();
      await refresh();
      router.replace(next ?? "/orders");
      router.refresh();
    } catch {
      setPhoneBusy(false);
      setPhoneError("Could not reach the maison. Please try again.");
    }
  }

  function handleContinueWithEmail(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    setEmailError(null);
    setEmailStep("password");
  }

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setEmailError(null);
    setEmailBusy(true);

    try {
      const res = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setEmailError(data.error ?? "Something went wrong. Please try again.");
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

          <button className={styles.btnGoogle} disabled={googleBusy} onClick={handleGoogleLogin} type="button">
            {googleBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleGlyph />}
            Continue with Google
          </button>
          {googleError ? <p className={styles.errorText} role="alert">{googleError}</p> : null}

          <div className={styles.dividerMain}>
            <div className={styles.line} />
            <span>OR USE MOBILE / EMAIL</span>
            <div className={styles.line} />
          </div>

          <div className={styles.mergedPanel}>
            <div className={styles.mergedLabel}>MOBILE OR EMAIL LOGIN</div>

            {phoneStep === "number" ? (
              <form onSubmit={handleSendOtp}>
                <div className={styles.phoneRow}>
                  <div className={styles.country}>🇮🇳 +91 &#9662;</div>
                  <input
                    aria-label="Mobile number"
                    className={styles.phoneInput}
                    inputMode="numeric"
                    onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter mobile number"
                    type="tel"
                    value={mobile}
                  />
                </div>
                <button className={styles.otpBtn} disabled={phoneBusy} type="submit">
                  {phoneBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP &rarr;</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <input
                  aria-label={`Verification code sent to +91 ${mobile}`}
                  className={styles.codeInput}
                  inputMode="numeric"
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  ref={codeInput}
                  value={code}
                />
                <div>
                  <button
                    className={styles.changeLink}
                    onClick={() => {
                      setPhoneStep("number");
                      setCode("");
                      setPhoneError(null);
                    }}
                    type="button"
                  >
                    Change number
                  </button>
                </div>
                <button className={styles.signinBtn} disabled={phoneBusy} type="submit">
                  {phoneBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify &amp; sign in"}
                </button>
                <button
                  className={styles.resendLink}
                  disabled={phoneBusy || secondsLeft > 0}
                  onClick={() => void handleSendOtp()}
                  type="button"
                >
                  {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Didn't get it? Send again"}
                </button>
              </form>
            )}

            {phoneError ? <p className={styles.errorText} role="alert">{phoneError}</p> : null}

            <div className={styles.inlineDivider}>
              <div className={styles.dot} />
              <span>OR USE EMAIL INSTEAD</span>
              <div className={styles.dot} />
            </div>

            {emailStep === "email" ? (
              <form onSubmit={handleContinueWithEmail}>
                <input
                  className={styles.emailInput}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="✉ Enter your email address"
                  type="email"
                  value={email}
                />
                <button className={styles.continueBtn} type="submit">
                  Continue &rarr;
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit}>
                <div className={styles.emailChip}>
                  <span>{email}</span>
                  <button
                    onClick={() => {
                      setEmailStep("email");
                      setEmailError(null);
                    }}
                    type="button"
                  >
                    Change
                  </button>
                </div>
                <input
                  autoFocus
                  className={styles.passwordInput}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ marginTop: 10 }}
                  type="password"
                  value={password}
                />
                <button className={styles.signinBtn} disabled={emailBusy} type="submit">
                  {emailBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </button>
              </form>
            )}

            {emailError ? <p className={styles.errorText} role="alert">{emailError}</p> : null}
          </div>

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
