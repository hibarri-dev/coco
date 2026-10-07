import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Gauge, Users, Server, ArrowRight, CircleDollarSign, CalendarClock, CreditCard, TriangleAlert, UserRound, PackageCheck, Download } from 'lucide-react';
import { Card, CardHeader, PageHeader, Stat, Button, Segmented, page } from '../../components/dashboard/ui';
import { AreaChart, Bars, Ring } from '../../components/dashboard/charts';
import { ServersTable, CustomersTable } from '../../components/dashboard/tables';
import { PORTFOLIO, DAILY_REVENUE, MONTHLY_REVENUE, SERVERS, CUSTOMERS, ACTIVITY, PARTNER } from '../../data/dashboard';
import { usd } from '../../data/packages';
import { Counter } from '../../components/ui/motion';

const ACTIVITY_ICON = { pay: CreditCard, alert: TriangleAlert, user: UserRound, server: Server, order: PackageCheck };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Portfolio() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30 days');
  const p = PORTFOLIO;
  const change = ((p.thisMonthRevenue - p.lastMonthRevenue) / p.lastMonthRevenue) * 100;
  const dayLabels = DAILY_REVENUE.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAILY_REVENUE.length - 1 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return (
    <motion.div {...page}>
      <PageHeader
        title={`${greeting()}, ${PARTNER.name.split(' ')[0]}`}
        sub="Here's how your servers are performing across the CoCo network."
        actions={
          <>
            <Button variant="ghost"><Download size={15} /> Export</Button>
            <Button onClick={() => navigate('/dashboard/buy')}>Buy server</Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="My Portfolio"
            sub="Revenue earned from compute sold on your servers"
            action={<Segmented id="range" options={['7 days', '30 days', '6 months']} value={range} onChange={setRange} />}
          />
          <div className="grid grid-cols-2 gap-4 px-4 pt-5 sm:gap-6 sm:px-5">
            <div>
              <div className="text-[12.5px] text-white/50">This Month's Revenue</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
                <span className="text-[26px] font-bold tracking-tight sm:text-4xl">
                  <Counter value={p.thisMonthRevenue} format={(n) => usd(n)} />
                </span>
                <span className={`text-[13px] font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </span>
              </div>
              <div className="mt-0.5 text-[12px] text-white/35">Month to date · 6 days remaining</div>
            </div>
            <div className="border-l border-white/[0.06] pl-4 sm:pl-6">
              <div className="text-[12.5px] text-white/50">Last Month's Revenue</div>
              <div className="mt-1 text-[26px] font-bold tracking-tight text-white/80 sm:text-4xl">
                <Counter value={p.lastMonthRevenue} format={(n) => usd(n)} />
              </div>
              <div className="mt-0.5 text-[12px] text-white/35">September 2026 · paid out</div>
            </div>
          </div>
          <div className="px-3 pb-3 pt-4">
            {range === '6 months' ? (
              <div className="px-2 pb-2 pt-6"><Bars data={MONTHLY_REVENUE} height={200} format={usd} /></div>
            ) : (
              <AreaChart data={range === '7 days' ? DAILY_REVENUE.slice(-7) : DAILY_REVENUE} labels={range === '7 days' ? dayLabels.slice(-7) : dayLabels} format={usd} height={220} />
            )}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Utilization</span>
              <Gauge size={16} className="text-white/30" />
            </div>
            <div className="mt-4 flex items-center gap-5">
              <Ring value={p.utilization} size={124} stroke={11} label={`${p.utilization}%`} sub="sold" />
              <div className="flex-1 space-y-3 text-[13px]">
                <div>
                  <div className="text-white/45">Compute Sold</div>
                  <div className="text-lg font-bold tabular">{p.computeSold} vCPU</div>
                </div>
                <div>
                  <div className="text-white/45">Available Compute</div>
                  <div className="text-lg font-bold tabular">{p.availableCompute} vCPU</div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="relative overflow-hidden p-5">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-coco-purple/25 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <span className="text-[15px] font-semibold">Pending Payout</span>
              <CircleDollarSign size={16} className="text-white/30" />
            </div>
            <div className="relative mt-2 text-4xl font-bold tracking-tight tabular">{usd(p.pendingPayout)}</div>
            <div className="relative mt-4 flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-1.5 text-white/50"><CalendarClock size={14} /> Next Payout</span>
              <span className="font-semibold">{p.nextPayoutDays} Days</span>
            </div>
            <div className="relative mt-2 flex gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 23 ? 'bg-coco-violet' : 'bg-white/10'}`} />
              ))}
            </div>
            <Link to="/dashboard/payouts" className="relative mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-coco-lilac hover:text-white">
              View payout breakdown <ArrowRight size={14} />
            </Link>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Available Compute" value={`${p.availableCompute} vCPU`} sub="Across all servers" icon={Cpu} />
        <Stat label="Compute Sold" value={`${p.computeSold} vCPU`} sub={`${p.availableCompute - p.computeSold} vCPU free to sell`} icon={Cpu} />
        <Stat label="Active Customers" value={<Counter value={p.activeCustomers} />} sub="+12 this month" icon={Users} />
        <Stat label="Active Servers" value={<Counter value={p.activeServers} />} sub="Dallas · Miami · Ashburn" icon={Server} />
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Servers"
          sub="Click a server to see full hardware, utilization and revenue detail"
          icon={Server}
          action={<Link to="/dashboard/servers" className="text-[13px] font-medium text-coco-lilac hover:text-white">View all {p.activeServers}</Link>}
        />
        <div className="mt-3"><ServersTable servers={SERVERS.slice(0, 3)} /></div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Customers"
            sub="Top customers by revenue this month"
            icon={Users}
            action={<Link to="/dashboard/customers" className="text-[13px] font-medium text-coco-lilac hover:text-white">View all {p.activeCustomers}</Link>}
          />
          <div className="mt-3"><CustomersTable customers={CUSTOMERS.slice(0, 3)} /></div>
        </Card>
        <Card>
          <CardHeader title="Recent activity" sub="Across your servers" />
          <ul className="mt-3 space-y-1 px-3 pb-4">
            {ACTIVITY.map((a, i) => {
              const Icon = ACTIVITY_ICON[a.icon];
              return (
                <motion.li
                  key={a.text}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.02]"
                >
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${a.icon === 'alert' ? 'bg-amber-400/10 text-amber-300' : 'bg-white/[0.05] text-white/60'}`}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] leading-snug text-white/80">{a.text}</div>
                    <div className="mt-0.5 text-[11.5px] text-white/35">{a.time}</div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Card>
      </div>
    </motion.div>
  );
}
