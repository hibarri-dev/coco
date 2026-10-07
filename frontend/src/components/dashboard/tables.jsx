import { useNavigate } from 'react-router-dom';
import { ChevronRight, Server } from 'lucide-react';
import { Badge, Meter, Table } from './ui';
import { usd } from '../../data/packages';

export function MobileList({ children }) {
  return <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06] md:hidden">{children}</ul>;
}

export function ServersTable({ servers }) {
  const navigate = useNavigate();
  const open = (id) => navigate(`/dashboard/servers/${id}`);
  return (
    <>
      <MobileList>
        {servers.map((s) => (
          <li key={s.id}>
            <button onClick={() => open(s.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/[0.04]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coco-purple/10 text-coco-lilac">
                <Server size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-semibold">Server #{s.id} <span className="font-normal text-white/45">· {s.location}</span></span>
                  <span className="shrink-0 text-[14px] font-semibold tabular">{usd(s.revenue)}</span>
                </span>
                <span className="mt-0.5 block truncate font-mono text-[11.5px] text-white/50">
                  {s.cpu} · {s.ram}{s.gpu ? ` · ${s.gpu}` : ''}
                </span>
                <span className="mt-2 flex items-center gap-2.5">
                  <Badge pulse={s.status === 'Online'}>{s.status}</Badge>
                  <Meter value={s.utilization} className="flex-1" />
                  <span className="w-8 text-right text-[11.5px] tabular text-white/60">{s.utilization}%</span>
                </span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-white/25" />
            </button>
          </li>
        ))}
      </MobileList>
      <div className="hidden md:block">
        <Table head={['Server', 'Location', 'CPU', 'RAM', 'GPU', 'Status', 'Utilization', '>Revenue', '']}>
          {servers.map((s) => (
            <tr
              key={s.id}
              tabIndex={0}
              onClick={() => open(s.id)}
              onKeyDown={(e) => e.key === 'Enter' && open(s.id)}
              className="group cursor-pointer transition-colors hover:bg-white/[0.025] focus:bg-white/[0.03] focus:outline-none"
            >
              <td className="px-5 py-3.5">
                <span className="flex items-center gap-3 whitespace-nowrap font-semibold">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-coco-purple/10 text-coco-lilac">
                    <Server size={14} />
                  </span>
                  Server #{s.id}
                </span>
              </td>
              <td className="px-5 py-3.5 text-white/70">{s.location}</td>
              <td className="px-5 py-3.5 font-mono text-[12.5px] text-white/70">{s.cpu}</td>
              <td className="px-5 py-3.5 font-mono text-[12.5px] text-white/70">{s.ram}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-white/70">{s.gpu ?? <span className="text-white/30">—</span>}</td>
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
      </div>
    </>
  );
}

export function CustomersTable({ customers, showServer = false }) {
  const navigate = useNavigate();
  const head = ['Customer', 'Product', ...(showServer ? ['Server', 'Since', 'Status'] : []), 'Usage', '>Revenue'];
  return (
    <>
      <MobileList>
        {customers.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="on-accent grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-coco-violet/70 to-[#2b0750] text-[12px] font-semibold">
              {c.name.slice(-1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[14px] font-semibold">{c.name}</span>
                <span className="shrink-0 text-[14px] font-semibold tabular">{usd(c.revenue)}</span>
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/50">
                <span className="truncate">{c.product}</span>
                {showServer && (
                  <>
                    <span>·</span>
                    <button onClick={() => navigate(`/dashboard/servers/${c.server}`)} className="shrink-0 text-coco-lilac">#{c.server}</button>
                  </>
                )}
              </span>
              <span className="mt-2 flex items-center gap-2.5">
                {showServer && <Badge>{c.status}</Badge>}
                <Meter value={c.usage} className="flex-1" />
                <span className="w-8 text-right text-[11.5px] tabular text-white/60">{c.usage}%</span>
              </span>
            </span>
          </li>
        ))}
      </MobileList>
      <div className="hidden md:block">
        <Table head={head}>
          {customers.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-white/[0.025]">
              <td className="px-5 py-3.5">
                <span className="flex items-center gap-3 whitespace-nowrap font-semibold">
                  <span className="on-accent grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-coco-violet/70 to-[#2b0750] text-[11px]">{c.name.slice(-1)}</span>
                  {c.name}
                </span>
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-white/70">{c.product}</td>
              {showServer && (
                <>
                  <td className="px-5 py-3.5">
                    <button onClick={() => navigate(`/dashboard/servers/${c.server}`)} className="text-coco-lilac hover:underline">#{c.server}</button>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-white/50">{c.since}</td>
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
      </div>
    </>
  );
}
