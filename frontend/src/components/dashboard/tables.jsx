import { useNavigate } from 'react-router-dom';
import { ChevronRight, Server } from 'lucide-react';
import { Badge, Meter, Table } from './ui';
import { usd } from '../../data/packages';

export function ServersTable({ servers }) {
  const navigate = useNavigate();
  return (
    <Table head={['Server', 'Location', 'CPU', 'RAM', 'GPU', 'Status', 'Utilization', '>Revenue', '']}>
      {servers.map((s) => (
        <tr
          key={s.id}
          tabIndex={0}
          onClick={() => navigate(`/dashboard/servers/${s.id}`)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(`/dashboard/servers/${s.id}`)}
          className="group cursor-pointer transition-colors hover:bg-white/[0.025] focus:bg-white/[0.03] focus:outline-none"
        >
          <td className="px-5 py-3.5">
            <span className="flex items-center gap-3 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-coco-purple/10 text-coco-lilac">
                <Server size={14} />
              </span>
              Server #{s.id}
            </span>
          </td>
          <td className="px-5 py-3.5 text-white/70">{s.location}</td>
          <td className="px-5 py-3.5 font-mono text-[12.5px] text-white/70">{s.cpu}</td>
          <td className="px-5 py-3.5 font-mono text-[12.5px] text-white/70">{s.ram}</td>
          <td className="px-5 py-3.5 text-white/70">{s.gpu ?? <span className="text-white/30">—</span>}</td>
          <td className="px-5 py-3.5"><Badge pulse={s.status === 'Online'}>{s.status}</Badge></td>
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Meter value={s.utilization} className="w-20" />
              <span className="w-9 text-[12.5px] tabular text-white/70">{s.utilization}%</span>
            </div>
          </td>
          <td className="px-5 py-3.5 text-right font-semibold tabular">{usd(s.revenue)}</td>
          <td className="pr-4">
            <ChevronRight size={16} className="text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
          </td>
        </tr>
      ))}
    </Table>
  );
}

export function CustomersTable({ customers, showServer = false }) {
  const navigate = useNavigate();
  const head = ['Customer', 'Product', ...(showServer ? ['Server', 'Since', 'Status'] : []), 'Usage', '>Revenue'];
  return (
    <Table head={head}>
      {customers.map((c) => (
        <tr key={c.id} className="transition-colors hover:bg-white/[0.025]">
          <td className="px-5 py-3.5">
            <span className="flex items-center gap-3 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-coco-violet/70 to-[#2b0750] text-[11px]">{c.name.slice(-1)}</span>
              {c.name}
            </span>
          </td>
          <td className="px-5 py-3.5 text-white/70">{c.product}</td>
          {showServer && (
            <>
              <td className="px-5 py-3.5">
                <button onClick={() => navigate(`/dashboard/servers/${c.server}`)} className="text-coco-lilac hover:underline">#{c.server}</button>
              </td>
              <td className="px-5 py-3.5 text-white/50">{c.since}</td>
              <td className="px-5 py-3.5"><Badge>{c.status}</Badge></td>
            </>
          )}
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Meter value={c.usage} className="w-20" />
              <span className="w-9 text-[12.5px] tabular text-white/70">{c.usage}%</span>
            </div>
          </td>
          <td className="px-5 py-3.5 text-right font-semibold tabular">{usd(c.revenue)}</td>
        </tr>
      ))}
    </Table>
  );
}
