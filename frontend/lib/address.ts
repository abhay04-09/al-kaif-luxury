/**
 * Renders a shipping address, whichever shape it arrived in.
 *
 * Orders placed before delivery was priced by destination kept the address as
 * one block of text the client typed; newer ones keep it in parts so a courier
 * has a pin code it can read. Both must display.
 */
export function formatAddress(address: unknown): string {
  if (!address) return "";
  if (typeof address === "string") return address;

  const parts = address as Record<string, unknown>;
  return [
    parts.addressLine1,
    parts.addressLine2,
    parts.city,
    parts.state,
    parts.pincode,
    parts.country
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(", ");
}
