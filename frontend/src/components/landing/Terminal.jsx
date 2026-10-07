import { useCallback, useEffect, useRef, useState } from 'react';
import { CornerDownLeft } from 'lucide-react';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COMMANDS = {
  help: () => [
    { k: 'dim', t: 'Available commands:' },
    { k: 'out', t: '  coco up [--gpu l40s]       build and deploy this directory' },
    { k: 'out', t: '  coco scale api --replicas N  scale a service across regions' },
    { k: 'out', t: '  coco logs api              stream recent logs' },
    { k: 'out', t: '  coco status                show services and usage' },
    { k: 'out', t: '  clear                      clear the screen' },
  ],
  'coco up': (args) => {
    const gpu = args.includes('--gpu');
    return [
      { k: 'out', t: '› Detected Python 3.12 · uv · FastAPI', d: 380 },
      { k: 'out', t: '› Building image… restored 14 of 16 cached layers', d: 700 },
      { k: 'out', t: '› Image built in 18.4s (412 MB)', d: 520 },
      gpu
        ? { k: 'accent', t: '› Placing on mia-1 · 1× NVIDIA L40S · 16 vCPU / 64 GB', d: 600 }
        : { k: 'accent', t: '› Placing on dfw-2 · 4 vCPU / 8 GB', d: 600 },
      { k: 'out', t: '› Health check passed · 200 OK in 38ms', d: 520 },
      { k: 'ok', t: `✓ Live at https://${gpu ? 'inference' : 'api'}.acme.coco.app`, d: 300 },
    ];
  },
  'coco scale': (args) => {
    const m = args.match(/--replicas\s+(\d+)/);
    const n = Math.min(Math.max(parseInt(m?.[1] ?? '6', 10) || 1, 1), 32);
    return [
      { k: 'out', t: `› Scaling api 2 → ${n} replicas`, d: 400 },
      { k: 'out', t: `› Spreading across dallas, miami${n > 4 ? ', ashburn' : ''}`, d: 600 },
      { k: 'out', t: '› Load balancer updated · zero-downtime', d: 500 },
      { k: 'ok', t: `✓ ${n}/${n} replicas healthy`, d: 300 },
    ];
  },
  'coco logs': () => [
    { k: 'dim', t: 'Streaming logs for api (ctrl+c to stop)', d: 200 },
    { k: 'out', t: '12:04:18  INFO  POST /v1/infer 200 84ms', d: 240 },
    { k: 'out', t: '12:04:18  INFO  GET  /v1/models 200 12ms', d: 240 },
    { k: 'warn', t: '12:04:19  WARN  rate limit hit for key sk_…9f2', d: 240 },
    { k: 'out', t: '12:04:19  INFO  POST /v1/jobs 201 31ms', d: 240 },
    { k: 'out', t: '12:04:20  INFO  GET  /healthz 200 2ms', d: 240 },
  ],
  'coco status': () => [
    { k: 'dim', t: 'SERVICE      STATUS    REGION    CPU    MEM', d: 150 },
    { k: 'out', t: 'api          ● live    dfw-2     41%    2.1 GB', d: 120 },
    { k: 'out', t: 'inference    ● live    mia-1     74%    38 GB', d: 120 },
    { k: 'out', t: 'postgres     ● live    dfw-2     18%    6.4 GB', d: 120 },
    { k: 'accent', t: 'Usage this cycle: $42.18 · metered per second', d: 200 },
  ],
};

function resolve(input) {
  const cmd = input.trim().replace(/\s+/g, ' ');
  if (!cmd) return [];
  if (cmd === 'help' || cmd === 'coco --help' || cmd === 'coco') return COMMANDS.help();
  const key = Object.keys(COMMANDS).find((k) => k !== 'help' && (cmd === k || cmd.startsWith(`${k} `)));
  if (key) return COMMANDS[key](cmd.slice(key.length));
  return [{ k: 'err', t: `command not found: ${cmd.split(' ')[0] === 'coco' ? cmd : cmd.split(' ')[0]}. Try "help".` }];
}

