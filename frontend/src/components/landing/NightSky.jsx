function Cloud({ className = '', style, tone = 'a', day = false }) {
  const palette = day
    ? { top: tone === 'a' ? '#b54dff' : '#c27aff', mid: tone === 'a' ? '#d4a3ff' : '#dfbaff', fade: '#efe0ff', rim: '#9e00ff' }
    : { top: tone === 'a' ? '#3a2f52' : '#2a2340', mid: tone === 'a' ? '#251e38' : '#1c172b', fade: '#120f1c', rim: '#d9a6ff' };
  const { top, mid } = palette;
  const id = `cloud-${day ? 'day' : 'night'}-${tone}`;
  return (
    <svg viewBox="0 0 520 160" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={palette.fade} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.rim} stopOpacity="0.35" />
          <stop offset="0.25" stopColor={palette.rim} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M20 140 C 10 110, 50 92, 82 100 C 90 66, 140 52, 172 74 C 190 34, 260 22, 292 62 C 318 40, 372 44, 384 82 C 420 70, 470 86, 470 112 C 500 114, 512 132, 500 146 Z"
        fill={`url(#${id})`}
      />
      <path
        d="M20 140 C 10 110, 50 92, 82 100 C 90 66, 140 52, 172 74 C 190 34, 260 22, 292 62 C 318 40, 372 44, 384 82 C 420 70, 470 86, 470 112 C 500 114, 512 132, 500 146 Z"
        fill={`url(#${id}-rim)`}
      />
    </svg>
  );
}

export default function NightSky({ light = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07060c_0%,#0d0b17_38%,#160f26_70%,#1d1132_100%)]" />
      <div className={`absolute inset-0 bg-[#ffffff] transition-opacity duration-700 ${light ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-coco-purple/[0.10] blur-[120px] transition-opacity duration-700 ${light ? 'opacity-0' : ''}`} />
      <div className={`absolute bottom-[-180px] left-[10%] h-[420px] w-[620px] rounded-full bg-coco-purple/25 blur-[140px] transition-opacity duration-700 ${light ? 'opacity-0' : ''}`} />
      <div className={`absolute bottom-[-200px] right-[5%] h-[380px] w-[560px] rounded-full bg-[#5a1aa8]/30 blur-[140px] transition-opacity duration-700 ${light ? 'opacity-0' : ''}`} />

      <div
        className={`absolute right-[12%] top-[14%] h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff,#d8d4e6_45%,#a49fb8_100%)] shadow-[0_0_80px_20px_rgba(217,166,255,0.18)] transition-all duration-700 ${
          light ? 'scale-50 opacity-0' : 'opacity-80'
        }`}
      />
      <div
        className={`absolute right-[11%] top-[12%] h-20 w-20 rounded-full bg-[radial-gradient(circle_at_40%_40%,#e7c6ff,#b54dff_45%,#7a00cc_100%)] shadow-[0_0_90px_30px_rgba(158,0,255,0.35)] transition-all duration-700 ${
          light ? 'opacity-100' : 'scale-50 opacity-0'
        }`}
      />

      <div className="absolute inset-x-0 top-[8%] h-40">
        <Cloud day={light} className="absolute w-[520px] opacity-50 animate-drift-slow" style={{ left: '-30%', animationDelay: '-40s' }} tone="b" />
      </div>
      <div className="absolute inset-x-0 top-[30%] h-40">
        <Cloud day={light} className="absolute w-[640px] opacity-70 animate-drift" style={{ left: '-40%', animationDelay: '-18s' }} />
      </div>
      <div className="absolute inset-x-0 top-[44%] h-40">
        <Cloud day={light} className="absolute w-[460px] opacity-60 animate-drift-slow" style={{ left: '-30%', animationDelay: '-80s' }} tone="b" />
      </div>

      <Cloud day={light} className="absolute -left-24 bottom-[18%] w-[620px] opacity-90" />
      <Cloud day={light} className="absolute -right-32 bottom-[24%] w-[700px] opacity-80 -scale-x-100" tone="b" />
      <Cloud day={light} className="absolute left-[30%] bottom-[8%] w-[760px] opacity-60" tone="b" />

      <div
        className={`absolute inset-x-0 bottom-0 h-[38%] ${light ? 'opacity-[0.22]' : 'opacity-[0.35]'}`}
        style={{
          backgroundImage:
            'linear-gradient(rgba(181,77,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(181,77,255,0.35) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(62deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(to top, black, transparent 85%)',
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
    </div>
  );
}
