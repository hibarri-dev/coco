import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, Clock, CircleAlert, CreditCard, Download, ReceiptText } from 'lucide-react';
import { Card, CardHeader, PageHeader, Stat, Badge, Button, Segmented, Table, page } from '../../components/dashboard/ui';
import { PAYMENTS } from '../../data/dashboard';
import { usd } from '../../data/packages';

const FILTERS = ['All', 'Succeeded', 'Pending', 'Failed', 'Refunded'];

export default function Payments() {
  const [filter, setFilter] = useState('All');
  const list = useMemo(() => (filter === 'All' ? PAYMENTS : PAYMENTS.filter((p) => p.status === filter)), [filter]);
  const sum = (status) => PAYMENTS.filter((p) => p.status === status).reduce((a, p) => a + p.amount, 0);

  return (
    <motion.div {...page}>
      <PageHeader
        title="Payments"
        sub="Every payment CoCo collects from customers on your behalf."
        actions={<Button variant="ghost"><Download size={15} /> Export</Button>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Collected (Oct)" value={usd(sum('Succeeded'))} sub="Settled to your balance" icon={CircleCheck} accent />
        <Stat label="Pending" value={usd(sum('Pending'))} sub="Clearing in 1–3 days" icon={Clock} />
        <Stat label="Failed" value={usd(sum('Failed'))} sub="CoCo is retrying automatically" icon={CircleAlert} />
        <Stat label="Collection rate" value="98.2%" sub="Last 90 days" icon={CreditCard} />
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Recent payments"
          sub="Customers are invoiced by CoCo, payments are reconciled to your servers"
          icon={ReceiptText}
          action={<div className="hidden md:block"><Segmented id="pay" options={FILTERS} value={filter} onChange={setFilter} /></div>}
        />
        <div className="px-5 pt-4 md:hidden">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0e0d13] px-3 py-2 text-[13px]">
            {FILTERS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="mt-3">
          <Table head={['Payment', 'Date', 'Customer', 'Description', 'Method', 'Status', '>Amount']}>
            {list.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-white/[0.025]">
                <td className="px-5 py-3.5 font-mono text-[12px] text-white/60">{p.id}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-white/60">{p.date}</td>
                <td className="whitespace-nowrap px-5 py-3.5 font-medium">{p.customer}</td>
                <td className="px-5 py-3.5 text-white/60">{p.description}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-white/60">{p.method}</td>
                <td className="px-5 py-3.5"><Badge>{p.status}</Badge></td>
                <td className={`px-5 py-3.5 text-right font-semibold tabular ${p.amount < 0 ? 'text-white/50' : ''}`}>{usd(p.amount, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </Table>
          {list.length === 0 && <div className="py-12 text-center text-[13px] text-white/40">No {filter.toLowerCase()} payments.</div>}
        </div>
      </Card>
    </motion.div>
  );
}
