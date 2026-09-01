"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme("light");
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("dark");
    window.localStorage.setItem("al-kaif-theme", "light");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {}
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}