"use client";

import Link from "next/link";
import { useState } from "react";

type ProductInfoTabsProps = {
  description: string;
  /** Spec lines, the maker's story and the SKU, already worded by the catalogue. */
  details: string[];
  material: string;
  netQuantity: string | null;
};

const TABS = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "delivery", label: "Delivery & Returns" }
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * What a client wants to know about a piece, one heading at a time rather than
 * one long page. A tab with nothing to say is not offered, so no section ever
 * opens empty. The delivery tab states no promise of its own: the shop's terms
 * live on their policy pages, and this points there.
 */
export function ProductInfoTabs({
  description,
  details,
  material,
  netQuantity
}: ProductInfoTabsProps) {
  const hasSpecs = details.length > 0 || Boolean(material) || Boolean(netQuantity);
  const hasDescription = description.trim().length > 0;

  const tabs = TABS.filter((tab) => {
    if (tab.id === "description") return hasDescription;
    if (tab.id === "specifications") return hasSpecs;
    return true;
  });

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "delivery");

  return (
    <section aria-label="Product information" className="mt-16">
      <div
        aria-label="Product information sections"
        className="flex gap-1 overflow-x-auto border-b border-white/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            aria-controls={`panel-${tab.id}`}
            aria-selected={active === tab.id}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-luxury transition sm:px-6 ${
              active === tab.id
                ? "border-brand-gold text-brand-gold"
                : "border-transparent text-porcelain/60 hover:text-porcelain"
            }`}
            id={`tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActive(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`tab-${active}`}
        className="max-w-3xl py-8 text-sm leading-7 text-porcelain/80 sm:text-base sm:leading-8"
        id={`panel-${active}`}
        role="tabpanel"
      >
        {active === "description" ? <p className="whitespace-pre-line">{description}</p> : null}

        {active === "specifications" ? (
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
            {material ? (
              <>
                <dt className="text-porcelain/60">Material</dt>
                <dd>{material}</dd>
              </>
            ) : null}
            {netQuantity ? (
              <>
                <dt className="text-porcelain/60">Net quantity</dt>
                <dd>{netQuantity}</dd>
              </>
            ) : null}
            {details.map((detail) => {
              // "Label: value" lines read as a row; a longer note (the maker's
              // story) spans the full width instead of being cut at a colon.
              const split = detail.indexOf(": ");
              const isRow = split > 0 && split < 32;
              return isRow ? (
                <div className="contents" key={detail}>
                  <dt className="text-porcelain/60">{detail.slice(0, split)}</dt>
                  <dd>{detail.slice(split + 2)}</dd>
                </div>
              ) : (
                <dd className="sm:col-span-2" key={detail}>
                  {detail}
                </dd>
              );
            })}
          </dl>
        ) : null}

        {active === "delivery" ? (
          <ul className="space-y-3">
            <li>
              Delivery is priced by pin code at checkout. Read the{" "}
              <Link className="text-brand-gold underline underline-offset-4" href="/delivery-policy">
                delivery policy
              </Link>
              .
            </li>
            <li>
              Returns and refunds follow the{" "}
              <Link className="text-brand-gold underline underline-offset-4" href="/return-policy">
                return policy
              </Link>{" "}
              and the{" "}
              <Link className="text-brand-gold underline underline-offset-4" href="/refund-policy">
                refund policy
              </Link>
              .
            </li>
            <li>
              Questions about this piece?{" "}
              <Link className="text-brand-gold underline underline-offset-4" href="/query">
                Raise a query
              </Link>
              .
            </li>
          </ul>
        ) : null}
      </div>
    </section>
  );
}
