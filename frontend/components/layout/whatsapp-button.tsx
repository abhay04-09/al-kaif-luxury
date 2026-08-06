import { MessageCircle } from "lucide-react";

const enquiryMessage =
  "Hello AL-KAIF, I would like to know more about your jewellery and perfume collection.";

export function WhatsAppButton() {
  const phoneNumber = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");

  if (!phoneNumber) {
    return null;
  }

  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(enquiryMessage)}`;

  return (
    <a
      aria-label="Chat with AL-KAIF on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(37,211,102,0.45)] transition hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian sm:bottom-7 sm:right-7 sm:h-16 sm:w-16"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />
    </a>
  );
}
