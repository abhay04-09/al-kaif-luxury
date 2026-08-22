import { LegalPage, List, Section } from "@/components/legal/legal-page";
import { addressOneLine, legal } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy | AL-KAIF",
  description:
    "How AL-KAIF collects, uses, shares and protects the personal information of its clients."
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      summary={`This policy explains what ${legal.brand} learns about you when you shop with us, why we hold it, who else sees it, and what you can ask us to do about it.`}
    >
      <Section title="Who we are">
        <p>
          {legal.brand} is a trading name of {legal.entity}, a business
          registered in India under GSTIN {legal.gstin}, operating from{" "}
          {addressOneLine}. We sell fine jewellery and perfumes through{" "}
          {legal.site} and are the data fiduciary for the information described
          here.
        </p>
      </Section>

      <Section title="What we collect">
        <p>We only collect what an order or an account actually requires.</p>
        <List
          items={[
            <>
              <strong className="text-porcelain">Account details.</strong> Your
              name, email address and — if you choose to give it — your mobile
              number. If you sign in with Google we receive your name, email
              address and profile picture from Google; if you sign in with a
              mobile number we receive only that number.
            </>,
            <>
              <strong className="text-porcelain">Order details.</strong> The
              delivery address, contact number and items on each order, together
              with any gift or delivery instructions you add.
            </>,
            <>
              <strong className="text-porcelain">Payment references.</strong> The
              payment and order identifiers our payment gateway returns, and
              whether a payment succeeded. We never see or store your card
              number, UPI PIN, CVV or net-banking credentials.
            </>,
            <>
              <strong className="text-porcelain">Technical information.</strong>{" "}
              Ordinary web-server records such as your IP address and browser
              type, kept to keep the site running and to detect abuse.
            </>
          ]}
        />
      </Section>

      <Section title="Why we hold it">
        <List
          items={[
            "To take, price, pack and deliver your order, and to reach you if something about it changes.",
            "To let you sign in and see your own order history.",
            "To answer questions, handle returns and process refunds.",
            "To meet tax and accounting obligations, which require us to keep invoice records for the period Indian law prescribes.",
            "To detect and prevent fraudulent or duplicated payments."
          ]}
        />
        <p>
          We do not sell your personal information, and we do not send marketing
          email unless you have subscribed to our newsletter — which you may
          leave at any time.
        </p>
      </Section>

      <Section title="Who else sees it">
        <p>
          Running a shop means trusting a few specialists. Each of these
          receives only what its job requires:
        </p>
        <List
          items={[
            <>
              <strong className="text-porcelain">Razorpay</strong> — to take
              payment. Your card and UPI details are entered on Razorpay&rsquo;s
              own secure window and are never handled by us.
            </>,
            <>
              <strong className="text-porcelain">Supabase</strong> — the database
              holding accounts and orders.
            </>,
            <>
              <strong className="text-porcelain">
                Cloudflare and Vercel
              </strong>{" "}
              — hosting and delivery of the site itself.
            </>,
            <>
              <strong className="text-porcelain">Google</strong> — only if you
              choose to sign in with a Google account.
            </>,
            <>
              <strong className="text-porcelain">Courier partners</strong> — the
              name, address and phone number needed to deliver your parcel.
            </>
          ]}
        />
        <p>
          We will also disclose information where a court, tax authority or law
          enforcement agency lawfully requires it.
        </p>
      </Section>

      <Section title="Where it is kept, and for how long">
        <p>
          Some of these providers store data on servers outside India. We keep
          order and invoice records for as long as tax law requires, and account
          details for as long as your account is open. Ask us to close your
          account and we will delete what we are not obliged to keep.
        </p>
      </Section>

      <Section title="Keeping it safe">
        <p>
          The site is served only over HTTPS. Passwords are stored as salted
          PBKDF2 hashes, never as readable text, so nobody at {legal.brand} can
          read yours. Your sign-in session is held in a cookie that scripts on
          the page cannot read. Access to the administration panel is restricted
          to named accounts.
        </p>
        <p>
          No system is perfect, and we make no claim to be. If we ever discover a
          breach affecting your information, we will tell you and the relevant
          authority as the law requires.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use cookies only to keep you signed in and to remember what is in
          your bag. We do not use advertising or cross-site tracking cookies.
          Blocking cookies in your browser will stop sign-in and checkout from
          working.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Under the Digital Personal Data Protection Act, 2023 you may ask us to
          show you what we hold about you, correct anything wrong, delete what we
          are not required to keep, or withdraw a consent you previously gave.
          Write to {legal.email} and we will respond within thirty days.
        </p>
      </Section>

      <Section title="Children">
        <p>
          This shop is not intended for anyone under eighteen, and we do not
          knowingly collect information from children. If you believe a child has
          given us information, write to us and we will remove it.
        </p>
      </Section>

      <Section title="Grievance Officer">
        <p>
          In accordance with the Information Technology Act, 2000 and the rules
          made under it, complaints about the handling of your personal
          information may be addressed to:
        </p>
        <p className="border border-graphite bg-onyx p-5">
          {legal.grievanceOfficer}
          <br />
          {legal.entity}
          <br />
          {legal.address.lines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
          {legal.email}
          <br />
          {legal.phone}
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes we will publish the new version here and move
          the date at the top. Continuing to use the site after a change means
          you accept it.
        </p>
      </Section>
    </LegalPage>
  );
}
