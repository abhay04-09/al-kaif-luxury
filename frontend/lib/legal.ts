/**
 * The details every policy page quotes.
 *
 * Gathered in one file because a policy is only as good as its facts: a wrong
 * address or an out-of-date returns window is the sort of thing a customer
 * quotes back at you in a dispute. Correct it here and every page follows.
 *
 * The entries marked TO CONFIRM are the ones only the proprietor can settle.
 * They render visibly on the page so they cannot ship unnoticed.
 */

const PENDING = (what: string) => `[${what} — to be confirmed]`;

export const legal = {
  brand: "AL-KAIF",

  // TO CONFIRM: the name the business is registered under. Razorpay holds the
  // merchant account as EBAZAAR4U, which is very probably the legal entity
  // behind the AL-KAIF brand — but a policy must not guess at this.
  entity: PENDING("Registered business name"),

  // TO CONFIRM: printed on the GST certificate.
  gstin: PENDING("GSTIN"),

  address: {
    lines: [
      "Shop No. 08, 1st Floor, Darbar Hotel",
      "Char Rasta, above Jay Swadisht Hotel",
      "Near HP Petrol Pump, Phase 2, GIDC",
      "Vapi, Gujarat 396191",
      "India"
    ],
    city: "Vapi",
    state: "Gujarat"
  },

  email: "info@alkaif.in",
  phone: "+91 70960 22333",
  phoneHref: "+917096022333",
  instagram: "https://www.instagram.com/alkaif.jewellery?igsh=OG5jYnNxdGI0dGlm",
  instagramHandle: "@alkaif.jewellery",
  site: "https://www.alkaif.in",

  hours: "Monday to Saturday, 10:00 – 19:00 IST",

  /** Calendar days from delivery within which a return may be raised. */
  returnWindowDays: 7,
  /** Working days to dispatch an order once payment clears. */
  dispatchDays: "2–4",
  /** Working days in transit after dispatch. */
  deliveryDays: "3–7",
  /** Working days for a refund to reach the original payment method. */
  refundDays: "5–7",

  /** Courts named for any dispute. */
  jurisdiction: "Vapi, Gujarat",

  // TO CONFIRM: the DPDP Act 2023 requires a named person for privacy
  // complaints, reachable at a published address.
  grievanceOfficer: PENDING("Grievance Officer name"),

  lastUpdated: "23 August 2026"
} as const;

export const addressOneLine = legal.address.lines.join(", ");
