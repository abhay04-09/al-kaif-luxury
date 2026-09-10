import type { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { legal } from "@/lib/legal";
import {
  ChevronDown,
  CreditCard,
  Mail,
  PackageCheck,
  Phone,
  RotateCcw,
  Sparkles,
  Truck
} from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions | AL-KAIF Artificial Jewellery & Perfumes",
  description:
    "Answers about delivery charges, cash on delivery, order tracking, cancellations, returns and refunds at AL-KAIF."
};

/**
 * The questions a client would otherwise have to write in and ask.
 *
 * Every answer here is drawn from what the shop actually does — the delivery
 * policy, the return policy, and the checkout itself — rather than from the
 * comfortable generalities an FAQ tends to attract. Where a rule has an edge,
 * the edge is stated: an FAQ that quietly contradicts the return policy is
 * worse than no FAQ at all.
 */

type QA = { question: string; answer: ReactNode };

const SECTIONS: { title: string; icon: React.ElementType; items: QA[] }[] = [
  {
    title: "Orders & Payment",
    icon: CreditCard,
    items: [
      {
        question: "What payment methods can I use?",
        answer:
          "UPI, debit and credit cards, net banking and wallets, all through Razorpay's secure payment window. Cash on delivery is also available. We never see or store your card details."
      },
      {
        question: "Is GST included in the price shown?",
        answer:
          "Yes. Every price on the site includes GST at 3%, so the figure beside a piece is the figure you pay for it. Your order summary shows how much of that total is tax, for your records."
      },
      {
        question: "Why does my bank statement say EBAZAAR4U?",
        answer:
          "AL-KAIF trades as EBAZAAR4U, which is the name registered with our payment provider. A charge from EBAZAAR4U is your AL-KAIF order."
      },
      {
        question: "Can I pay cash on delivery?",
        answer:
          "Yes, on most pin codes. We add nothing of our own for the privilege — you pay the courier's own charge for collecting cash, which is already inside the delivery figure shown at checkout, and not a rupee more."
      }
    ]
  },
  {
    title: "Delivery",
    icon: Truck,
    items: [
      {
        question: "How much is delivery?",
        answer:
          "It depends on where you are, and we show you the real figure before you pay. Enter your PIN code at checkout and we ask our courier network what your parcel actually costs to send, along with how long they expect to take. There is no flat charge padded to cover the worst case."
      },
      {
        question: "Why do you need my PIN code before showing a total?",
        answer:
          "Because delivery does not cost the same to Mumbai as it does to Srinagar, and we would rather ask than guess high. Until you enter it, the total is shown as your items plus delivery, and the pay button waits."
      },
      {
        question: "How long will my order take?",
        answer:
          "Orders are verified and dispatched within 1 to 2 business days, excluding Sundays and national holidays. Transit is typically 3 to 7 business days, and 3 to 4 days to metro cities. Perfume travels by surface courier under the regulations for liquids, which can add a day or two to remote pin codes."
      },
      {
        question: "Do you deliver to my area?",
        answer:
          "Enter your PIN code at checkout and you will know straight away — if a courier will carry to you, you will see their name and their price before you pay. For anywhere our couriers do not reach, write to us and we will tell you what is possible."
      },
      {
        question: "What is the “use my current location” button?",
        answer:
          "A convenience, and entirely optional. If you allow it, your phone shares its coordinates so we can fill in your street, city, state and PIN code — but it can only find your street, never your flat. You will still need to add your flat or house number and building name, and you can always simply type the whole address instead. Declining costs you nothing."
      }
    ]
  },
  {
    title: "Tracking & Cancellation",
    icon: PackageCheck,
    items: [
      {
        question: "How do I track my order?",
        answer: (
          <>
            Open{" "}
            <Link
              className="text-gold-light underline-offset-4 hover:underline"
              href="/orders"
            >
              your orders
            </Link>{" "}
            and choose the one you are waiting for. Once the courier has collected
            it, that page shows the tracking number, the courier&rsquo;s name and
            every scan along the way. The tracking number is also sent to you by
            SMS and email at pickup.
          </>
        )
      },
      {
        question: "Can I cancel my order?",
        answer: (
          <>
            Yes, from{" "}
            <Link
              className="text-gold-light underline-offset-4 hover:underline"
              href="/orders"
            >
              your orders
            </Link>
            , at any point before we hand the parcel to the courier. After that the
            parcel is moving and the button disappears — write to us and we will
            help. Cancelling a paid order returns your money to the card or account
            it came from.
          </>
        )
      },
      {
        question: "How long does a refund take?",
        answer:
          "Approved refunds reach the original payment method within 5 to 7 business days. Where an order was paid in cash there is no card to return it to, so we will get in touch to arrange it with you."
      }
    ]
  },
  {
    title: "Caring for Your Pieces",
    icon: Sparkles,
    items: [
      {
        question: "How long do the fragrances last?",
        answer:
          "Our perfumes are built on high-concentration fragrance oils and last on average 6 to 10 hours, though skin chemistry and how you apply them will move that either way."
      },
      {
        question: "How should I look after artificial jewellery?",
        answer:
          "Keep it away from water, sweat, sanitiser and alcohol-based perfume — those are what dull the polish. Put your jewellery on last when dressing, take it off first, and store each piece dry and separately."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    icon: RotateCcw,
    items: [
      {
        question: "Can I return a piece I have changed my mind about?",
        answer: (
          <>
            Exchanges and returns must be raised within 48 to 72 hours of delivery.
            Please read the{" "}
            <Link
              className="text-gold-light underline-offset-4 hover:underline"
              href="/refund-policy"
            >
              return and refund policy
            </Link>{" "}
            in full before ordering — it sets out exactly which pieces qualify.
          </>
        )
      },
      {
        question: "Why do I need an unboxing video?",
        answer:
          "Because artificial jewellery is delicate and perfume travels in glass. A clear, continuous video showing the sealed parcel being opened is what lets us claim against the courier on your behalf, and it is required for any replacement of an item that arrives damaged, missing or incorrect. Start recording before you break the seal."
      },
      {
        question: "Can I return a perfume?",
        answer:
          "Only if it arrives damaged or defective. A bottle that has been opened, tested or unsealed cannot be returned, for hygiene and safety reasons."
      }
    ]
  }
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <div className="border-b border-white/10 pb-10">
          <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
            Help &amp; Answers
          </p>
          <h1 className="mt-4 font-serif text-4xl text-porcelain sm:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-porcelain/75">
            The things clients ask us most often, answered plainly. If yours is not
            here, write to us — a real person replies.
          </p>
          <p className="mt-3 text-xs tracking-wider text-porcelain/50">
            Last Updated: {legal.lastUpdated}
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((section, sectionIndex) => (
            <section className="space-y-4" key={section.title}>
              <h2 className="flex items-center gap-3 font-serif text-2xl text-porcelain">
                <span className="font-sans text-sm tracking-luxury text-gold-light">
                  {String(sectionIndex + 1).padStart(2, "0")}.
                </span>
                <section.icon
                  aria-hidden="true"
                  className="h-5 w-5 text-gold-light"
                  strokeWidth={1.5}
                />
                {section.title}
              </h2>

              <div className="divide-y divide-white/10 border border-white/10 bg-onyx/40">
                {section.items.map((item) => (
                  /* A native disclosure rather than a scripted accordion: it
                     works before JavaScript loads, and find-in-page can still
                     reach the answers folded inside it. */
                  <details className="group px-6" key={item.question}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm text-porcelain marker:content-none">
                      {item.question}
                      <ChevronDown
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-gold-light transition-transform group-open:rotate-180"
                        strokeWidth={1.6}
                      />
                    </summary>
                    <div className="pb-6 pr-8 text-sm leading-8 text-porcelain/70">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 border border-white/10 bg-onyx/40 p-8">
          <h2 className="font-serif text-2xl text-porcelain">Still need a hand?</h2>
          <p className="mt-3 text-sm leading-7 text-porcelain/70">
            Quote your order number and we will pick it up from there.
          </p>
          <div className="mt-6 flex flex-col gap-4 text-sm text-porcelain/80 sm:flex-row sm:gap-10">
            <a
              className="flex items-center gap-3 transition hover:text-gold-light"
              href={`mailto:${legal.email}`}
            >
              <Mail aria-hidden="true" className="h-4 w-4 text-gold-light" />
              {legal.email}
            </a>
            <a
              className="flex items-center gap-3 transition hover:text-gold-light"
              href={`tel:${legal.phoneHref}`}
            >
              <Phone aria-hidden="true" className="h-4 w-4 text-gold-light" />
              {legal.phone}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
