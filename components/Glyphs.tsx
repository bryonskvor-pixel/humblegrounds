// Hand-drawn-style inline SVG stand-ins. Each gets replaced by a generated
// illustration from the asset backlog (§6); keep the ink-and-wash spirit meanwhile.

export function BeanGlyph({ filled = 1, className }: { filled?: number; className?: string }) {
  // filled: 0, 0.5, or 1
  const id = `bean-fill-${Math.round(filled * 100)}`;
  return (
    <svg viewBox="0 0 30 38" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset={`${filled * 100}%`} stopColor="currentColor" />
          <stop offset={`${filled * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <ellipse
        cx="15"
        cy="19"
        rx="11"
        ry="16"
        fill={filled >= 1 ? "currentColor" : filled > 0 ? `url(#${id})` : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M15 4 C 12 12, 18 26, 15 34"
        fill="none"
        stroke={filled > 0 ? "var(--paper)" : "currentColor"}
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function MastheadGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <ellipse cx="30" cy="32" rx="16" ry="22" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M30 12 C 25 24, 35 40, 30 52" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 56 h32" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
    </svg>
  );
}

export function JarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} aria-hidden="true">
      <rect x="14" y="6" width="32" height="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 14 v52 a6 6 0 0 0 6 6 h16 a6 6 0 0 0 6-6 v-52"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M20 34 h20 M20 42 h20 M20 50 h14" stroke="currentColor" strokeWidth="1.2" />
      <rect x="19" y="30" width="22" height="34" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

export function MapPinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <path
        d="M22 4 a12 12 0 0 1 12 12 c0 9 -12 24 -12 24 s-12 -15 -12 -24 a12 12 0 0 1 12 -12 z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="22" cy="16" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 41 h28" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 3" />
    </svg>
  );
}

export function ParcelGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <path d="M6 15 L22 7 L38 15 L38 33 L22 41 L6 33 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 15 L22 23 L38 15 M22 23 V41" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 11 L30 19" fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 2" />
    </svg>
  );
}

export function GroundStrip({ className }: { className?: string }) {
  // crosshatched ground line running along the bottom of the page (§5.1.6)
  return (
    <svg viewBox="0 0 1200 46" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <path d="M0 14 Q 150 6, 300 13 T 600 12 T 900 14 T 1200 11 V 46 H 0 Z" fill="url(#hatch)" opacity="0.55" />
      <path d="M0 14 Q 150 6, 300 13 T 600 12 T 900 14 T 1200 11" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
