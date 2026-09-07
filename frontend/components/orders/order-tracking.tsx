"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Truck } from "lucide-react";

type Tracking = {
  awbNumber: string | null;
  courierName?: string | null;
  status: string | null;
  history: { status: string; location?: string; at?: string }[];
  stale?: boolean;
};

/**
 * Where the parcel is, asked of the courier when the page opens.
 *
 * It renders nothing at all until there is something to say. A client whose
 * piece has not left the atelier is better served by the progress track above
 * than by an empty box promising tracking that does not exist yet.
 */
export function OrderTracking({ orderNumber }: { orderNumber: string }) {
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/orders/${encodeURIComponent(orderNumber)}/tracking`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Tracking | null) => {
        if (alive) {
          setTracking(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="mt-6 flex items-center gap-3 border border-graphite bg-onyx p-6 text-sm text-porcelain/60">
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-gold" />
        Checking with the courier
      </div>
    );
  }

  if (!tracking?.awbNumber) return null;

  return (
    <section className="mt-6 border border-graphite bg-onyx p-6">
      <h2 className="flex items-center gap-2 font-serif text-xl text-porcelain">
        <Truck aria-hidden="true" className="h-4 w-4 text-gold" strokeWidth={1.5} />
        On its way
      </h2>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-[0.6rem] uppercase tracking-luxury text-mist">
            Courier
          </dt>
          <dd className="mt-1 text-sm text-porcelain">
            {tracking.courierName ?? "Assigned"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.6rem] uppercase tracking-luxury text-mist">
            Tracking number
          </dt>
          <dd className="mt-1 font-mono text-sm text-gold-light">
            {tracking.awbNumber}
          </dd>
        </div>
        <div>
          <dt className="text-[0.6rem] uppercase tracking-luxury text-mist">
            Status
          </dt>
          <dd className="mt-1 text-sm text-porcelain">
            {tracking.status ?? "Awaiting the first scan"}
          </dd>
        </div>
      </dl>

      {tracking.history?.length > 0 ? (
        <ol className="mt-6 space-y-3 border-l border-graphite pl-5">
          {tracking.history.map((scan, index) => (
            <li className="relative text-sm" key={index}>
              <span
                aria-hidden="true"
                className={`absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full ${
                  index === 0 ? "bg-gold" : "bg-graphite"
                }`}
              />
              <p className="text-porcelain">{scan.status}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-mist">
                {scan.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden="true" className="h-3 w-3" />
                    {scan.location}
                  </span>
                ) : null}
                {scan.at}
              </p>
            </li>
          ))}
        </ol>
      ) : null}

      {tracking.stale ? (
        <p className="mt-5 text-xs leading-6 text-mist">
          The courier did not answer just now, so this is the last we heard.
          Refresh in a little while.
        </p>
      ) : null}
    </section>
  );
}
