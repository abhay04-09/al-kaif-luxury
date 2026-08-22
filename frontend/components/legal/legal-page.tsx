import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { legal } from "@/lib/legal";

/**
 * The shell every policy page sits in.
 *
 * Policies are read by people who are already unhappy, and by payment
 * providers checking the maison is what it claims to be. Both are served by
 * plain language set generously — so the measure stays narrow and the headings
 * stay findable.
 */
export function LegalPage({
  eyebrow,
  title,
  summary,
  children
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-porcelain sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-sm leading-7 text-porcelain/70">{summary}</p>
        <p className="mt-6 border-t border-graphite pt-6 text-xs uppercase tracking-luxury text-mist">
          Last updated {legal.lastUpdated}
        </p>

        <div className="mt-10 space-y-10">{children}</div>

        <div className="mt-16 border-t border-graphite pt-8 text-sm leading-7 text-porcelain/70">
          <p>
            Questions about this page? Write to{" "}
            <a
              className="text-gold-light underline-offset-4 hover:underline"
              href={`mailto:${legal.email}`}
            >
              {legal.email}
            </a>{" "}
            or call{" "}
            <a
              className="text-gold-light underline-offset-4 hover:underline"
              href={`tel:${legal.phoneHref}`}
            >
              {legal.phone}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-porcelain">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-porcelain/72">
        {children}
      </div>
    </section>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li className="flex gap-3" key={index}>
          <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 bg-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
