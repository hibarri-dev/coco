import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Hourglass } from 'lucide-react';
import FunnelLayout from '../../components/funnel/FunnelLayout';
import PackageBuilder from '../../components/funnel/PackageBuilder';
import CallbackButton from '../../components/funnel/CallbackButton';
import { getOfferDeadline, splitDuration, useNow } from '../../lib/broadcast';
import { selectionQuery } from '../../lib/pricing';

const pad = (n) => String(n).padStart(2, '0');

function InlineTimer({ ms }) {
  const { hours, minutes, seconds } = splitDuration(ms);
  return (
    <span role="timer" className="flex items-center gap-1 font-mono text-[15px] font-bold tabular">
      {[hours, minutes, seconds].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-60">:</span>}
          <span className="rounded-md bg-white/15 px-1.5 py-0.5">{pad(v)}</span>
        </span>
      ))}
      <span className="sr-only">remaining</span>
    </span>
  );
}

export default function OfferPage() {
  const navigate = useNavigate();
  const deadline = useMemo(getOfferDeadline, []);
  const now = useNow(1000);
  const remaining = deadline - now;
  const expired = remaining <= 0;

  return (
    <FunnelLayout step="offer" title="Choose your servers">
      <div className="sticky top-16 z-40 border-b border-white/10 bg-[linear-gradient(90deg,#4b0f8f,#7a1fd6,#9e00ff)] text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2.5 sm:justify-between">
          <span className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Timer size={16} />
            {expired ? 'The broadcast special has ended' : 'Broadcast special ends in'}
          </span>
          {!expired && <InlineTimer ms={remaining} />}
        </div>
      </div>

      <section className="mx-auto max-w-[1240px] px-4 pb-32 pt-10 sm:px-6 sm:pt-14 lg:pb-24">
        <div className="mb-10 max-w-2xl">
          <div className="text-[13px] font-semibold text-coco-violet">Step 3 of 4</div>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-tight sm:text-5xl">Choose your servers</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--muted)]">
            Pick the country your servers will live in, choose a server and a package. Every package includes 2 years of rack space, paid up front.
          </p>
        </div>

        {expired ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
            <Hourglass size={30} className="mx-auto text-coco-violet" />
            <h2 className="mt-4 text-2xl font-bold">This special has ended</h2>
            <p className="mt-2 text-[15px] text-[var(--muted)]">Talk to a partner specialist to see what is available for you now.</p>
            <CallbackButton className="mt-6" context="offer-expired" />
          </div>
        ) : (
          <PackageBuilder ctaLabel="Continue to payment" onContinue={(s) => navigate(`/live/checkout?${selectionQuery(s)}`)} />
        )}
      </section>
    </FunnelLayout>
  );
}
