import { Navigate } from 'react-router-dom';
import FunnelLayout from '../../components/funnel/FunnelLayout';
import LivePlayer from '../../components/funnel/LivePlayer';
import { Testimonials, Companies, FunnelFaq, InvestCta } from '../../components/funnel/Sections';
import { BROADCAST } from '../../config/funnel';
import { formatClock, getRegistration, getSchedule, timeZoneLabel } from '../../lib/broadcast';

export default function RoomPage() {
  const registration = getRegistration();
  if (!registration?.lead) return <Navigate to="/live" replace />;
  const schedule = getSchedule();

  return (
    <FunnelLayout step="broadcast" title={BROADCAST.title}>
      <section className="mx-auto max-w-[1100px] px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[12.5px] font-semibold text-coco-violet">Scheduled broadcast · daily at {formatClock(schedule.start)} {timeZoneLabel(schedule.start)}</div>
            <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">{BROADCAST.title}</h1>
          </div>
          <div className="text-[13px] text-[var(--muted)]">Hosted by the CoCo partner team</div>
        </div>
        <LivePlayer registration={registration} />
        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:flex-row sm:justify-between sm:p-7 sm:text-left">
          <div>
            <div className="text-lg font-bold">Ready to own your first servers?</div>
            <div className="text-[14px] text-[var(--muted)]">Choose a data center and package. It takes about 5 minutes.</div>
          </div>
          <InvestCta />
        </div>
      </section>

      <div className="mt-16 sm:mt-20">
        <Companies />
      </div>
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
    </FunnelLayout>
  );
}
