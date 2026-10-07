import { memo, useEffect, useMemo, useRef } from 'react';

const PIONEERS = [
  'Ada Lovelace', 'Charles Babbage', 'George Boole', 'Alan Turing', 'Grace Hopper', 'John von Neumann',
  'Claude Shannon', 'Konrad Zuse', 'Tommy Flowers', 'Jean Bartik', 'Kathleen Booth', 'Katherine Johnson',
  'Dorothy Vaughan', 'Mary Jackson', 'Annie Easley', 'Hedy Lamarr', 'Margaret Hamilton', 'Frances Allen',
  'John McCarthy', 'Marvin Minsky', 'Fernando Corbato', 'Dennis Ritchie', 'Ken Thompson', 'Brian Kernighan',
  'Douglas McIlroy', 'Bill Joy', 'Linus Torvalds', 'Richard Stallman', 'Andrew Tanenbaum', 'Ian Murdock',
  'Patrick Volkerding', 'Theo de Raadt', 'Tim Berners-Lee', 'Vint Cerf', 'Bob Kahn', 'Jon Postel',
  'Radia Perlman', 'Van Jacobson', 'Sally Floyd', 'Paul Baran', 'Leonard Kleinrock', 'Donald Knuth',
  'Edsger Dijkstra', 'Tony Hoare', 'Barbara Liskov', 'Leslie Lamport', 'Niklaus Wirth', 'John Backus',
  'Bjarne Stroustrup', 'Guido van Rossum', 'James Gosling', 'Brendan Eich', 'Larry Wall', 'Rasmus Lerdorf',
  'Yukihiro Matsumoto', 'Anders Hejlsberg', 'Rob Pike', 'Robert Griesemer', 'Chris Lattner', 'Ryan Dahl',
  'Seymour Cray', 'Gordon Moore', 'Robert Noyce', 'Jack Kilby', 'Lynn Conway', 'Carver Mead',
  'Ivan Sutherland', 'Douglas Engelbart', 'Alan Kay', 'Adele Goldberg', 'Butler Lampson', 'Chuck Thacker',
  'Ted Codd', 'Jim Gray', 'Michael Stonebraker', 'Jeff Dean', 'Sanjay Ghemawat', 'Whitfield Diffie',
  'Martin Hellman', 'Ron Rivest', 'Adi Shamir', 'Leonard Adleman', 'Phil Zimmermann', 'Fabrice Bellard',
  'Daniel Stenberg', 'Igor Sysoev', 'Salvatore Sanfilippo', 'Solomon Hykes', 'Joe Beda', 'Brendan Burns',
  'Craig McLuckie', 'Mitchell Hashimoto', 'Geoffrey Hinton', 'Yann LeCun', 'Yoshua Bengio', 'Fei-Fei Li',
  'Evelyn Berezin', 'Sophie Wilson', 'Steve Furber', 'Eric Allman', 'Bram Moolenaar', 'Junio Hamano',
];

const COCO_BYTES = ['01100011', '01101111', '01100011', '01101111'];

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function handle(name, r) {
  const parts = name.replace(/-/g, ' ').split(' ');
  const roll = r();
  if (roll < 0.6) return parts.join('');
  if (roll < 0.85) return parts.join('').toLowerCase();
  return (parts[0][0] + parts[parts.length - 1]).toLowerCase();
}

function byte(r) {
  let s = '';
  for (let i = 0; i < 8; i++) s += r() < 0.5 ? '0' : '1';
  return s;
}

function buildWall() {
  const r = rng(1843);
  return Array.from({ length: 72 }, () => {
    const tokens = [];
    while (tokens.length < 26) {
      const roll = r();
      if (roll < 0.03) COCO_BYTES.forEach((b) => tokens.push({ text: b }));
      else if (roll < 0.3) tokens.push({ text: byte(r) });
      else tokens.push({ text: handle(PIONEERS[Math.floor(r() * PIONEERS.length)], r), name: true, strong: r() < 0.08 });
    }
    return { offset: Math.round(r() * 140), tokens };
  });
}

const Wall = memo(function Wall() {
  const lines = useMemo(buildWall, []);
  return lines.map((line, i) => (
    <div key={i} className="whitespace-nowrap" style={{ marginLeft: -line.offset }}>
      {line.tokens.map((t, j) =>
        t.name ? (
          <span key={j} data-n={t.text} className={t.strong ? 'font-semibold' : undefined}>
            {t.text}{' '}
          </span>
        ) : (
          <span key={j}>{t.text} </span>
        )
      )}
    </div>
  ));
});

