import Image from "next/image";

export function AlKaifMark({ className }: { className?: string }) {
  return (
    <Image
      alt="AL-KAIF Luxury Logo"
      className={`object-contain ${className || "h-10 w-auto"}`}
      height={120}
      priority
      src="/brand/al-kaif-brand-logo.png"
      width={120}
    />
  );
}
