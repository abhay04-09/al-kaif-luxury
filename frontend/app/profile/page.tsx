import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "My Account | AL-KAIF"
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Mobile", value: user.phone || "Not provided" },
    { label: "Membership", value: user.role === "admin" ? "Maison Admin" : "Private Client" }
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">
          Client Profile
        </p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">My Account</h1>

        <dl className="mt-10 divide-y divide-graphite border-y border-graphite">
          {details.map((detail) => (
            <div
              className="grid gap-2 py-5 sm:grid-cols-3 sm:items-center"
              key={detail.label}
            >
              <dt className="text-[0.65rem] uppercase tracking-luxury text-gold-light">
                {detail.label}
              </dt>
              <dd className="text-porcelain sm:col-span-2">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            className="inline-flex min-h-12 items-center border border-gold/70 px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain transition hover:bg-gold hover:text-obsidian"
            href="/orders"
          >
            View my orders
          </Link>

          <LogoutButton />
        </div>
      </main>
    </>
  );
}
