/**
 * Asks the maison's own Worker for a photograph at the size it will be shown.
 *
 * This replaces Vercel's image optimiser, which answers 402 Payment Required
 * on this account: every size it had not already cached came back broken.
 * The smaller copies are made once and kept in R2 beside the original, so
 * serving them costs nothing and cannot run out.
 *
 * Anything that is not ours — Unsplash, Cloudinary — is handed back untouched
 * rather than sent to a Worker that has never heard of it.
 */
const OURS = "/api/images/";

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes(OURS)) return src;

  // The Worker rounds up to the nearest copy it keeps, and falls back to the
  // original when asked for more than it has — so any width is safe to send.
  const joiner = src.includes("?") ? "&" : "?";
  return `${src}${joiner}w=${width}`;
}
