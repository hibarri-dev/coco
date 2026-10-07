import { useEffect, useState } from 'react';
import { AUDIENCE_RANGE, CHAT_GAP_SEC, CHAT_SCRIPT } from '../data/chat';

function seededRandom(seed) {
  let a = 0;
  for (const ch of String(seed)) a = (Math.imul(31, a) + ch.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function chatTimeline(seed, durationSec) {
  const random = seededRandom(`${seed}-chat`);
  const [minGap, maxGap] = CHAT_GAP_SEC;
  const items = [];
  let at = 3 + random() * 4;
  for (let i = 0; at < durationSec; i++) {
    const [author, text] = CHAT_SCRIPT[i % CHAT_SCRIPT.length];
    items.push({ id: `s${i}`, at, author, text });
    at += minGap + random() * (maxGap - minGap);
  }
  return items;
}

export function useAudience(seed) {
  const [min, max] = AUDIENCE_RANGE;
  const [count, setCount] = useState(() => Math.round(min + (max - min) * (0.3 + seededRandom(`${seed}-audience`)() * 0.4)));

  useEffect(() => {
    let timer;
    const step = () => {
      setCount((c) => {
        const next = c + Math.round((Math.random() - 0.45) * 38);
        if (next > max) return max - (next - max);
        if (next < min) return min + (min - next);
        return next;
      });
      timer = setTimeout(step, 2500 + Math.random() * 3500);
    };
    timer = setTimeout(step, 2500);
    return () => clearTimeout(timer);
  }, [min, max]);

  return count;
}