function decode(el, color, timers) {
  const original = el.dataset.n;
  const SCRAMBLE = 300;
  const RESOLVE = 650;
  const HOLD = 1100;
  const start = performance.now();
  el.dataset.busy = '1';
  el.style.transition = 'none';
  el.style.color = color;

  const id = setInterval(() => {
    const t = performance.now() - start;
    if (t < SCRAMBLE + RESOLVE) {
      const resolved = t < SCRAMBLE ? 0 : Math.floor(((t - SCRAMBLE) / RESOLVE) * original.length);
      let s = original.slice(0, resolved);
      for (let i = resolved; i < original.length; i++) s += Math.random() < 0.5 ? '0' : '1';
      el.firstChild.nodeValue = s;
    } else if (t >= SCRAMBLE + RESOLVE + HOLD) {
      clearInterval(id);
      timers.delete(id);
      el.firstChild.nodeValue = original;
      el.style.transition = 'color 1.4s ease';
      el.style.color = '';
      delete el.dataset.busy;
    } else {
      el.firstChild.nodeValue = original;
    }
  }, 55);
  timers.add(id);
}

export default function TributeWall({ light = false }) {
  const rootRef = useRef(null);
  const wallRef = useRef(null);
  const lightRef = useRef(light);
  lightRef.current = light;

  useEffect(() => {
    const root = rootRef.current;
    const host = root.parentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let tx = 0, ty = 0, ta = 0;
    let x = 0, y = 0, a = 0;
    let raf = 0;

    const apply = () => {
      root.style.setProperty('--mx', `${x}px`);
      root.style.setProperty('--my', `${y}px`);
      root.style.setProperty('--sa', a.toFixed(3));
    };
    const tick = () => {
      const k = reduceMotion ? 1 : 0.2;
      x += (tx - x) * k;
      y += (ty - y) * k;
      a += (ta - a) * (reduceMotion ? 1 : 0.1);
      apply();
      raf = Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4 || Math.abs(ta - a) > 0.005 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (a < 0.02) {
        x = tx;
        y = ty;
      }
      ta = 1;
      kick();
    };
    const onLeave = () => {
      ta = 0;
      kick();
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);

    const timers = new Set();
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);

    const names = Array.from(wallRef.current.querySelectorAll('[data-n]'));
    const spark = () => {
      if (!visible || document.hidden || timers.size >= 4) return;
      const box = root.getBoundingClientRect();
      const limit = Math.min(box.bottom, window.innerHeight);
      for (let tries = 0; tries < 12; tries++) {
        const el = names[Math.floor(Math.random() * names.length)];
        if (el.dataset.busy) continue;
        const r = el.getBoundingClientRect();
        if (r.left < box.left + 8 || r.right > box.right - 8 || r.top < box.top + 8 || r.bottom > limit) continue;
        decode(el, lightRef.current ? '#8200d9' : '#c98bff', timers);
        return;
      }
    };
    const sparkTimer = reduceMotion ? 0 : setInterval(spark, 700);

    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      io.disconnect();
      clearInterval(sparkTimer);
      timers.forEach(clearInterval);
    };
  }, []);

  const base = light ? 'rgb(13 12 18 / 0.075)' : 'rgb(255 255 255 / 0.06)';
  const spot = light
    ? 'radial-gradient(260px circle at var(--mx) var(--my), rgb(110 0 190 / calc(var(--sa) * 0.6)), rgb(158 0 255 / calc(var(--sa) * 0.18)) 45%, transparent 75%)'
    : 'radial-gradient(260px circle at var(--mx) var(--my), rgb(255 255 255 / calc(var(--sa) * 0.6)), rgb(217 166 255 / calc(var(--sa) * 0.2)) 45%, transparent 75%)';

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden"
      style={{ '--mx': '50%', '--my': '30%', '--sa': 0 }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07060b_0%,#0a0911_45%,#120b1f_80%,#1a0f2c_100%)]" />
      <div
        className={`absolute inset-0 bg-[linear-gradient(180deg,#f6f2fd_0%,#faf8fe_50%,#ffffff_100%)] transition-opacity duration-700 ${light ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute -top-48 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-coco-purple/[0.12] blur-[120px]" />
      <div className={`absolute bottom-[-180px] left-[10%] h-[420px] w-[620px] rounded-full blur-[140px] ${light ? 'bg-coco-purple/10' : 'bg-coco-purple/20'}`} />
      <div className={`absolute bottom-[-200px] right-[5%] h-[380px] w-[560px] rounded-full blur-[140px] ${light ? 'bg-[#5a1aa8]/10' : 'bg-[#5a1aa8]/25'}`} />

      <div
        className="pointer-events-none absolute left-0 top-0 h-[560px] w-[560px]"
        style={{
          transform: 'translate3d(calc(var(--mx) - 50%), calc(var(--my) - 50%), 0)',
          opacity: 'var(--sa)',
          background: `radial-gradient(closest-side, ${light ? 'rgb(158 0 255 / 0.10)' : 'rgb(158 0 255 / 0.16)'}, transparent)`,
        }}
      />

      <div
        ref={wallRef}
        className="absolute inset-0 select-none overflow-hidden px-2 pt-2 font-mono text-[12px] leading-[22px] tracking-[0.01em]"
        style={{
          color: 'transparent',
          backgroundImage: `${spot}, linear-gradient(${base}, ${base})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 55%, transparent 92%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 55%, transparent 92%)',
        }}
      >
        <Wall />
      </div>

      <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />
    </div>
  );
}
