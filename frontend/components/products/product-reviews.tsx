"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, BadgeCheck, Pin } from "lucide-react";
import { Stars } from "./stars";

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  pinned: boolean;
  verifiedPurchase: boolean;
  createdAt: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
  breakdown: { stars: number; count: number }[];
};

/**
 * What clients have said about a piece, and the form to add to it.
 *
 * The list is rendered on the server and handed in, so the reviews are in the
 * page for a search engine and for anyone whose JavaScript has not arrived.
 * Only the writing of one needs the browser.
 */
export function ProductReviews({
  productId,
  productSlug,
  reviews,
  summary,
  signedIn,
}: {
  productId: string;
  productSlug: string;
  reviews: Review[];
  summary: ReviewSummary;
  signedIn: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Please choose a rating, from one to five stars.");
      return;
    }

    setState("saving");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, body })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save your review");
      setState("done");
      // The list is rendered on the server, so it is re-read rather than
      // patched here — what appears is then exactly what everyone else sees.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your review");
      setState("idle");
    }
  }

  return (
    <section className="mt-20 border-t border-white/10 pt-10">
      <h2 className="font-serif text-2xl text-porcelain sm:text-3xl">
        Client Reviews
      </h2>

      {summary.count > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-serif text-4xl text-porcelain">{summary.average}</span>
          <span>
            <Stars rating={summary.average} size="lg" />
            <span className="mt-1 block text-xs text-mist">
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </span>
          </span>
        </div>
      ) : (
        <p className="mt-4 text-sm text-porcelain/70">
          No reviews yet. If you have this piece, yours would be the first.
        </p>
      )}

      {/* Writing one */}
      {signedIn ? (
        <form className="mt-8 border border-white/10 bg-onyx/40 p-5" onSubmit={submit}>
          <p className="text-[0.65rem] uppercase tracking-luxury text-gold-light">
            Write a review
          </p>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                className="p-1"
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                type="button"
              >
                <Star
                  className={`h-6 w-6 transition ${
                    n <= (hover || rating)
                      ? "fill-gold-light text-gold-light"
                      : "text-porcelain/30"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            {rating > 0 ? (
              <span className="ml-2 text-xs text-mist">{rating} of 5</span>
            ) : null}
          </div>

          <textarea
            className="mt-4 min-h-24 w-full resize-y border border-white/10 bg-transparent px-3 py-2.5 text-sm text-porcelain placeholder:text-mist focus:border-gold-light focus:outline-none"
            maxLength={1500}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Anything you would like to add is welcome, but not required."
            value={body}
          />

          {error ? (
            <p className="mt-3 text-xs text-[#FF6B81]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="mt-4 border border-gold px-6 py-2.5 text-[0.7rem] uppercase tracking-luxury text-gold-light transition hover:bg-gold hover:text-black disabled:opacity-50"
            disabled={state !== "idle"}
            type="submit"
          >
            {state === "saving" ? "Posting…" : "Post review"}
          </button>
          <p className="mt-2 text-[0.68rem] text-mist">
            Posted under your account name. You can change or remove it later.
          </p>
        </form>
      ) : (
        <p className="mt-8 border border-white/10 bg-onyx/40 px-5 py-4 text-sm text-porcelain/75">
          <Link
            className="text-gold-light underline-offset-4 hover:underline"
            href={`/login?next=/products/${productSlug}`}
          >
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      )}

      {/* The reviews themselves */}
      {reviews.length > 0 ? (
        <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {reviews.map((review) => (
            <li className="py-5" key={review.id}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars rating={review.rating} />
                <span className="text-sm text-porcelain">{review.authorName}</span>
                {review.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-wider text-gold-light">
                    <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                    Verified buyer
                  </span>
                ) : null}
                {review.pinned ? (
                  <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-wider text-porcelain/50">
                    <Pin aria-hidden="true" className="h-3 w-3" />
                    Highlighted
                  </span>
                ) : null}
              </div>

              <time
                className="mt-1 block text-[0.68rem] text-mist"
                dateTime={review.createdAt}
              >
                {formatWhen(review.createdAt)}
              </time>

              {review.body ? (
                <p className="mt-2.5 whitespace-pre-line text-sm leading-6 text-porcelain/80">
                  {review.body}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** "14 October 2026 at 4:56 pm" — the date and the time, as the shop asked. */
function formatWhen(iso: string): string {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  }).format(when);
}
