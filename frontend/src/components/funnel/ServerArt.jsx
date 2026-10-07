import { useId } from 'react';

export default function ServerArt({ u = 1, className = '' }) {
  const id = useId();
  const unit = 30;
  const W = 320;
  const H = unit * u;
  const bays = u === 1 ? 10 : 12;
  const rows = u === 1 ? 1 : Math.min(u, 3);
  const bayArea = { x: 96, y: 5, w: 196, h: H - 10 };
  const bayW = bayArea.w / bays;
  const bayH = bayArea.h / rows;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${u}U rack server`}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3842" />
          <stop offset="1" stopColor="#1b1a20" />
        </linearGradient>
        <pattern id={`${id}-vent`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.1" fill="#0c0b10" />
        </pattern>
      </defs>
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="4" fill={`url(#${id}-body)`} stroke="#4a4852" />
      <rect x="4" y="3" width="10" height={H - 6} rx="2" fill="#2a2830" stroke="#55535e" strokeWidth="0.6" />
      <rect x={W - 14} y="3" width="10" height={H - 6} rx="2" fill="#2a2830" stroke="#55535e" strokeWidth="0.6" />
      <rect x="20" y="5" width="70" height={H - 10} rx="2" fill={`url(#${id}-vent)`} opacity="0.9" />
      <circle cx="28" cy={H / 2} r="2.4" fill="#34d399">
        <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="36" cy={H / 2} r="2" fill="#b54dff" />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: bays }).map((__, b) => (
          <g key={`${r}-${b}`}>
            <rect
              x={bayArea.x + b * bayW + 1}
              y={bayArea.y + r * bayH + 1}
              width={bayW - 2}
              height={bayH - 2}
              rx="1.5"
              fill="#24222a"
              stroke="#4d4b56"
              strokeWidth="0.6"
            />
            <rect x={bayArea.x + b * bayW + bayW / 2 - 1} y={bayArea.y + r * bayH + 4} width="2" height="2" rx="1" fill={(b + r) % 3 ? '#34d399' : '#5b5966'} />
          </g>
        )),
      )}
      <text x={W - 20} y={H - 7} textAnchor="end" fontSize="8" fontWeight="700" fill="#8a8794" fontFamily="var(--font-sans)">
        {u}U
      </text>
    </svg>
  );
}
