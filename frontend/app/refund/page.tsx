import { LegalPage, List, Section } from "@/components/legal/legal-page";
import { legal } from "@/lib/legal";

export const metadata = {
  title: "Refund & Cancellation Policy | AL-KAIF",
  description:
    "How to cancel an AL-KAIF order, how to return a piece, and how long a refund takes."
};

export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Cancellation"
      summary="If a piece is not right, we would rather put it right than keep your money. This page explains exactly how, and how long each step takes."
    >
      <Section title="Cancelling before dispatch">
        <p>
          You may cancel an order at any time before it is dispatched, for any
          reason, at no cost. Write to {legal.email} or call {legal.phone} with
          your order number. If you have already paid, the full amount is
          returned to the original payment method.
        </p>
        <p>
          Once a parcel has left us it cannot be cancelled — it becomes a return
          instead.
        </p>
      </Section>

      <Section title="Returning a piece">
        <p>
          You have {legal.returnWindowDays} days from delivery to tell us you
          wish to return a piece. Write to {legal.email} with your order number
          and a photograph, and we will confirm the return and tell you where to
          send it.
        </p>
        <p>To be accepted, a returned piece must be:</p>
        <List
          items={[
            "unworn and unused, in the condition it arrived in",
            "in its original box and packaging, with any protective seals intact",
            "accompanied by its invoice and any certificate or hallmark documentation supplied with it"
          ]}
        />
      </Section>

      <Section title="What cannot be returned">
        <p>
          Some things cannot be taken back, for reasons of hygiene or because
          they were made for you alone:
        </p>
        <List
          items={[
            "Perfume whose seal has been broken or which has been used.",
            "Earrings and any other pierced jewellery, unless it arrived faulty — this is a hygiene requirement and we cannot make exceptions.",
            "Pieces made, engraved, resized or otherwise customised to your instruction.",
            "Pieces damaged after delivery by wear, accident, unsuitable storage, or contact with perfume, chlorine or household chemicals.",
            "Anything reported to us after the return window has closed."
          ]}
        />
        <p>
          None of this limits your rights where a piece arrived damaged,
          defective or not as described.
        </p>
      </Section>

      <Section title="If a piece arrives damaged or wrong">
        <p>
          Tell us within 48 hours of delivery and send photographs of the piece
          and the packaging. Please open the parcel carefully and keep the box
          until the matter is settled — the courier will usually ask for it.
        </p>
        <p>
          Where the fault is ours, we cover return postage and you may choose a
          replacement or a full refund. We do not ask you to bear the cost of our
          mistake.
        </p>
      </Section>

      <Section title="Return postage">
        <p>
          Where a piece is returned because it arrived damaged, defective or not
          as described, we pay. Where it is returned for any other reason, return
          postage is yours to arrange and to bear. Please use an insured,
          trackable service — until the parcel reaches us it remains your
          responsibility, and jewellery sent by ordinary post is rarely
          recovered when it goes missing.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          We inspect a returned piece as soon as it arrives and tell you the
          outcome. Once approved, the refund is issued to the original payment
          method within {legal.refundDays} working days. How quickly it then
          appears is up to your bank; card refunds in particular can take a
          further few days to show on a statement.
        </p>
        <p>
          A refund covers the price of the piece and the tax charged on it.
          Original delivery charges are refunded where the return is our fault,
          and are not refunded where it is not.
        </p>
      </Section>

      <Section title="Exchanges">
        <p>
          We are glad to exchange a piece for another of the same or greater
          value within the return window, subject to the same conditions above.
          Where the new piece costs more, the difference is payable; where it
          costs less, the difference is refunded.
        </p>
      </Section>

      <Section title="If you are not satisfied with the outcome">
        <p>
          Write to {legal.email} and ask for the matter to be reviewed by the
          proprietor. We would far rather settle a complaint ourselves than have
          you raise it elsewhere.
        </p>
      </Section>
    </LegalPage>
  );
}
