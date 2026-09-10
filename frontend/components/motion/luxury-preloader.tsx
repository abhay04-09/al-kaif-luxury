"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const LOGO_SRC = "/brand/al-kaif-brand-logo.png";
const SESSION_KEY = "al-kaif:splash-seen";
const CIRC = 163.36; // 2 * PI * 26

export function LuxuryPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const dismiss = useCallback(() => {
    setIsDone(true);
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setTimeout(() => {
      setIsVisible(false);
    }, 900);
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      setIsVisible(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      dismiss();
      return;
    }

    let currentVal = 0;
    const interval = setInterval(() => {
      currentVal += Math.random() * 8 + 3;
      if (currentVal >= 100) {
        currentVal = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          dismiss();
        }, 400);
      } else {
        setProgress(currentVal);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [dismiss]);

  useEffect(() => {
    if (!isVisible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const strokeDashoffset = CIRC - (CIRC * progress) / 100;

  return (
    <>
      <style jsx global>{`
        :root {
          --ink: #0c0a09;
          --ink-2: #1a1512;
          --ember: #f01905;
          --ember-deep: #7a0f04;
          --gold: #c9a24b;
          --gold-light: #e9cf94;
          --ivory: #f3ece0;
        }

        #ak-preloader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: radial-gradient(120% 90% at 50% 38%, var(--ink-2) 0%, var(--ink) 62%, #060504 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1), transform 0.85s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #ak-preloader::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          pointer-events: none;
        }

        .ak-frame {
          position: absolute;
          inset: 22px;
          border: 1px solid rgba(201, 162, 75, 0.22);
          opacity: 0;
          animation: ak-frame-in 1s ease-out forwards;
          animation-delay: 0.1s;
          pointer-events: none;
        }
        @keyframes ak-frame-in { to { opacity: 1; } }

        #ak-preloader.ak-done {
          opacity: 0;
          transform: scale(1.035);
          pointer-events: none;
        }
        #ak-preloader.ak-done .ak-frame {
          inset: 8px;
          opacity: 0;
          transition: inset 0.85s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
        }

        .ak-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          padding: 0 24px;
        }

        .ak-glow {
          position: absolute;
          top: 34%;
          left: 50%;
          width: min(70vw, 380px);
          height: min(70vw, 380px);
          transform: translate(-50%, -50%) scale(0.6);
          background: radial-gradient(circle, rgba(240, 25, 5, 0.32) 0%, rgba(122, 15, 4, 0.12) 45%, rgba(240, 25, 5, 0) 70%);
          filter: blur(4px);
          opacity: 0;
          animation: ak-ember 2s cubic-bezier(0.3, 0.6, 0.3, 1) forwards;
        }
        @keyframes ak-ember {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.32; transform: translate(-50%, -50%) scale(1.12); }
        }

        .ak-mark {
          position: relative;
          width: clamp(170px, 28vw, 270px);
          clip-path: inset(0 100% 0 0);
          animation: ak-wipe 1.05s cubic-bezier(0.65, 0, 0.2, 1) forwards;
          animation-delay: 0.35s;
        }
        .ak-mark img {
          display: block;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 14px 30px rgba(240, 25, 5, 0.22));
        }
        @keyframes ak-wipe { to { clip-path: inset(0 0 0 0); } }

        .ak-mark::after {
          content: "";
          position: absolute;
          inset: -8% -25%;
          background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, 0.5) 50%, transparent 58%);
          mix-blend-mode: screen;
          transform: translateX(-130%);
          animation: ak-gleam 1.1s ease-in forwards;
          animation-delay: 1.45s;
        }
        @keyframes ak-gleam { to { transform: translateX(130%); } }

        .ak-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: ak-fadein 0.6s ease forwards;
          animation-delay: 1.5s;
        }
        .ak-divider .rule { width: 34px; height: 1px; background: linear-gradient(90deg, transparent, rgba(201, 162, 75, 0.55)); }
        .ak-divider .rule.right { background: linear-gradient(90deg, rgba(201, 162, 75, 0.55), transparent); }
        .ak-gem {
          width: 7px; height: 7px;
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          transform: rotate(45deg);
          box-shadow: 0 0 8px rgba(201, 162, 75, 0.5);
        }

        @keyframes ak-fadein { to { opacity: 1; } }

        .ak-ring-wrap {
          position: relative;
          width: 58px; height: 58px;
          opacity: 0;
          animation: ak-fadein 0.6s ease forwards;
          animation-delay: 1.75s;
        }
        .ak-ring-wrap svg { transform: rotate(-90deg); }
        .ak-ring-track { fill: none; stroke: rgba(245, 239, 230, 0.14); stroke-width: 1.4; }
        .ak-ring-fill {
          fill: none; stroke: url(#ak-ring-gradient); stroke-width: 1.4; stroke-linecap: round;
          stroke-dasharray: 163.36; stroke-dashoffset: 163.36;
          transition: stroke-dashoffset 0.18s linear;
        }
        .ak-ring-percent {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 12px; letter-spacing: 0.02em; color: var(--ivory); font-variant-numeric: tabular-nums;
        }

        .ak-caption {
          font-style: italic;
          font-size: 13px;
          letter-spacing: 0.03em;
          color: rgba(243, 236, 224, 0.5);
          opacity: 0;
          animation: ak-fadein 0.6s ease forwards;
          animation-delay: 1.9s;
        }

        @media (max-width: 420px) {
          .ak-frame { inset: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ak-mark { clip-path: inset(0 0 0 0); animation: none; opacity: 1; }
          .ak-mark::after { display: none; }
          .ak-glow, .ak-frame, .ak-divider, .ak-ring-wrap, .ak-caption { animation: none !important; opacity: 1 !important; }
          #ak-preloader { transition: opacity 0.35s ease; }
        }
      `}</style>

      <div id="ak-preloader" className={isDone ? "ak-done" : ""}>
        <div className="ak-frame" />
        <div className="ak-stage">
          <div className="ak-glow" />

          <div className="ak-mark">
            <Image
              alt="AL-KAIF Luxury"
              height={180}
              priority
              src={LOGO_SRC}
              width={270}
            />
          </div>

          <div className="ak-divider">
            <span className="rule" />
            <span className="ak-gem" />
            <span className="rule right" />
          </div>

          <div className="ak-ring-wrap">
            <svg height="58" viewBox="0 0 58 58" width="58">
              <defs>
                <linearGradient id="ak-ring-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#e9cf94" />
                  <stop offset="60%" stopColor="#c9a24b" />
                  <stop offset="100%" stopColor="#f01905" />
                </linearGradient>
              </defs>
              <circle className="ak-ring-track" cx="29" cy="29" r="26" />
              <circle
                className="ak-ring-fill"
                cx="29"
                cy="29"
                r="26"
                style={{ strokeDashoffset }}
              />
            </svg>
            <div className="ak-ring-percent">
              <span>{Math.floor(progress)}</span>%
            </div>
          </div>

          <div className="ak-caption">Haute Joaillerie &amp; Curated Timepieces</div>
        </div>
      </div>
    </>
  );
}

