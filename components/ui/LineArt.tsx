/** Hand-drawn line illustrations for the dark brand section (stroke-drawn on scroll). */

export function Barley({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 260" className={`line-art ${className}`} aria-hidden>
      <path d="M60 255 C 58 190, 62 120, 60 30" />
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 40 + i * 22;
        return (
          <g key={i}>
            <path d={`M60 ${y + 14} C 44 ${y + 8}, 38 ${y - 6}, 42 ${y - 16} C 54 ${y - 12}, 60 ${y}, 60 ${y + 14}`} />
            <path d={`M60 ${y + 14} C 76 ${y + 8}, 82 ${y - 6}, 78 ${y - 16} C 66 ${y - 12}, 60 ${y}, 60 ${y + 14}`} />
            <line x1="42" y1={y - 16} x2="30" y2={y - 34} />
            <line x1="78" y1={y - 16} x2="90" y2={y - 34} />
          </g>
        );
      })}
      <path d="M60 30 C 56 18, 58 8, 60 2" />
    </svg>
  );
}

export function GlassIce({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={`line-art ${className}`} aria-hidden>
      <path d="M20 20 L 32 186 Q 34 194 42 194 L 118 194 Q 126 194 128 186 L 140 20" />
      <ellipse cx="80" cy="20" rx="60" ry="8" />
      <path d="M24 70 Q 80 80 136 70" />
      <path d="M44 84 l 24 -6 l 8 22 l -24 6 z" />
      <path d="M84 92 l 22 4 l -4 22 l -22 -4 z" />
      <path d="M58 116 l 20 -10 l 10 20 l -20 10 z" />
      <circle cx="70" cy="150" r="2.5" />
      <circle cx="96" cy="140" r="2" />
      <circle cx="88" cy="166" r="3" />
      <circle cx="60" cy="172" r="1.8" />
    </svg>
  );
}

export function CrownCap({ className = '' }: { className?: string }) {
  const teeth = Array.from({ length: 21 }).map((_, i) => {
    const a = (i / 21) * Math.PI * 2;
    const a2 = ((i + 0.5) / 21) * Math.PI * 2;
    return `${i ? 'L' : 'M'} ${(70 + Math.cos(a) * 62).toFixed(1)} ${(70 + Math.sin(a) * 62).toFixed(1)} L ${(70 + Math.cos(a2) * 54).toFixed(1)} ${(70 + Math.sin(a2) * 54).toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 140 140" className={`line-art ${className}`} aria-hidden>
      <path d={teeth.join(' ') + ' Z'} />
      <circle cx="70" cy="70" r="40" />
      <circle cx="70" cy="70" r="34" />
    </svg>
  );
}

export function Droplets({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 160" className={`line-art ${className}`} aria-hidden>
      <path d="M50 20 C 50 20, 20 62, 20 84 A 30 30 0 0 0 80 84 C 80 62, 50 20, 50 20 Z" />
      <path d="M34 86 A 16 16 0 0 0 46 102" />
      <path d="M106 80 C 106 80, 90 102, 90 114 A 16 16 0 0 0 122 114 C 122 102, 106 80, 106 80 Z" />
    </svg>
  );
}

export function Sunburst({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`line-art ${className}`} aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r0 = i % 2 ? 34 : 26;
        const r1 = i % 2 ? 70 : 92;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * r0}
            y1={100 + Math.sin(a) * r0}
            x2={100 + Math.cos(a) * r1}
            y2={100 + Math.sin(a) * r1}
          />
        );
      })}
      <circle cx="100" cy="100" r="16" />
    </svg>
  );
}
