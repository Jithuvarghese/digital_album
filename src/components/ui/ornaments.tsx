/** Decorative motifs: nilavilakku (brass lamp), jasmine flowers and garlands, kasavu dividers. */

export function Lamp({ className = "", flame = true }: { className?: string; flame?: boolean }) {
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="rgb(var(--c-gold))" />
          <stop offset="0.5" stopColor="#F3D98B" />
          <stop offset="1" stopColor="rgb(var(--c-gold))" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#FFD86B" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFD86B" stopOpacity="0" />
        </radialGradient>
      </defs>
      {flame && (
        <>
          <circle cx="60" cy="34" r="30" fill="url(#glow)" />
          <g className="animate-flicker">
            <path d="M60 10 C70 26 70 38 60 46 C50 38 50 26 60 10Z" fill="#F6A623" />
            <path d="M60 22 C65 30 65 37 60 42 C55 37 55 30 60 22Z" fill="#FFF3C4" />
          </g>
        </>
      )}
      <path d="M26 50 Q60 68 94 50 L86 60 Q60 72 34 60Z" fill="url(#brass)" />
      <rect x="56" y="62" width="8" height="90" rx="3" fill="url(#brass)" />
      <ellipse cx="60" cy="100" rx="16" ry="5" fill="url(#brass)" />
      <ellipse cx="60" cy="128" rx="12" ry="4" fill="url(#brass)" />
      <path d="M30 196 Q60 150 90 196Z" fill="url(#brass)" />
      <rect x="24" y="192" width="72" height="6" rx="3" fill="url(#brass)" />
    </svg>
  );
}

export function Jasmine({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} className={className} aria-hidden>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-6" rx="3.6" ry="6" fill="#FFFFFF" stroke="rgb(var(--c-gold) / 0.35)" strokeWidth="0.5" transform={`rotate(${a})`} />
      ))}
      <circle r="2.4" fill="#F2D27A" />
    </svg>
  );
}

export function Garland({ className = "" }: { className?: string }) {
  const n = 15;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return { x: t * 400, y: 8 + Math.sin(t * Math.PI) * 30 };
  });
  return (
    <svg viewBox="0 0 400 50" className={className} preserveAspectRatio="none" aria-hidden>
      <path d="M0 8 Q200 68 400 8" fill="none" stroke="rgb(var(--c-gold))" strokeWidth="1.2" opacity="0.7" />
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          {i % 3 === 1 ? <circle r="4.5" fill="rgb(var(--c-accent))" /> : (
            <>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-3.6" rx="2.2" ry="3.6" fill="#FFFFFF" transform={`rotate(${a})`} />
              ))}
              <circle r="1.4" fill="#F2D27A" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

export function KasavuDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <div className="kasavu-line flex-1" />
      <Jasmine size={16} />
      <div className="kasavu-line flex-1" />
    </div>
  );
}

export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="40" cy="40" r="37" fill="none" stroke="rgb(var(--c-gold))" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="rgb(var(--c-gold) / 0.5)" strokeWidth="0.8" />
      <text x="40" y="49" textAnchor="middle" fontFamily="var(--font-serif), serif" fontSize="26" fill="rgb(var(--c-maroon))">
        K&amp;A
      </text>
    </svg>
  );
}
