import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AL-KAIF | Luxury Jewellery & Watches",
  description:
    "A cinematic luxury digital experience for AL-KAIF fine jewellery and watches.",
  metadataBase: new URL("https://al-kaif.example")
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${jakarta.variable}`}
    >
      <body>
        <AuthSessionProvider>
          <ThemeProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
            <WhatsAppButton />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
