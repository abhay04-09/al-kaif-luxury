import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await requireUser();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-36 sm:px-8">
        <p className="text-[0.7rem] uppercase tracking-luxury text-gold-light">Account</p>
        <h1 className="mt-4 font-serif text-5xl text-porcelain">My Profile</h1>

        <section className="mt-10 divide-y divide-white/10 border-y border-white/10">
          <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
            <p className="text-sm text-porcelain/60">Name</p>
            <p className="text-porcelain">{user.name ?? "Not provided"}</p>
          </div>

          <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
            <p className="text-sm text-porcelain/60">Email</p>
            <p className="text-porcelain">{user.email ?? "Not provided"}</p>
          </div>

          <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
            <p className="text-sm text-porcelain/60">Mobile</p>
            <p className="text-porcelain">{user.phone ?? "Not provided"}</p>
          </div>

          <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
            <p className="text-sm text-porcelain/60">Account type</p>
            <p className="text-gold-light">{user.role}</p>
          </div>

          <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
            <p className="text-sm text-porcelain/60">Member since</p>
            <p className="text-porcelain">
              {user.createdAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}