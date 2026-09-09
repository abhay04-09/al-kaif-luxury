"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

export type ResolvedLocation = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  displayName: string;
};

type Phase = "idle" | "locating" | "looking-up" | "done" | "error";

/**
 * Fills in the address from where the client is standing.
 *
 * A convenience and never a requirement: every field it touches stays typed by
 * hand, and a client who refuses permission loses nothing.
 *
 * What it cannot do is worth stating, because pretending otherwise costs a
 * delivery. A satellite fix locates a street, not a doorway — no flat number,
 * no building name, no floor. So it fills what it knows, says what it has not
 * filled, and hands the client back the cursor.
 */
export function UseMyLocation({
  onResolved,
  className = ""
}: {
  onResolved: (location: ResolvedLocation) => void;
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Geolocation needs a secure context; the browser simply refuses otherwise.
    const secure =
      typeof window !== "undefined" &&
      (window.isSecureContext || window.location.hostname === "localhost");
    if (!secure || !("geolocation" in navigator)) {
      setSupported(false);
      return;
    }

    // A client who said no once should be told how to change their mind, not
    // handed a button that does nothing.
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((status) => {
        setBlocked(status.state === "denied");
        status.onchange = () => setBlocked(status.state === "denied");
      })
      .catch(() => {
        // Safari has not always had this. Not knowing is fine.
      });
  }, []);

  const position = () =>
    new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      })
    );

  async function locate() {
    setPhase("locating");
    setMessage(null);

    let fix: GeolocationPosition;
    try {
      fix = await position();
    } catch (err) {
      const code = (err as GeolocationPositionError)?.code;
      setPhase("error");
      if (code === 1) {
        setBlocked(true);
        setMessage(
          "Location permission was declined. You can still type your address below."
        );
      } else if (code === 3) {
        setMessage(
          "Finding you took too long. Please try again, or type your address below."
        );
      } else {
        setMessage(
          "Your location is not available right now. Please type your address below."
        );
      }
      return;
    }

    setPhase("looking-up");
    try {
      const { latitude, longitude } = fix.coords;
      const res = await fetch(
        `/api/geocode/reverse?lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();

      if (!res.ok) {
        setPhase("error");
        setMessage(data?.error ?? "We could not turn that into an address.");
        return;
      }

      const resolved = data as ResolvedLocation;
      if (!resolved.street && !resolved.city) {
        setPhase("error");
        setMessage(
          "We found you, but not a street address. Please type your address below."
        );
        return;
      }

      onResolved(resolved);
      setPhase("done");
      setMessage(
        resolved.pincode
          ? "We filled in your area — please add your flat and building number."
          : "We filled in your area. Please add your flat and building, and your PIN code."
      );
    } catch {
      setPhase("error");
      setMessage("We could not turn that into an address. Please type it below.");
    }
  }

  if (!supported) return null;

  const busy = phase === "locating" || phase === "looking-up";

  return (
    <div className={className}>
      <button
        className="inline-flex min-h-11 items-center gap-2 border border-graphite px-4 py-2 text-[0.62rem] uppercase tracking-luxury text-porcelain/80 transition hover:border-gold-light hover:text-gold-light disabled:cursor-not-allowed disabled:opacity-50"
        disabled={busy || blocked}
        onClick={locate}
        type="button"
      >
        {busy ? (
          <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MapPin aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.6} />
        )}
        {phase === "locating"
          ? "Finding you…"
          : phase === "looking-up"
            ? "Looking up your address…"
            : "Use my current location"}
      </button>

      {blocked ? (
        <p className="mt-2 text-[0.68rem] leading-5 text-mist" role="status">
          Location is blocked for this site. Allow it from the padlock in your
          browser's address bar, or simply type your address.
        </p>
      ) : message ? (
        <p
          className={`mt-2 text-[0.68rem] leading-5 ${
            phase === "error" ? "text-red-200" : "text-gold-light"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
