import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";

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
    <footer className="border-t border-graphite bg-obsidian px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link
              href="/"
              aria-label="AL-KAIF home"
              className="relative block h-24 w-44"
            >
              <Image
                src="/brand/al-kaif-logo.png"
                alt="AL-KAIF"
                fill
                sizes="176px"
                /*
                 * The PNG has an opaque near-black background baked in, which
                 * reads as a dark rectangle on the green ground. Screen blending
                 * drops the black to the page colour and keeps the gold artwork.
                 */
                className="object-contain object-left mix-blend-screen"
              />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-porcelain/65">
              AL-KAIF creates fine jewellery and perfumes for those who value
              rarity, restraint, and enduring craft.
            </p>
          </div>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
              Explore
            </h2>

            <ul className="mt-6 space-y-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-porcelain/70 transition hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
              Policies
            </h2>

            <ul className="mt-6 space-y-4">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-porcelain/70 transition hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
              Contact
            </h2>

            <div className="mt-6 space-y-4 text-sm text-porcelain/70">
              <a
                href="mailto:info@alkaif.in"
                className="flex items-center gap-3 transition hover:text-gold-light"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                info@alkaif.in
              </a>

              <a
                href="tel:+917096022333"
                className="flex items-center gap-3 transition hover:text-gold-light"
              >
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                +91 70960 22333
              </a>

              <p className="flex items-start gap-3 leading-snug">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  SHOP NO. 08, 1st FLOOR, DARBAR HOTEL, CHAR RASTA, above JAY SWADISHT HOTEL, near HP PERTOL PUMP, Phase 2, GIDC Vapi, Gujarat 396191
                </span>
              </p>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition hover:text-gold-light"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
                @alkaif.jewellery
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-graphite pt-8 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© 2019 AL-KAIF. All rights reserved.</p>

          <div className="flex flex-wrap gap-6">
            <Link href="/privacy-policy" className="transition hover:text-gold-light">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-gold-light">
              Terms & Conditions
            </Link>
            <Link href="/delivery-policy" className="transition hover:text-gold-light">
              Delivery Policy
            </Link>
            <Link href="/refund-policy" className="transition hover:text-gold-light">
              Return & Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
