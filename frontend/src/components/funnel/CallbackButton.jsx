import { useState } from 'react';
import { PhoneCall, CircleCheck } from 'lucide-react';
import { Modal, Field } from './Modal';
import { submitLead } from '../../lib/leads';
import { getRegistration } from '../../lib/broadcast';
import { useFormTracking } from '../../hooks/useFormTracking';

export default function CallbackButton({ className = '', context }) {
  const lead = getRegistration()?.lead;
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: lead?.name ?? '', phone: lead?.phone ?? '', time: 'Morning' });
  const [errors, setErrors] = useState({});
  const tracking = useFormTracking('callback-request', { active: open && !sent });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (form.phone.replace(/\D/g, '').length < 7) next.phone = 'Please enter a valid phone number';
    setErrors(next);
    if (Object.keys(next).length) return;
    tracking.submitted();
    await submitLead('callback-request', { ...form, email: lead?.email ?? null, context: context ?? null });
    setSent(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-5 py-3 text-[14px] font-semibold transition hover:bg-[var(--surface-2)] ${className}`}
      >
        <PhoneCall size={16} /> Request a call back
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Request a call back">
        {sent ? (
          <div className="py-6 text-center">
            <CircleCheck size={36} className="mx-auto text-emerald-500" />
            <h3 className="mt-3 text-xl font-bold">We'll call you soon</h3>
            <p className="mt-1.5 text-[14px] text-[var(--muted)]">A partner specialist will call {form.phone} in the {form.time.toLowerCase()}.</p>
            <button onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-coco-purple px-5 py-3 text-[14px] font-semibold text-white">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate {...tracking.handlers}>
            <h3 className="pr-8 text-xl font-bold">Request a call back</h3>
            <p className="mt-1 text-[14px] text-[var(--muted)]">Talk your package through with a partner specialist. No obligation.</p>
            <div className="mt-5 space-y-3.5">
              <Field label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Field label="Phone number" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
              <div>
                <span className="mb-1.5 block text-[13px] font-medium">Best time to call</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Morning', 'Afternoon', 'Evening'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setForm({ ...form, time: t })}
                      className={`rounded-xl border py-2.5 text-[13px] font-medium transition ${form.time === t ? 'border-coco-purple bg-coco-purple/10 text-coco-violet' : 'border-[var(--line)]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className="mt-6 w-full rounded-xl bg-coco-purple py-3.5 text-[15px] font-semibold text-white hover:bg-[#ad1fff]">
              Request call back
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
