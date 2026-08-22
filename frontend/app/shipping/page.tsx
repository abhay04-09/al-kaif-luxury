import Link from "next/link";
import { LegalPage, List, Section } from "@/components/legal/legal-page";
import { legal } from "@/lib/legal";

export const metadata = {
  title: "Shipping & Delivery Policy | AL-KAIF",
  description:
    "How AL-KAIF dispatches, insures and delivers fine jewellery and perfumes across India."
};

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping & Delivery"
      summary="Every piece leaves us packed, insured and tracked. This page sets out how long that takes and what happens if something goes wrong on the way."
    >
      <Section title="Where we deliver">
        <p>
          We deliver across India. We do not ship internationally at present; if
          you are abroad and want a piece, write to {legal.email} and we will
          tell you what is possible.
        </p>
        <p>
          A few remote pin codes are outside our couriers&rsquo; reach. If yours
          is one, we will tell you promptly and refund you in full.
        </p>
      </Section>

      <Section title="How long it takes">
        <List
          items={[
            <>
              <strong className="text-porcelain">Dispatch:</strong>{" "}
              {legal.dispatchDays} working days from the moment payment clears.
              Pieces that are engraved, resized or made to order take longer, and
              we will tell you how long when you order.
            </>,
            <>
              <strong className="text-porcelain">In transit:</strong>{" "}
              {legal.deliveryDays} working days after dispatch, depending on your
              location.
            </>
          ]}
        />
        <p>
          Working days exclude Sundays and public holidays. Festival periods and
          heavy weather slow every courier in the country, and we would rather
          warn you than promise a date we cannot keep.
        </p>
      </Section>

      <Section title="Charges">
        <p>
          Delivery charges, where they apply, are shown at checkout before you
          pay. There are no charges added afterwards.
        </p>
      </Section>

      <Section title="How your parcel travels">
        <p>
          Jewellery is sent insured and requires a signature on delivery. Parcels
          are packed discreetly — nothing on the outside announces what is
          inside. You will receive a tracking reference by email once the parcel
          leaves us.
        </p>
      </Section>

      <Section title="On the day">
        <p>
          Please give an address where somebody can receive the parcel during
          working hours, and a mobile number the courier can reach. Most failed
          deliveries are simply nobody being home.
        </p>
        <p>
          Couriers usually attempt delivery three times before returning a parcel
          to us. If that happens we will contact you to arrange a second
          dispatch; a further delivery charge may apply.
        </p>
        <p>
          Please examine the packaging before you sign. If it is torn, crushed or
          has been opened, refuse the parcel or note the damage with the courier,
          then tell us the same day.
        </p>
      </Section>

      <Section title="If a parcel is delayed or lost">
        <p>
          If tracking has not moved for several days, write to {legal.email} with
          your order number and we will take it up with the courier. A parcel
          insured by us and lost in transit is our loss, not yours: you will
          receive a replacement or a full refund, whichever you prefer.
        </p>
      </Section>

      <Section title="Cash on delivery">
        <p>
          Where cash on delivery is offered, please have the exact amount ready.
          Orders refused at the door without reason may mean we decline cash on
          delivery for future orders from that address.
        </p>
      </Section>

      <Section title="Returns">
        <p>
          Sending something back is covered in our{" "}
          <Link
            className="text-gold-light underline-offset-4 hover:underline"
            href="/refund"
          >
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
