import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";

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
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <WhatsAppButton />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
