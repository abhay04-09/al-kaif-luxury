import Link from "next/link";
import { LegalPage, List, Section } from "@/components/legal/legal-page";
import { addressOneLine, legal } from "@/lib/legal";

export const metadata = {
  title: "Terms & Conditions | AL-KAIF",
  description:
    "The terms on which AL-KAIF sells fine jewellery and perfumes through alkaif.in."
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      summary={`These are the terms on which ${legal.brand} sells to you. Placing an order means you accept them, so they are written to be read rather than skipped.`}
    >
      <Section title="Who you are dealing with">
        <p>
          {legal.site} is operated by {legal.entity}, GSTIN {legal.gstin}, of{" "}
          {addressOneLine}. In these terms &ldquo;we&rdquo; and &ldquo;us&rdquo;
          mean that business, and &ldquo;you&rdquo; means the person placing the
          order.
        </p>
      </Section>

      <Section title="Using this site">
        <p>
          You must be at least eighteen years old and able to enter a contract
          under the Indian Contract Act, 1872. You agree not to interfere with
          the site, attempt to gain access to accounts or data that are not
          yours, or use it for anything unlawful.
        </p>
        <p>
          If you hold an account, you are responsible for what happens under it.
          Tell us promptly if you think someone else has your password.
        </p>
      </Section>

      <Section title="Pieces and their descriptions">
        <p>
          We describe every piece as accurately as we can. Jewellery and perfume
          are photographed under studio lighting, and screens differ — colour,
          finish and the exact figuring of a natural stone will vary slightly
          from the images. Weights and dimensions are close approximations unless
          stated otherwise on the piece itself.
        </p>
        <p>
          Nothing on this site is an offer to sell. Adding a piece to your bag
          does not reserve it, and stock can be exhausted before you reach
          checkout.
        </p>
      </Section>

      <Section title="Prices and tax">
        <p>
          Prices are in Indian Rupees. Applicable GST is shown separately at
          checkout and included in the total you approve before paying. We may
          change prices at any time, but never after your order is confirmed.
        </p>
        <p>
          If a piece is listed at an obviously incorrect price — a decimal in the
          wrong place, say — we may decline the order and refund you in full
          rather than honour a figure neither of us believed.
        </p>
      </Section>

      <Section title="Orders">
        <p>
          Your order is an offer to buy. The contract is formed when we confirm
          the order and accept payment. We may decline an order where the piece
          is unavailable, where the delivery address is outside the areas we
          serve, where the payment cannot be verified, or where we reasonably
          suspect fraud.
        </p>
      </Section>

      <Section title="Payment">
        <p>
          Payments are handled by Razorpay, which accepts UPI, cards, net
          banking, wallets and EMI. All orders are paid for at the time of
          ordering. The amount charged is calculated by us from the current catalogue price
          of the items in your bag — never from a figure supplied by your
          browser — and is verified against Razorpay&rsquo;s own record before an
          order is marked paid.
        </p>
        <p>
          We do not receive or store your card number, UPI PIN, CVV or net-banking
          credentials at any point.
        </p>
      </Section>

      <Section title="Delivery, returns and refunds">
        <p>
          Dispatch and delivery are covered in our{" "}
          <Link
            className="text-gold-light underline-offset-4 hover:underline"
            href="/shipping"
          >
            Shipping Policy
          </Link>
          . Cancellations, returns and refunds are covered in our{" "}
          <Link
            className="text-gold-light underline-offset-4 hover:underline"
            href="/refund"
          >
            Refund &amp; Cancellation Policy
          </Link>
          . Both form part of these terms.
        </p>
      </Section>

      <Section title="Our work is our own">
        <p>
          The name {legal.brand}, the marks, the photography, the writing and the
          design of this site belong to us and may not be copied, reproduced or
          used commercially without our written permission.
        </p>
      </Section>

      <Section title="What we are responsible for">
        <p>
          We stand behind what we sell. We are responsible for delivering a piece
          that matches its description and is free from manufacturing defect.
        </p>
        <p>
          We are not responsible for damage caused by ordinary wear, by accident,
          by unsuitable storage, by contact with perfume, chlorine or household
          chemicals, or by repair or alteration carried out by anyone other than
          us. To the extent the law allows, our total liability for any order is
          limited to the amount you paid for it.
        </p>
        <List
          items={[
            "Perfume is a personal product. Test a new fragrance on a small area of skin before wearing it, and discontinue use if irritation occurs.",
            "Some people react to metals and alloys. If you know you are sensitive to a metal, ask us before ordering."
          ]}
        />
      </Section>

      <Section title="Events outside our control">
        <p>
          We are not liable for delay or failure caused by something genuinely
          beyond our control — a courier strike, a natural disaster, civil
          disturbance, or a failure of payment or communications infrastructure.
          Where such an event prevents delivery, we will refund you in full.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of India. Any dispute arising from
          them is subject to the exclusive jurisdiction of the courts at{" "}
          {legal.jurisdiction}.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may revise these terms. The version published here when you place an
          order is the version that governs it.
        </p>
      </Section>
    </LegalPage>
  );
}
