import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "rgb(var(--color-obsidian) / <alpha-value>)",
        onyx: "rgb(var(--color-onyx) / <alpha-value>)",
        verdant: "rgb(var(--color-verdant) / <alpha-value>)",
        abyss: "rgb(var(--color-abyss) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        "gold-light": "rgb(var(--color-gold-light) / <alpha-value>)",
        "gold-bright": "rgb(var(--color-gold-bright) / <alpha-value>)",
        porcelain: "rgb(var(--color-porcelain) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        graphite: "rgb(var(--color-graphite) / <alpha-value>)"
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
