"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/auth/session-provider";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useSession();
  const [isBusy, setIsBusy] = useState(false);

  return (
    <button
      className="inline-flex min-h-12 items-center border border-graphite px-6 py-3 text-[0.72rem] uppercase tracking-luxury text-porcelain/80 transition hover:border-gold-light hover:text-gold-light disabled:opacity-60"
      disabled={isBusy}
      onClick={async () => {
        setIsBusy(true);
        await logout();
        router.replace("/");
        router.refresh();
      }}
      type="button"
    >
      Log out
    </button>
  );
}
