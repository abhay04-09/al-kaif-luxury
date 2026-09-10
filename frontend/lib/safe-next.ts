/**
 * Where a client may be sent after signing in.
 *
 * Only a path inside this site. Without the check, /login?next=//evil.example
 * would be a genuine AL-KAIF sign-in page that lands the client somewhere else
 * once they have typed their password — which is the shape of a phishing link,
 * and all the more convincing for the domain being real.
 */
export function safeNext(value: string | null | undefined, fallback = "/orders"): string {
  if (!value) return fallback;
  // A protocol-relative "//host" and a "/\host" both leave the site.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
