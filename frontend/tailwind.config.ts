import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Theme Variables
        "bg-main": "var(--bg-main)",
        "bg-surface": "var(--bg-surface)",
        "bg-card": "var(--bg-card)",
        "text-main": "var(--text-main)",
        "text-muted": "var(--text-muted)",
        "gold-accent": "var(--gold-accent)",
        "gold-hover": "var(--gold-hover)",
        "ruby-accent": "var(--ruby-accent)",
        "border-subtle": "var(--border-subtle)",
        ruby: "var(--ruby-accent)",

        // Brand Palette Mappings
        obsidian: "rgb(var(--color-obsidian) / <alpha-value>)",
        onyx: "rgb(var(--color-onyx) / <alpha-value>)",
        verdant: "rgb(var(--color-verdant) / <alpha-value>)",
        abyss: "rgb(var(--color-abyss) / <alpha-value>)",
        gold: "var(--gold-accent)",
        "gold-light": "var(--gold-hover)",
        "gold-bright": "#FFD700",
        porcelain: "var(--text-main)",
        mist: "var(--text-muted)",
        graphite: "var(--border-subtle)"
      },
      fontFamily: {
        serif: ["var(--font-display)", "Cinzel", "Georgia", "serif"],
        accent: ["var(--font-accent)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-body)", "Plus Jakarta Sans", "Arial", "sans-serif"]
      },
      letterSpacing: {
        luxury: "0.18em",
        imperial: "0.3em",
        regal: "0.5em"
      }
    }
  },
  plugins: []
};

export default config;
