"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

const REASONS = [
  "I changed my mind",
  "Ordered by mistake",
  "Found it elsewhere",
  "Delivery is taking too long",
  "Other"
];

/**
 * Lets a client cancel their own order, while it is still theirs to cancel.
 *
 * Two deliberate frictions: nothing happens on the first press, and the reason
 * is asked for. A cancellation is not undoable from this side of the shop, and
 * the reason is the only thing that ever tells the maison *why* pieces come
 * back — which is worth more than a tidier button.
 */
export function CancelOrder({
  orderNumber,
  paid
}: {
  orderNumber: string;
  paid: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderNumber)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: detail.trim() ? `${reason} — ${detail.trim()}` : reason
          })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "We could not cancel this order just now.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("We could not reach the maison. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        className="inline-flex min-h-12 items-center gap-2 border border-graphite px-5 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain/70 transition hover:border-red-400/50 hover:text-red-200"
        onClick={() => setOpen(true)}
        type="button"
      >
        <XCircle aria-hidden="true" className="h-3.5 w-3.5" />
        Cancel this order
      </button>
    );
  }

  return (
    <div className="w-full border border-red-400/30 bg-red-400/5 p-6">
      <h3 className="font-serif text-xl text-porcelain">Cancel this order?</h3>
      <p className="mt-2 text-sm leading-6 text-porcelain/70">
        The pieces go back to the collection and nothing will be sent.
        {paid
          ? " Your payment will be returned to the card or account it came from; this usually takes five to seven working days."
          : " Nothing has been charged."}
      </p>

      <label className="mt-5 block text-[0.6rem] uppercase tracking-luxury text-mist">
        May we ask why?
      </label>
      <select
        className="mt-2 w-full border border-graphite bg-obsidian px-3 py-2.5 text-sm text-porcelain outline-none focus:border-gold"
        onChange={(event) => setReason(event.target.value)}
        value={reason}
      >
        {REASONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <input
        className="mt-3 w-full border border-graphite bg-obsidian px-3 py-2.5 text-sm text-porcelain outline-none placeholder:text-mist/60 focus:border-gold"
        onChange={(event) => setDetail(event.target.value)}
        placeholder="Anything else you would like us to know (optional)"
        value={detail}
      />

      {error ? (
        <p className="mt-4 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-12 items-center gap-2 border border-red-400/50 bg-red-400/10 px-5 py-3 text-[0.7rem] uppercase tracking-luxury text-red-100 transition hover:bg-red-400/20 disabled:opacity-50"
          disabled={busy}
          onClick={submit}
          type="button"
        >
          {busy ? (
            <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          Yes, cancel it
        </button>
        <button
          className="inline-flex min-h-12 items-center px-5 py-3 text-[0.7rem] uppercase tracking-luxury text-porcelain/70 transition hover:text-gold-light disabled:opacity-50"
          disabled={busy}
          onClick={() => setOpen(false)}
          type="button"
        >
          Keep my order
        </button>
      </div>
    </div>
  );
}
