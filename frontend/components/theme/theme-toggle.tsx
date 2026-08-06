"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center text-porcelain/80 transition hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
      ) : (
        <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={1.4} />
      )}
    </button>
  );
}