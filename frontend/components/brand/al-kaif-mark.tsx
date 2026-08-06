/**
 * The AL-KAIF bird, traced from the mark used on al-kaif.vercel.app.
 * Kept as inline SVG rather than the PNG so it scales cleanly and carries no
 * baked-in background — the PNG in /brand is gold artwork on opaque black.
 */
export function AlKaifMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="alKaifMarkGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#DFC27C" />
          <stop offset="100%" stopColor="#8A6B29" />
        </linearGradient>
      </defs>

      <path
        d="M105 105 C115 85, 125 65, 140 50 C135 53, 128 58, 125 62 C115 75, 105 92, 98 108 C90 125, 80 142, 65 155 C52 166, 38 172, 22 175 C38 172, 52 165, 64 154 C78 141, 88 124, 98 108 Z"
        fill="url(#alKaifMarkGold)"
      />
      <path
        d="M102 105 C108 92, 115 78, 128 65 C132 60, 138 52, 146 48 C141 50, 137 53, 132 58 C122 70, 112 85, 105 102 Z"
        fill="url(#alKaifMarkGold)"
      />
      <path d="M142 50 L152 48 L144 53 Z" fill="#FFD700" />
      <path
        d="M20 50 C45 60, 75 80, 95 110 C80 92, 55 75, 30 65 C22 62, 12 55, 20 50 Z"
        fill="url(#alKaifMarkGold)"
      />
      <path
        d="M12 70 C38 82, 68 100, 88 125 C72 108, 48 92, 22 82 C14 79, 6 74, 12 70 Z"
        fill="url(#alKaifMarkGold)"
      />
      <path
        d="M18 95 C40 105, 65 120, 82 142 C68 128, 46 114, 25 106 C18 103, 12 98, 18 95 Z"
        fill="url(#alKaifMarkGold)"
      />
      <path
        d="M30 120 C48 130, 70 142, 82 160 C70 148, 50 136, 34 130 C28 128, 24 123, 30 120 Z"
        fill="url(#alKaifMarkGold)"
      />
      <path
        d="M22 175 C30 185, 42 190, 58 190 C42 188, 30 182, 22 175 Z"
        fill="url(#alKaifMarkGold)"
      />
    </svg>
  );
}
