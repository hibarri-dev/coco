import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Maximize, Pause, Play, RotateCcw, Volume2, VolumeX, Radio, Clapperboard, Eye } from 'lucide-react';
import Countdown from './Countdown';
import BroadcastChat from './BroadcastChat';
import { BROADCAST } from '../../config/funnel';
import { calendarFile, dayLabel, formatClock, getRegistration, getSchedule, markCompleted, timeZoneLabel, useNow } from '../../lib/broadcast';
import { useAudience } from '../../lib/chat';
import { useFunnelMedia } from '../../lib/funnelMedia';
import { useVideoTracking } from '../../hooks/useVideoTracking';

const fmt = (s) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

function Frame({ children }) {
  return (
    <div className="screen relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07060b] text-white shadow-[0_40px_120px_-40px_rgba(158,0,255,0.6)]">
      {children}
    </div>
  );
}

function saveJoined(session) {
  try {
    const reg = getRegistration() || {};
    localStorage.setItem('coco-broadcast', JSON.stringify({ ...reg, joinedSession: { id: session.id, start: session.start.toISOString() } }));
  } catch {
    /* storage unavailable */
  }
}

function WaitingRoom({ schedule, name, now }) {
  const downloadIcs = () => {
    const blob = new Blob([calendarFile(schedule.start, `${window.location.origin}/live/room`)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'coco-broadcast.ics' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Frame>
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(158,0,255,0.35),transparent_60%)]" />
      <div className="absolute inset-0 bg-grain opacity-[0.08] mix-blend-overlay" />
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80">
          {name ? `You're in, ${name.split(' ')[0]}` : 'Your seat is reserved'}
        </span>
        <h3 className="mt-3 text-[18px] font-bold sm:text-2xl">
          Starts {dayLabel(schedule.start, now).toLowerCase()} at {formatClock(schedule.start)} {timeZoneLabel(schedule.start)}
        </h3>
        <div className="mt-4 sm:mt-6">
          <Countdown ms={schedule.start - now} size={typeof window !== 'undefined' && window.innerWidth < 640 ? 'sm' : 'lg'} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
          <button onClick={downloadIcs} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-black hover:bg-white/90">
            <CalendarPlus size={15} /> Add to calendar
          </button>
          <span className="text-[12px] text-white/55">Keep this page open. The broadcast starts automatically.</span>
        </div>
      </div>
    </Frame>
  );
}

function EndScreen({ onRecap }) {
  return (
    <Frame>
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(158,0,255,0.35),transparent_60%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <Clapperboard size={30} className="text-coco-lilac" />
        <h3 className="mt-3 text-xl font-bold sm:text-2xl">This broadcast has ended</h3>
        <p className="mt-1.5 max-w-md text-[13.5px] text-white/60">Thanks for joining. You can watch the full recording any time.</p>
        <button onClick={onRecap} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-coco-purple px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#ad1fff]">
          <Play size={16} fill="currentColor" /> Watch the recap
        </button>
      </div>
    </Frame>
  );
}

function Recap() {
  const videoRef = useRef(null);
  useVideoTracking(videoRef, { videoId: BROADCAST.videoId });
  if (!BROADCAST.videoUrl) {
    return (
      <Frame>
        <div className="grid h-full place-items-center px-6 text-center text-[14px] text-white/60">The recording will appear here once the broadcast video is connected.</div>
      </Frame>
    );
  }
  return (
    <Frame>
      <video ref={videoRef} src={BROADCAST.videoUrl} poster={BROADCAST.posterUrl || undefined} controls autoPlay playsInline className="h-full w-full bg-black" />
    </Frame>
  );
}

function Viewers({ count }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[11.5px] font-semibold text-white backdrop-blur">
      <Eye size={13} />
      <span className="tabular">{count.toLocaleString('en-US')}</span>
    </span>
  );
}