const TONE = {
  out: 'text-white/65',
  dim: 'text-white/35',
  ok: 'text-emerald-300',
  err: 'text-rose-300',
  warn: 'text-amber-300',
  accent: 'text-coco-lilac',
  cmd: 'text-white',
};

const CHIPS = ['coco up --gpu l40s', 'coco scale api --replicas 6', 'coco logs api', 'coco status'];

export default function Terminal({ autoplay = 'coco up --gpu l40s', compact = false }) {
  const [lines, setLines] = useState([{ k: 'dim', t: 'CoCo CLI v2.4.0 · type "help" or tap a command below' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(-1);
  const runId = useRef(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  const execute = useCallback(async (cmd, { typed = false } = {}) => {
    const id = ++runId.current;
    setBusy(true);
    if (typed) {
      for (let i = 1; i <= cmd.length; i++) {
        if (runId.current !== id) return;
        setTyping(cmd.slice(0, i));
        await sleep(34 + Math.random() * 40);
      }
      await sleep(220);
      setTyping('');
    }
    if (runId.current !== id) return;
    if (cmd.trim() === 'clear') {
      setLines([]);
      setBusy(false);
      return;
    }
    setLines((l) => [...l, { k: 'cmd', t: cmd }]);
    setHistory((h) => [cmd, ...h].slice(0, 20));
    for (const line of resolve(cmd)) {
      await sleep(line.d ?? 60);
      if (runId.current !== id) return;
      setLines((l) => [...l, line]);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => execute(autoplay, { typed: true }), 500);
    return () => {
      clearTimeout(t);
      runId.current++;
    };
  }, [autoplay, execute]);

  const submit = (e) => {
    e.preventDefault();
    if (busy || !input.trim()) return;
    const cmd = input;
    setInput('');
    setHIndex(-1);
    execute(cmd);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      setHIndex(i);
      setInput(history[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(Math.max(i, -1));
      setInput(i < 0 ? '' : history[i]);
    } else if (e.key === 'c' && e.ctrlKey && busy) {
      runId.current++;
      setTyping('');
      setLines((l) => [...l, { k: 'dim', t: '^C' }]);
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        className="screen relative flex-1 min-h-0 cursor-text overflow-hidden rounded-xl border border-white/[0.08] bg-[#09080d] shadow-inner"
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 text-[11px] text-white/35">
          <span className="font-mono">~/acme/inference</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${busy ? 'bg-amber-300 animate-pulse' : 'bg-emerald-400'}`} />
            {busy ? 'running' : 'ready'}
          </span>
        </div>
        <div ref={scrollRef} className={`overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.7] [font-variant-ligatures:none] ${compact ? 'h-[200px]' : 'h-[calc(100%-33px)]'}`}>
          {lines.map((l, i) => (
            <div key={i} className={`whitespace-pre-wrap break-words ${TONE[l.k]}`}>
              {l.k === 'cmd' && <span className="text-coco-violet">❯ </span>}
              {l.t}
            </div>
          ))}
          <form onSubmit={submit} className="flex items-center text-white">
            <span className="text-coco-violet">❯&nbsp;</span>
            {typing ? (
              <span>{typing}</span>
            ) : (
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={busy}
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
                className="flex-1 bg-transparent outline-none caret-coco-violet placeholder:text-white/20 disabled:opacity-0"
                placeholder={busy ? '' : 'type a command…'}
              />
            )}
            {(typing || busy) && <span className="ml-0.5 inline-block h-4 w-[7px] bg-coco-violet/90 animate-pulse" />}
          </form>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            disabled={busy}
            onClick={() => execute(c, { typed: true })}
            className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono [font-variant-ligatures:none] text-[11.5px] text-white/65 transition hover:border-coco-violet/50 hover:bg-coco-purple/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
          >
            {c}
            <CornerDownLeft size={11} className="opacity-40 group-hover:opacity-80" />
          </button>
        ))}
      </div>
    </div>
  );
}
