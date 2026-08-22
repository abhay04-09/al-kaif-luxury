import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { legal } from "@/lib/legal";

export const metadata = {
  title: "Contact Us | AL-KAIF",
  description:
    "Reach AL-KAIF by email, telephone or at the atelier in Vapi, Gujarat."
};

const channels = [
  {
    icon: Mail,
    label: "Email",
    value: legal.email,
    href: `mailto:${legal.email}`,
    note: "We answer within one working day."
  },
  {
    icon: Phone,
    label: "Telephone",
    value: legal.phone,
    href: `tel:${legal.phoneHref}`,
    note: legal.hours
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: legal.instagramHandle,
    href: legal.instagram,
    note: "New arrivals and pieces in progress."
  }
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          The Maison
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-porcelain sm:text-5xl">
          Contact Us
        </h1>
        <p className="mt-5 text-sm leading-7 text-porcelain/70">
          Whether it is a question about a piece, an order already on its way, or
          something you would like made — we would rather hear from you than not.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {channels.map(({ icon: Icon, label, value, href, note }) => (
            <a
              className="group border border-graphite bg-onyx p-6 transition hover:border-gold-light"
              href={href}
              key={label}
              rel={label === "Instagram" ? "noreferrer" : undefined}
              target={label === "Instagram" ? "_blank" : undefined}
            >
              <Icon
                aria-hidden="true"
                className="h-5 w-5 text-gold"
                strokeWidth={1.5}
              />
              <p className="mt-4 text-[0.62rem] uppercase tracking-luxury text-gold-light">
                {label}
              </p>
              <p className="mt-2 break-words text-sm text-porcelain transition group-hover:text-gold-light">
                {value}
              </p>
              <p className="mt-3 text-xs leading-6 text-mist">{note}</p>
            </a>
          ))}
        </div>

        <section className="mt-12 border border-graphite bg-onyx p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <MapPin
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-gold"
              strokeWidth={1.5}
            />
            <div>
              <h2 className="font-serif text-2xl text-porcelain">The Atelier</h2>
              <address className="mt-4 text-sm not-italic leading-7 text-porcelain/72">
                {legal.entity}
                <br />
                {legal.address.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
              <p className="mt-4 text-sm leading-7 text-porcelain/72">
                {legal.hours}. Closed on Sundays and public holidays. We
                recommend calling ahead if you are travelling to see a
                particular piece.
              </p>
              <p className="mt-4 text-xs uppercase tracking-luxury text-mist">
                GSTIN {legal.gstin}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-graphite pt-8">
          <h2 className="font-serif text-2xl text-porcelain">
            About an order already placed
          </h2>
          <p className="mt-4 text-sm leading-7 text-porcelain/72">
            Please quote your order number — it begins ALK — and we will find it
            straight away. Cancellations, returns and refunds are set out in our
            Refund &amp; Cancellation Policy; delivery times are in our Shipping
            Policy.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
