import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SessionProvider } from "@/components/auth/session-provider";
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
  title: "AL-KAIF | Artificial Jewellery & Luxury Craftsmanship",
  description:
    "Official AL-KAIF e-commerce store. Handcrafted Kundan, Meenakari, Bangles, Earrings, and Fine Jewellery.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/brand/al-kaif-logo.png" }
    ],
    shortcut: "/brand/al-kaif-logo.png",
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${cinzel.variable} ${cormorant.variable} ${jakarta.variable}`}
    >
      <body>
        <SessionProvider>
          <ThemeProvider>
            <AnnouncementBar />
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
            <WhatsAppButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
