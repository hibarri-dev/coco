import { useEffect } from 'react';
import { flush, track } from '../lib/analytics';

const REPORT_EVERY_MS = 15_000;

/*
 * Reports seconds actually watched, not the playback position: the broadcast player
 * starts viewers mid-stream at the live edge, so position alone would overstate watch time.
 */
export function useVideoTracking(videoRef, { videoId, slot = 'broadcast-main' }) {
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoId) return undefined;

    let last = v.currentTime;
    let pending = 0;
    let lastSent = Date.now();

    const send = (type = 'video_progress') => {
      const sec = Math.floor(pending);
      if (type === 'video_progress' && sec <= 0) return;
      pending -= sec;
      lastSent = Date.now();
      track(type, {
        video: videoId,
        slot,
        sec,
        position: Math.round(v.currentTime || 0),
        duration: Number.isFinite(v.duration) ? Math.round(v.duration) : 0,
      });
    };

    const onTime = () => {
      const t = v.currentTime;
      const delta = t - last;
      last = t;
      // Seeks show up as large jumps; only normal playback counts.
      if (!v.paused && delta > 0 && delta < 2) pending += delta;
      if (Date.now() - lastSent >= REPORT_EVERY_MS) send();
    };
    const onSeek = () => {
      last = v.currentTime;
    };
    const onPause = () => send();
    const onEnded = () => {
      send('video_complete');
      flush();
    };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('seeking', onSeek);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('seeking', onSeek);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      send();
    };
  }, [videoRef, videoId, slot]);
}
