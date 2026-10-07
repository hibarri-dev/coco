import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Eye, SendHorizontal } from 'lucide-react';
import { CHAT_SCRIPT } from '../../data/chat';
import { chatTimeline } from '../../lib/chat';
import { useNow } from '../../lib/broadcast';
import { submitLead } from '../../lib/leads';

const HISTORY = 40;
const COOLDOWN_MS = 3000;
const PALETTE = ['#c084fc', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#a78bfa', '#2dd4bf', '#f87171'];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const AUTHORS = [...new Set(CHAT_SCRIPT.map(([a]) => a))].sort((a, b) => b.length - a.length);
const MENTION = new RegExp(`(@(?:${AUTHORS.map(escape).join('|')}))`, 'gi');

function colorFor(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const initials = (name) =>
  name
    .replace(/[^A-Za-z ]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || name.slice(0, 1);

function readOwn(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function Message({ m }) {
  const color = m.own ? '#9e00ff' : colorFor(m.author);
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex gap-2.5 px-4 py-1.5">
      <span className="on-accent mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10.5px] font-bold text-white" style={{ background: color }}>
        {initials(m.author)}
      </span>
      <p className="min-w-0 break-words text-[13.5px] leading-snug">
        <span className="mr-1.5 font-semibold" style={m.own ? undefined : { color }}>
          {m.author}
          {m.own && <span className="ml-1.5 rounded bg-coco-purple/15 px-1 py-px text-[10px] font-semibold text-coco-violet">You</span>}
        </span>
        {m.text.split(MENTION).map((part, i) =>
          i % 2 ? (
            <span key={i} className="font-semibold text-coco-violet">{part}</span>
          ) : (
            <span key={i} className="text-[var(--ink)]/85">{part}</span>
          ),
        )}
      </p>
    </motion.li>
  );
}

export default function BroadcastChat({ session, duration, viewers, lead }) {
  const now = useNow(1000);
  const elapsed = (now - session.start) / 1000;
  const storageKey = `coco-chat-${session.id}`;
  const timeline = useMemo(() => chatTimeline(session.id, duration), [session.id, duration]);
  const [own, setOwn] = useState(() => readOwn(storageKey));
  const [draft, setDraft] = useState('');
  const [coolingDown, setCoolingDown] = useState(false);
  const [unread, setUnread] = useState(false);
  const listRef = useRef(null);
  const stick = useRef(true);

  const messages = useMemo(() => {
    const scripted = timeline.filter((m) => m.at <= elapsed).slice(-HISTORY);
    return [...scripted, ...own].sort((a, b) => a.at - b.at);
  }, [timeline, elapsed, own]);
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (stick.current) el.scrollTop = el.scrollHeight;
    else setUnread(true);
  }, [lastId]);

  const onScroll = () => {
    const el = listRef.current;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (stick.current) setUnread(false);
  };

  const jumpToLatest = () => {
    const el = listRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    stick.current = true;
    setUnread(false);
  };

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || coolingDown) return;
    const message = { id: `u${Date.now()}`, at: elapsed, author: lead?.name?.trim() || 'Guest', text, own: true };
    const next = [...own, message].slice(-HISTORY);
    setOwn(next);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    stick.current = true;
    setDraft('');
    setCoolingDown(true);
    setTimeout(() => setCoolingDown(false), COOLDOWN_MS);
    submitLead('broadcast-comment', {
      name: lead?.name ?? null,
      email: lead?.email ?? null,
      comment: text,
      broadcast: session.id,
      atSecond: Math.round(elapsed),
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <span className="text-[14px] font-semibold">Chat</span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--muted)]">
          <Eye size={14} />
          <span className="tabular font-semibold text-[var(--ink)]">{viewers.toLocaleString('en-US')}</span> watching
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <ul ref={listRef} onScroll={onScroll} role="log" aria-live="off" aria-label="Chat messages" className="no-scrollbar absolute inset-0 overflow-y-auto py-2">
          {messages.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-[var(--faint)]">Say hello while the broadcast starts.</li>}
          {messages.map((m) => (
            <Message key={m.id} m={m} />
          ))}
        </ul>
        {unread && (
          <button
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-coco-purple px-3 py-1.5 text-[12px] font-semibold text-white shadow-lg"
          >
            <ArrowDown size={13} /> New messages
          </button>
        )}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-[var(--line)] p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={200}
          placeholder={coolingDown ? 'Slow mode is on…' : 'Say something…'}
          aria-label="Write a comment"
          className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-[var(--faint)] focus:border-coco-purple"
        />
        <button
          type="submit"
          disabled={!draft.trim() || coolingDown}
          aria-label="Send comment"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coco-purple text-white transition hover:bg-[#ad1fff] disabled:opacity-40"
        >
          <SendHorizontal size={16} />
        </button>
      </form>
    </div>
  );
}
