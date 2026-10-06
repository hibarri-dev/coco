import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Cpu, Microchip, TrendingUp, Download } from 'lucide-react';
import { Card, PageHeader, Stat, Button, Segmented, page } from '../../components/dashboard/ui';
import { CustomersTable } from '../../components/dashboard/tables';
import { CUSTOMERS, PORTFOLIO } from '../../data/dashboard';
import { usd } from '../../data/packages';

export default function Customers() {
  const [type, setType] = useState('All');
  const [q, setQ] = useState('');

  const list = useMemo(
    () =>
      CUSTOMERS.filter((c) => {
        const isGpu = c.product === 'GPU';
        const matchType = type === 'All' || (type === 'GPU' ? isGpu : !isGpu);
        return matchType && `${c.name} ${c.product} ${c.server}`.toLowerCase().includes(q.toLowerCase());
      }),
    [type, q],
  );

  const gpu = CUSTOMERS.filter((c) => c.product === 'GPU');
  const top = CUSTOMERS.reduce((a, c) => a + c.revenue, 0);

  return (
    <motion.div {...page}>
      <PageHeader
        title="Customers"
        sub="Developers and teams running workloads on your servers. CoCo finds, bills and supports them for you."
        actions={<Button variant="ghost"><Download size={15} /> Export CSV</Button>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active Customers" value={PORTFOLIO.activeCustomers} sub="+12 this month" icon={Users} accent />
        <Stat label="Compute customers" value={PORTFOLIO.activeCustomers - gpu.length * 9} sub="vCPU & memory plans" icon={Cpu} />
        <Stat label="GPU customers" value={gpu.length * 9} sub="L40S on Server #003" icon={Microchip} />
        <Stat label="Avg. revenue / customer" value={usd(PORTFOLIO.thisMonthRevenue / PORTFOLIO.activeCustomers, { maximumFractionDigits: 2 })} sub={`Top 10 bring in ${usd(top)}`} icon={TrendingUp} />
      </div>

      <Card className="mt-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 sm:max-w-xs">
            <Search size={15} className="text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/35" />
          </label>
          <Segmented id="ctype" options={['All', 'Compute', 'GPU']} value={type} onChange={setType} />
        </div>
        <CustomersTable customers={list} showServer />
        {list.length === 0 && <div className="py-12 text-center text-[13px] text-white/40">No customers match your search.</div>}
        <div className="border-t border-white/[0.06] px-5 py-3.5 text-[12px] text-white/35">
          Showing your top {list.length} of {PORTFOLIO.activeCustomers} customers. Customer identities are kept private. CoCo handles their contracts and support.
        </div>
      </Card>
    </motion.div>
  );
}
