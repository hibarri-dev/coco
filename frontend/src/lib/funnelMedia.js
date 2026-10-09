import { useEffect, useState } from 'react';
import { API_URL, BROADCAST } from '../config/funnel';

/* Loads the active videos from Superadmin > Coco > Videos into BROADCAST.
   Until the request returns (or if it fails), the VITE_BROADCAST_* env values stay in place. */

let status = 'idle';
const listeners = new Set();

export function loadFunnelMedia() {
  if (status !== 'idle') return;
  if (!API_URL) {
    status = 'done';
    return;
  }
  status = 'loading';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  fetch(`${API_URL}/coco/public/funnel`, { credentials: 'omit', signal: controller.signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const video = data?.broadcast?.video;
      const preview = data?.broadcast?.preview;
      if (video?.url) {
        BROADCAST.videoUrl = video.url;
        BROADCAST.videoId = video.id;
        if (video.posterUrl) BROADCAST.posterUrl = video.posterUrl;
        if (video.durationSec) BROADCAST.durationSec = video.durationSec;
      }
      if (preview?.url) BROADCAST.previewUrl = preview.url;
    })
    .catch(() => {})
    .finally(() => {
      clearTimeout(timeoutId);
      status = 'done';
      listeners.forEach((fn) => fn());
      listeners.clear();
    });
}

/* Re-renders the caller once the admin-managed videos have loaded. */
export function useFunnelMedia() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    if (status === 'done') return undefined;
    const fn = () => setVersion((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
}
