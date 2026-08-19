"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "customer" | "admin";
  avatar?: string | null;
};

type SessionState = {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<SessionState["status"]>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/session/me", { cache: "no-store" });
      const data = (await res.json()) as { user: SessionUser | null };
      setUser(data.user);
      setStatus(data.user ? "authenticated" : "unauthenticated");
    } catch {
      // A failed lookup means we cannot prove who this is, so treat it as
      // signed out rather than leaving the header stuck on "loading".
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/session/logout", { method: "POST" });
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, status, refresh, logout }),
    [user, status, refresh, logout]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
