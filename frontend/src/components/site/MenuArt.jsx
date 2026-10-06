/** Line illustrations for the large cards in the navbar dropdowns. */

export function PlatformArt() {
  return (
    <svg viewBox="0 0 300 170" className="w-full h-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b54dff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#b54dff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#9e00ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1">
        <path d="M150 150 L40 95 L150 40 L260 95 Z" />
        <path d="M150 132 L76 95 L150 58 L224 95 Z" strokeOpacity="0.1" />
      </g>
      {[
        [96, 86],
        [150, 60],
        [204, 86],
        [150, 112],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 -10 L18 -1 L0 8 L-18 -1 Z" fill="#17161f" stroke="#ffffff" strokeOpacity="0.35" />
          <path d="M-18 -1 V10 L0 19 V8 Z" fill="#0f0e15" stroke="#ffffff" strokeOpacity="0.25" />
          <path d="M18 -1 V10 L0 19 V8 Z" fill="#121118" stroke="#ffffff" strokeOpacity="0.25" />
          <circle cx="-9" cy="7" r="1.3" fill={i === 1 ? '#b54dff' : '#ffffff'} fillOpacity={i === 1 ? 1 : 0.5} />
        </g>
      ))}
      <rect x="149" y="0" width="2" height="58" fill="url(#beam)">
        <animate attributeName="y" values="-40;20;-40" dur="3.2s" repeatCount="indefinite" />
      </rect>
      <rect x="203" y="20" width="2" height="62" fill="url(#beam)">
        <animate attributeName="y" values="0;40;0" dur="4.1s" repeatCount="indefinite" />
      </rect>
      <rect x="95" y="30" width="2" height="54" fill="url(#beam)">
        <animate attributeName="y" values="10;46;10" dur="3.7s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

export function DocsArt() {
  return (
    <div className="w-full h-full flex items-end">
      <div className="w-full rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[10.5px] leading-5 text-white/55">
        <div className="flex gap-1.5 mb-2">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        <div><span className="text-coco-violet">$</span> npm i -g @coco/cli</div>
        <div><span className="text-coco-violet">$</span> coco login</div>
        <div><span className="text-coco-violet">$</span> coco up --gpu l40s</div>
        <div className="text-emerald-300/80">✓ live at api.acme.coco.app</div>
      </div>
    </div>
  );
}

export function EnterpriseArt() {
  return (
    <svg viewBox="0 0 300 170" className="w-full h-full" fill="none" aria-hidden="true">
      <g stroke="#ffffff" strokeOpacity="0.12">
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={`h${i}`} d={`M0 ${30 + i * 22} H300`} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={`v${i}`} d={`M${i * 28} 20 V170`} />
        ))}
      </g>
      <path d="M20 140 C 80 140, 90 70, 150 70 S 230 40, 290 30" stroke="#9e00ff" strokeWidth="2" />
      <path d="M20 140 C 80 140, 90 70, 150 70 S 230 40, 290 30" stroke="#b54dff" strokeWidth="6" strokeOpacity="0.15" />
      {[
        [60, 126],
        [150, 70],
        [244, 38],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="#9e00ff" fillOpacity="0.2" />
          <circle cx={x} cy={y} r="4" fill="#d9a6ff" />
        </g>
      ))}
      <g transform="translate(222 92)">
        <path d="M18 0 L34 6 V20 C34 30 27 37 18 40 C9 37 2 30 2 20 V6 Z" fill="#17161f" stroke="#ffffff" strokeOpacity="0.4" />
        <path d="M11 20 L16 25 L26 14" stroke="#d9a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
