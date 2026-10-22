import { Star } from "lucide-react";

/**
 * A rating, drawn.
 *
 * Half stars are deliberately not drawn: an average of 4.3 is shown as the
 * number beside the stars, and four filled stars underneath it. A half star
 * invites a precision the count of reviews rarely supports.
 */
export function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const filled = Math.round(rating);
  const box = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      className="inline-flex items-center gap-0.5"
      role="img"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          aria-hidden="true"
          className={`${box} ${
            n <= filled ? "fill-gold-light text-gold-light" : "text-porcelain/25"
          }`}
          key={n}
          strokeWidth={1.6}
        />
      ))}
    </span>
  );
}
