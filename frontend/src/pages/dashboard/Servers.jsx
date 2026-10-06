import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Server, Activity, Wrench, Loader } from 'lucide-react';
import { Card, PageHeader, Stat, Button, Segmented, page } from '../../components/dashboard/ui';
import { ServersTable } from '../../components/dashboard/tables';
import { SERVERS } from '../../data/dashboard';
import { usd } from '../../data/packages';

export default function Servers() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('All');
  const [q, setQ] = useState('');

  const list = useMemo(
    () =>
      SERVERS.filter((s) => (location === 'All' || s.location === location) && `server #${s.id} ${s.location} ${s.cpu} ${s.ram} ${s.gpu ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    [location, q],
  );

  const count = (status) => SERVERS.filter((s) => s.status === status).length;
  const totalRevenue = SERVERS.reduce((a, s) => a + s.revenue, 0);
  const online = SERVERS.filter((s) => s.status === 'Online');
  const avgUtil = online.reduce((a, s) => a + s.utilization, 0) / online.length;

  return (
    <motion.div {...page}>
      <PageHeader
        title="Servers"
        sub="Every server you own on the CoCo network, live."
        actions={<Button onClick={() => navigate('/dashboard/buy')}>Buy server</Button>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Online" value={count('Online')} sub={`Avg. utilization ${avgUtil.toFixed(1)}%`} icon={Activity} />
        <Stat label="Maintenance" value={count('Maintenance')} sub="Workloads drained safely" icon={Wrench} />
        <Stat label="Provisioning" value={count('Provisioning')} sub="Burn-in complete" icon={Loader} />
        <Stat label="Revenue this month" value={usd(totalRevenue)} sub="All servers combined" icon={Server} accent />
      </div>

      <Card className="mt-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 sm:max-w-xs">
            <Search size={15} className="text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search servers…" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/35" />
          </label>
          <Segmented id="loc" options={['All', 'Dallas', 'Miami', 'Ashburn']} value={location} onChange={setLocation} />
        </div>
        <ServersTable servers={list} />
        {list.length === 0 && <div className="py-12 text-center text-[13px] text-white/40">No servers match your filters.</div>}
      </Card>
    </motion.div>
  );
}
