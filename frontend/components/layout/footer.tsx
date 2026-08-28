import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { AlKaifMark } from "@/components/brand/al-kaif-mark";

const instagramUrl =
  "https://www.instagram.com/alkaif.jewellery?igsh=OG5jYnNxdGI0dGlm";

const footerLinks = [
  { label: "Collections", href: "/products" },
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
  { label: "Account", href: "/login" },
  { label: "Raise a Query", href: "/query" }
];

const policyLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Delivery Policy", href: "/delivery-policy" },
  { label: "Return & Refund Policy", href: "/refund-policy" }
];

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface px-5 py-16 sm:px-8 lg:px-10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            {/* Crisp, 100% Visible Brand Logo without washed-out blend modes */}
            <Link
              href="/"
              aria-label="AL-KAIF home"
              className="inline-block py-1"
            >
              <AlKaifMark className="h-12 sm:h-14 w-auto shrink-0 drop-shadow-sm" />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-brand-muted">
              AL-KAIF creates handcrafted fine jewellery for those who value
              rarity, restraint, and enduring craft.
            </p>
          </div>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-luxury text-brand-gold font-bold">
              Explore
            </h2>

            <ul className="mt-6 space-y-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text transition hover:text-brand-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-luxury text-brand-gold font-bold">
              Policies
            </h2>

            <ul className="mt-6 space-y-4">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text transition hover:text-brand-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-luxury text-brand-gold font-bold">
              Contact
            </h2>

            <div className="mt-6 space-y-4 text-sm text-brand-text">
              <a
                href="mailto:info@alkaif.in"
                className="flex items-center gap-3 transition hover:text-brand-gold"
              >
                <Mail className="h-4 w-4 text-brand-gold" strokeWidth={1.8} />
                info@alkaif.in
              </a>

              <a
                href="tel:+917096022333"
                className="flex items-center gap-3 transition hover:text-brand-gold"
              >
                <Phone className="h-4 w-4 shrink-0 text-brand-gold" strokeWidth={1.8} />
                +91 70960 22333
              </a>

              <p className="flex items-start gap-3 leading-snug text-brand-muted">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-gold" strokeWidth={1.8} />
                <span>
                  SHOP NO. 08, 1st FLOOR, DARBAR HOTEL, CHAR RASTA, above JAY SWADISHT HOTEL, near HP PERTOL PUMP, Phase 2, GIDC Vapi, Gujarat 396191
                </span>
              </p>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition hover:text-brand-gold"
              >
                <Instagram className="h-4 w-4 text-brand-gold" strokeWidth={1.8} />
                @alkaif.jewellery
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-brand-border pt-8 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2019 AL-KAIF. All rights reserved.</p>

          <div className="flex flex-wrap gap-6">
            <Link href="/privacy-policy" className="transition hover:text-brand-gold">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-brand-gold">
              Terms & Conditions
            </Link>
            <Link href="/delivery-policy" className="transition hover:text-brand-gold">
              Delivery Policy
            </Link>
            <Link href="/refund-policy" className="transition hover:text-brand-gold">
              Return & Refund Policy
            </Link>
            <Link href="/query" className="transition hover:text-brand-gold">
              Raise a Query
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
