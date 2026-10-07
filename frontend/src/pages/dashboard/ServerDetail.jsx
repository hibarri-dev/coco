import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Activity, Cpu, MemoryStick, HardDrive, Network, Microchip, TriangleAlert, Info, CircleAlert,
  Building, Users, CircleCheck, LifeBuoy, CalendarDays, Hash, Clock,
} from 'lucide-react';
import { Card, CardHeader, Badge, Meter, Button, page } from '../../components/dashboard/ui';
import { Bars, Ring, Sparkline } from '../../components/dashboard/charts';
import { CustomersTable } from '../../components/dashboard/tables';
import { SERVERS, CUSTOMERS } from '../../data/dashboard';
import { usd } from '../../data/packages';

const fmtGb = (gb) => (gb >= 1024 ? `${(gb / 1024).toFixed(gb % 1024 ? 2 : 1)} TB` : `${gb} GB`);

function KPI({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card className={`relative min-w-0 overflow-hidden p-4 sm:p-5 ${accent ? 'border-coco-purple/30' : ''}`}>
      {accent && <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-coco-purple/25 blur-2xl" />}
      <div className="relative flex items-center justify-between gap-2 text-[12px] text-white/50 sm:text-[12.5px]">
        <span className="truncate">{label}</span>
        <Icon size={15} className="shrink-0 text-white/30" />
      </div>
      <div className="relative mt-2 whitespace-nowrap text-[20px] font-bold tracking-tight tabular sm:text-[24px]">{value}</div>
      {sub && <div className="relative mt-0.5 text-[11.5px] leading-snug text-white/40 sm:text-[12px]">{sub}</div>}
    </Card>
  );
}

function Allocation({ label, used, total, unit, format = (v) => v }) {
  const pct = total ? (used / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium">{label}</span>
        <span className="text-[12px] text-white/45 tabular">{pct.toFixed(0)}% allocated</span>
      </div>
      <div className="mt-2.5 flex h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gradient-to-r from-coco-purple to-coco-violet" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.03] px-3.5 py-2.5">
          <div className="text-[11.5px] text-white/45">Allocated {unit}</div>
          <div className="text-[17px] font-bold tabular">{format(used)}</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] px-3.5 py-2.5">
          <div className="text-[11.5px] text-white/45">Available {unit}</div>
          <div className="text-[17px] font-bold tabular text-emerald-300">{format(total - used)}</div>
        </div>
      </div>
    </div>
  );
}