function Broadcast({ session, duration, viewers, lead, onDuration, onEnded }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const now = useNow(1000);
  const edge = Math.min(duration, (now - session.start) / 1000);
  const hasVideo = Boolean(BROADCAST.videoUrl);
  useVideoTracking(videoRef, { videoId: BROADCAST.videoId });

  const liveEdge = useCallback(() => Math.min(duration, (Date.now() - session.start.getTime()) / 1000), [duration, session]);

  const clamp = useCallback(() => {
    const v = videoRef.current;
    if (v && v.currentTime > liveEdge() + 1.5) v.currentTime = liveEdge();
  }, [liveEdge]);

  const synced = useRef(false);
  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    // iOS Safari only loads metadata after play(), so the live-edge seek has to wait for it.
    if (!synced.current) {
      synced.current = true;
      const seek = () => {
        v.currentTime = liveEdge();
      };
      if (v.readyState >= 1) seek();
      else v.addEventListener('loadedmetadata', seek, { once: true });
    }
    v.play().catch(() => setPlaying(false));
  }, [liveEdge]);

  const autoplayed = useRef(false);
  useEffect(() => {
    if (autoplayed.current || !videoRef.current) return;
    autoplayed.current = true;
    play();
  }, [play]);

  useEffect(() => {
    if (!hasVideo && edge >= duration) onEnded();
  }, [hasVideo, edge, duration, onEnded]);

  const seekTo = (t) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(t, liveEdge()));
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) play();
    else v.pause();
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    // iPhone Safari has no element fullscreen; only the video itself can go fullscreen.
    const native = () => videoRef.current?.webkitEnterFullscreen?.();
    if (el?.requestFullscreen) el.requestFullscreen().catch(native);
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else native();
  };

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekTo((videoRef.current?.currentTime ?? 0) - 10);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekTo((videoRef.current?.currentTime ?? 0) + 10);
    }
  };

  const position = hasVideo ? current : edge;
  const behind = hasVideo && edge - current > 6;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div ref={wrapRef} tabIndex={0} onKeyDown={onKey} className="group/player min-w-0 outline-none">
        <Frame>
          {hasVideo ? (
            <video
              ref={videoRef}
              src={BROADCAST.videoUrl}
              poster={BROADCAST.posterUrl || undefined}
              playsInline
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              onLoadedMetadata={(e) => onDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => {
                clamp();
                setCurrent(e.currentTarget.currentTime);
              }}
              onSeeking={clamp}
              onRateChange={(e) => {
                if (e.currentTarget.playbackRate !== 1) e.currentTarget.playbackRate = 1;
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={onEnded}
              onClick={toggle}
              muted={muted}
              className="h-full w-full cursor-pointer bg-black object-contain"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(70%_70%_at_50%_30%,rgba(158,0,255,0.25),transparent_70%)] px-6 text-center">
              <div>
                <Radio size={28} className="mx-auto text-coco-lilac" />
                <div className="mt-3 text-lg font-semibold">Broadcast in progress</div>
                <p className="mt-1 text-[13px] text-white/55">
                  {import.meta.env.DEV ? 'Set VITE_BROADCAST_VIDEO_URL to stream the recording here.' : 'The broadcast will appear here shortly.'}
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-coco-purple px-2 py-1 text-[11px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Premiere
            </span>
            <span className="hidden rounded-md bg-black/50 px-2 py-1 text-[11px] text-white/80 backdrop-blur sm:inline">Scheduled broadcast</span>
          </div>
          <div className="absolute right-3 top-3">
            <Viewers count={viewers} />
          </div>

          {hasVideo && !playing && (
            <button onClick={toggle} className="absolute inset-0 grid place-items-center bg-black/30" aria-label="Play">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl">
                <Play size={26} fill="currentColor" className="ml-1" />
              </span>
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-10 sm:px-4">
            <div
              className="relative h-1.5 cursor-pointer rounded-full bg-white/20"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seekTo(((e.clientX - r.left) / r.width) * duration);
              }}
              role="slider"
              aria-label="Broadcast position"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(position)}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${(edge / duration) * 100}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-coco-purple" style={{ width: `${(position / duration) * 100}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-1 text-[12px] sm:gap-2">
              {hasVideo && (
                <>
                  <button onClick={toggle} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label={playing ? 'Pause' : 'Play'}>
                    {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>
                  <button onClick={() => seekTo(current - 10)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Back 10 seconds">
                    <RotateCcw size={16} />
                  </button>
                  <button onClick={() => setMuted((m) => !m)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label={muted ? 'Unmute' : 'Mute'}>
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </>
              )}
              <span className="tabular text-white/75">
                {fmt(position)} / {fmt(duration)}
              </span>
              <div className="ml-auto flex items-center gap-1">
                {behind && (
                  <button onClick={() => seekTo(liveEdge())} className="rounded-lg bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold hover:bg-white/20">
                    Back to broadcast
                  </button>
                )}
                {hasVideo && (
                  <button onClick={fullscreen} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Full screen">
                    <Maximize size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Frame>
      </div>
      <div className="relative h-[420px] lg:h-auto">
        <div className="h-full lg:absolute lg:inset-0">
          <BroadcastChat session={session} duration={duration} viewers={viewers} lead={lead} />
        </div>
      </div>
    </div>
  );
}

export default function LivePlayer({ registration }) {
  useFunnelMedia();
  const now = useNow(1000);
  const [mediaDuration, setMediaDuration] = useState(null);
  const duration = mediaDuration || BROADCAST.durationSec;
  const schedule = getSchedule(now, duration);
  const [session, setSession] = useState(null);
  const [completed, setCompleted] = useState(() => {
    if (registration?.completedAt) return true;
    const joined = registration?.joinedSession;
    return Boolean(joined && Date.now() > Date.parse(joined.start) + BROADCAST.durationSec * 1000);
  });
  const [recap, setRecap] = useState(false);
  const viewers = useAudience(session?.id ?? schedule.id);

  useEffect(() => {
    if (completed && !registration?.completedAt) markCompleted(registration?.joinedSession?.id ?? null);
  }, [completed, registration]);

  const finish = useCallback(() => {
    markCompleted(session?.id ?? null);
    setCompleted(true);
  }, [session]);

  const join = () => {
    const s = { id: schedule.id, start: schedule.start };
    saveJoined(s);
    setSession(s);
  };

  let view;
  if (recap) view = <Recap key="recap" />;
  else if (completed) view = <EndScreen key="end" onRecap={() => setRecap(true)} />;
  else if (session)
    view = (
      <Broadcast
        key="broadcast"
        session={session}
        duration={duration}
        viewers={viewers}
        lead={registration?.lead}
        onDuration={setMediaDuration}
        onEnded={finish}
      />
    );
  else if (schedule.status === 'live')
    view = (
      <Frame key="join">
        <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(158,0,255,0.4),transparent_60%)]" />
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <span className="flex items-center gap-1.5 rounded-md bg-coco-purple px-2 py-1 text-[11px] font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Premiere
          </span>
          <h3 className="mt-3 text-xl font-bold sm:text-2xl">The broadcast has started</h3>
          <p className="mt-1 text-[13.5px] text-white/60">
            Started at {formatClock(schedule.start)} · {Math.floor(schedule.position / 60)} min in · {viewers.toLocaleString('en-US')} watching
          </p>
          <button onClick={join} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-black hover:bg-white/90">
            <Play size={16} fill="currentColor" /> Join the broadcast
          </button>
        </div>
      </Frame>
    );
  else view = <WaitingRoom key="wait" schedule={schedule} name={registration?.lead?.name} now={now} />;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={view.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        {view}
      </motion.div>
    </AnimatePresence>
  );
}
