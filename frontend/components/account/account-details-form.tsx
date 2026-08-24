"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";

const fieldClass =
  "min-h-12 w-full border border-white/10 bg-obsidian px-4 text-porcelain outline-none transition placeholder:text-mist/50 focus:border-gold-light";
const labelClass =
  "mb-2 block text-[0.6rem] uppercase tracking-luxury text-gold-light";

export function AccountDetailsForm({
  name,
  phone,
  address
}: {
  name: string;
  phone: string;
  address: string;
}) {
  const router = useRouter();
  const { refresh } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/session/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        address: String(form.get("address") ?? "").trim()
      })
    });
    const data = (await res.json()) as { error?: string };
    setIsSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save your details.");
      return;
    }

    await refresh();
    setIsEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
    // The page is server-rendered, so the new details need fetching again.
    router.refresh();
  }

  if (!isEditing) {
    return (
      <div className="border border-graphite bg-onyx p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-xl text-porcelain">Your details</h2>
          <button
            className="inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-luxury text-gold-light transition hover:text-gold"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
            Edit
          </button>
        </div>

        {saved ? (
          <p className="mt-4 flex items-center gap-2 border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <Check aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
            Saved.
          </p>
        ) : null}

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-[0.6rem] uppercase tracking-luxury text-mist">Name</dt>
            <dd className="mt-1 text-porcelain">{name}</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-luxury text-mist">Mobile</dt>
            <dd className="mt-1 text-porcelain">
              {phone || <span className="text-mist">Not provided</span>}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-luxury text-mist">
              Delivery address
            </dt>
            <dd className="mt-1 whitespace-pre-line leading-7 text-porcelain">
              {address || (
                <span className="text-mist">
                  No address saved. Add one and checkout will fill it in for you.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form className="border border-graphite bg-onyx p-6" onSubmit={save}>
      <h2 className="font-serif text-xl text-porcelain">Your details</h2>

      <div className="mt-5 space-y-5">
        <div>
          <label className={labelClass} htmlFor="account-name">
            Name
          </label>
          <input
            autoComplete="name"
            className={fieldClass}
            defaultValue={name}
            id="account-name"
            name="name"
            required
            type="text"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="account-phone">
            Mobile number
          </label>
          <input
            autoComplete="tel"
            className={fieldClass}
            defaultValue={phone}
            id="account-phone"
            inputMode="tel"
            name="phone"
            placeholder="98765 43210"
            type="tel"
          />
          <p className="mt-2 text-xs text-mist">
            The courier uses this to reach you on the day.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="account-address">
            Delivery address
          </label>
          <textarea
            autoComplete="street-address"
            className={`${fieldClass} min-h-32 resize-y py-3`}
            defaultValue={address}
            id="account-address"
            name="address"
            placeholder={"Flat, building, street\nArea, landmark\nCity, State, PIN code"}
          />
          <p className="mt-2 text-xs text-mist">
            Saved for next time. You can still change it at checkout.
          </p>
        </div>
      </div>

      {error ? (
        <p
          className="mt-5 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold px-6 py-3 text-[0.7rem] uppercase tracking-luxury text-obsidian transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : null}
          Save details
        </button>
        <button
          className="inline-flex min-h-12 items-center px-4 text-[0.7rem] uppercase tracking-luxury text-porcelain/70 transition hover:text-gold-light"
          disabled={isSaving}
          onClick={() => {
            setIsEditing(false);
            setError(null);
          }}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