const ALERT_STYLE = {
  critical: { icon: CircleAlert, cls: 'border-rose-400/25 bg-rose-400/[0.06] text-rose-300' },
  warning: { icon: TriangleAlert, cls: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-300' },
  info: { icon: Info, cls: 'border-sky-400/25 bg-sky-400/[0.06] text-sky-300' },
};

export default function ServerDetail() {
  const { id } = useParams();
  const s = SERVERS.find((x) => x.id === id);

  if (!s) {
    return (
      <div className="py-24 text-center">
        <p className="text-white/50">Server #{id} wasn't found.</p>
        <Link to="/dashboard/servers" className="mt-4 inline-block text-coco-lilac">Back to servers</Link>
      </div>
    );
  }

  const customers = CUSTOMERS.filter((c) => c.server === s.id);
  const dcTotal = Object.values(s.dcCosts).reduce((a, b) => a + b, 0);
  const roi = (s.revenueToDate / s.purchasePrice) * 100;
  const facility = s.datacenter.split(' · ');

  return (
    <motion.div {...page}>
      <Link to="/dashboard/servers" className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white">
        <ArrowLeft size={15} /> All servers
      </Link>

      <div className="mt-4 mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">Server #{s.id}</h1>
            <Badge pulse={s.status === 'Online'}>{s.status}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-white/50">
            <span className="flex items-center gap-1.5"><MapPin size={14} />{s.datacenter}</span>
            <span className="flex items-center gap-1.5"><Cpu size={14} />{s.cpu} · {s.ram}{s.gpu ? ` · ${s.gpu}` : ''}</span>
            <span className="flex items-center gap-1.5"><Activity size={14} />{s.uptime}% uptime</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost"><LifeBuoy size={15} /> Request support</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KPI label="Purchase Price" value={usd(s.purchasePrice)} sub={`Bought ${s.purchasedOn}`} icon={CalendarDays} />
        <KPI label="Revenue to Date" value={usd(s.revenueToDate)} sub={`${roi.toFixed(0)}% of purchase price recovered`} icon={Activity} accent />
        <KPI label="Revenue Generated" value={usd(s.revenue)} sub="This month" icon={Activity} />
        <KPI label="Uptime" value={`${s.uptime}%`} sub={`${s.uptimeDays} days in service`} icon={Clock} />
        <KPI label="Current Customers" value={s.customers} sub="Workloads running now" icon={Users} />
      </div>

      <Card className="mt-4">
        <CardHeader title="Utilization" sub="Live resource usage on this server" icon={Activity} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6 lg:grid-cols-5">
          {[
            ['CPU utilization', s.cpuUtil, Cpu],
            ['RAM utilization', s.ramUtil, MemoryStick],
            ['Storage utilization', s.storageUtil, HardDrive],
            ['Network utilization', s.networkUtil, Network],
            ['GPU utilization', s.gpuUtil, Microchip],
          ].map(([label, v, Icon]) => (
            <div key={label} className="flex flex-col items-center gap-3 text-center">
              <Ring value={v} size={100} stroke={9} color={v >= 90 ? '#fbbf24' : '#9e00ff'} sub={v === null ? 'No GPU' : undefined} />
              <span className="flex items-center gap-1.5 text-[12.5px] text-white/55"><Icon size={13} />{label}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] px-5 py-4">
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/45">
            <span>CPU load · last 24 hours</span>
            <span>peak {Math.max(...s.load)}%</span>
          </div>
          <Sparkline data={s.load.length ? s.load : [0, 0]} height={56} />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-[15px] font-semibold">Capacity allocation</h3>
          <p className="text-[12.5px] text-white/45">How much of this server is sold to customers</p>
          <div className="mt-5 space-y-6">
            <Allocation label="vCPU" used={s.allocatedVcpu} total={s.totalVcpu} unit="vCPU" />
            <Allocation label="RAM" used={s.allocatedRam} total={s.ramGb} unit="RAM" format={fmtGb} />
          </div>
        </Card>
        <Card className="flex flex-col">
          <CardHeader title="Revenue generated" sub="Monthly revenue from this server" action={<span className="text-[13px] font-semibold tabular">{usd(s.revenueToDate)} total</span>} />
          <div className="flex-1 px-5 pb-5 pt-8">
            <Bars data={s.history} height={210} format={usd} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Cpu size={16} className="text-coco-lilac" /> Hardware specification</div>
          <dl className="mt-4 divide-y divide-white/[0.05] text-[13px]">
            {[
              ['Processor', s.cpuModel],
              ['Cores', `${s.cores} cores · ${s.totalVcpu} vCPU`],
              ['Memory', `${fmtGb(s.ramGb)} DDR5 ECC`],
              ['Storage', s.storage],
              ['Network', s.network],
              ['GPU', s.gpuModel ?? 'None'],
              ['Serial', `CC-${s.location.slice(0, 3).toUpperCase()}-${s.id}-${(Number(s.id) * 7919).toString(16).toUpperCase()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-white/45">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Building size={16} className="text-coco-lilac" /> Data-center</div>
          <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold"><MapPin size={14} className="text-white/50" />{s.location}</div>
            <div className="mt-1 text-[12.5px] text-white/50">{facility[0]} · {facility[1]}</div>
          </div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-white/40">Data-center costs / month</div>
          <dl className="mt-2 divide-y divide-white/[0.05] text-[13px]">
            {[
              ['Colocation', s.dcCosts.colocation],
              ['Power', s.dcCosts.power],
              ['Cross-connect', s.dcCosts.crossConnect],
              ['Remote hands', s.dcCosts.remoteHands],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <dt className="text-white/45">{k}</dt>
                <dd className="font-medium tabular">{usd(v)}</dd>
              </div>
            ))}
            <div className="flex justify-between py-2.5">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold tabular text-coco-lilac">{usd(dcTotal)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-semibold"><TriangleAlert size={16} className="text-coco-lilac" /> Hardware alerts</div>
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/50">{s.alerts.length}</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {s.alerts.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-8 text-center">
                <CircleCheck size={22} className="text-emerald-300" />
                <div className="text-[13.5px] font-semibold text-emerald-200">All hardware healthy</div>
                <div className="text-[12px] text-white/45">CPU, memory, disks, fans and PSUs reporting normally.</div>
              </div>
            )}
            {s.alerts.map((a) => {
              const st = ALERT_STYLE[a.level];
              return (
                <div key={a.title} className={`rounded-xl border p-3.5 ${st.cls}`}>
                  <div className="flex items-start gap-2.5">
                    <st.icon size={16} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-white">{a.title}</div>
                      <div className="mt-0.5 text-[12.5px] leading-relaxed text-white/60">{a.detail}</div>
                      <div className="mt-1.5 text-[11px] text-white/40">{a.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Current customers" sub={`${s.customers} customers running workloads on Server #${s.id}`} icon={Users} />
        <div className="mt-3">
          {customers.length ? (
            <CustomersTable customers={customers} />
          ) : (
            <div className="px-5 pb-8 pt-4 text-[13px] text-white/40">No customer workloads are on this server right now.</div>
          )}
        </div>
      </Card>
      <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-white/30"><Hash size={12} /> Showing your largest customers on this server. Smaller workloads are grouped in totals.</div>
    </motion.div>
  );
}
