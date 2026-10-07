import { Navigate } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import FunnelLayout from '../../components/funnel/FunnelLayout';
import LivePlayer from '../../components/funnel/LivePlayer';
import { Testimonials, Companies, FunnelFaq, InvestCta, RealEstateVsServers } from '../../components/funnel/Sections';
import { BROADCAST } from '../../config/funnel';
import { dayLabel, formatClock, getRegistration, getSchedule, timeZoneLabel, useNow } from '../../lib/broadcast';
import { submitLead } from '../../lib/leads';

function WhitepaperCard({ lead }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:flex-row sm:justify-between sm:p-7 sm:text-left">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-coco-purple/10 text-coco-violet">
          <FileText size={22} />
        </span>
        <div>
          <div className="text-lg font-bold">In the meantime</div>
          <div className="text-[14px] text-[var(--muted)]">A free read on compute, superintelligence and where investment is going.</div>
        </div>
      </div>
      <a
        href={BROADCAST.whitepaperUrl}
        download="Whitepaper on Compute - Coco by Hibarri.pdf"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => submitLead('whitepaper-download', { email: lead.email, name: lead.name, page: 'room' })}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-coco-purple px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(158,0,255,0.9)] transition hover:bg-[#ad1fff]"
      >
        <Download size={17} /> Download Whitepaper on Compute
      </a>
    </div>
  );
}

export default function RoomPage() {
  const now = useNow(1000);
  const registration = getRegistration();
  if (!registration?.lead) return <Navigate to="/live" replace />;
  const schedule = getSchedule(now);
  const joined = registration.joinedSession;
  const revealed = schedule.status === 'live' || Boolean(registration.completedAt) || Boolean(joined && Date.parse(joined.start) <= now);

  return (
    <FunnelLayout step="broadcast" title={BROADCAST.title}>
      <section className="mx-auto max-w-[1240px] px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[12.5px] font-semibold text-coco-violet">Live Event · {dayLabel(schedule.start, now)} at {formatClock(schedule.start)} {timeZoneLabel(schedule.start)}</div>
            <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">{BROADCAST.title}</h1>
          </div>
          <div className="text-[13px] text-[var(--muted)]">Hosted by the CoCo partner team</div>
        </div>
        <LivePlayer registration={registration} />
        {revealed ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:flex-row sm:justify-between sm:p-7 sm:text-left">
            <div>
              <div className="text-lg font-bold">Ready to own your first servers?</div>
              <div className="text-[14px] text-[var(--muted)]">Choose a data center and package. It takes about 5 minutes.</div>
            </div>
            <InvestCta />
          </div>
        ) : (
          <WhitepaperCard lead={registration.lead} />
        )}
      </section>

      {revealed ? <RevealedSections /> : <div className="pb-16" />}
    </FunnelLayout>
  );
}

function RevealedSections() {
  return (
    <>
      <RealEstateVsServers />
      <Companies />
      <FunnelFaq />
      <Testimonials />

      <section className="px-3 pb-3">
        <div className="relative overflow-hidden rounded-[28px] px-6 py-20 text-center text-white sm:py-28">
          <div className="absolute inset-0 animate-gradient bg-[linear-gradient(120deg,#3b0a6b,#6d12c9_40%,#9e00ff_70%,#4b1590)] bg-[length:200%_200%]" />
          <div className="absolute inset-0 bg-grain opacity-[0.12] mix-blend-overlay" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Your digital estate starts here</h2>
            <p className="mt-5 text-lg text-white/75">Pick a data center, choose your servers and see your projected earnings before you pay.</p>
            <InvestCta className="mt-9 !bg-white !text-black hover:!bg-white/90" />
          </div>
        </div>
      </section>
    </>
  );
}
