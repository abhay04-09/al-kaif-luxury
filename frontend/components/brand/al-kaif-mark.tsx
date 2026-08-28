import Image from "next/image";

export function AlKaifMark({ className }: { className?: string }) {
  return (
    <Image
      alt="AL-KAIF Brand Logo"
      className={`object-contain transition-transform duration-300 hover:scale-105 ${className || "h-11 sm:h-13 w-auto"}`}
      height={140}
      priority
      src="/brand/al-kaif-brand-logo.png"
      width={220}
    />
  );
}
