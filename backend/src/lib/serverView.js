const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '');

function shipToLines(shipTo) {
  if (!shipTo.line1) return null;
  return [
    shipTo.name,
    shipTo.line1,
    shipTo.line2,
    [shipTo.city, shipTo.region, shipTo.postal].filter(Boolean).join(' '),
    shipTo.country,
  ].filter(Boolean);
}

// The shape the dashboard renders. Every number comes from the stored document; nothing is estimated.
export function serverView(s) {
  const dc = s.dataCenterDetails || {};
  const totalVcpu = s.vcpu || s.cores * 2;
  return {
    id: s.serial,
    serial: s.serial,
    order: s.orderReference,
    location: s.location,
    datacenter: s.datacenter,
    shipTo: Array.isArray(dc.shipTo)
      ? dc.shipTo
      : shipToLines({ name: dc.provider && dc.facility ? `${dc.provider}, ${dc.facility}` : undefined, ...dc.shipTo }),
    name: s.name,
    cpu: s.cpu,
    cores: s.cores,
    cpuModel: s.cpuModel,
    ram: s.ram,
    ramGb: s.ramGb,
    gpu: s.gpu,
    gpuModel: s.gpuModel,
    storage: s.storage,
    network: s.network,
    status: s.status,
    rackNumber: s.rackNumber || '',
    firstUseAt: s.firstUseAt || null,
    disconnectRequested: Boolean(s.disconnectRequestedAt),
    // Share of vCPU sold, the same measure as the portfolio's utilization.
    utilization: totalVcpu ? Math.round((Math.min(s.allocatedVcpu || 0, totalVcpu) / totalVcpu) * 1000) / 10 : 0,
    cpuUtil: s.cpuUtil,
    ramUtil: s.ramUtil,
    storageUtil: s.storageUtil,
    networkUtil: s.networkUtil,
    gpuUtil: s.gpu ? s.gpuUtil ?? 0 : null,
    customers: s.customers,
    allocatedVcpu: s.allocatedVcpu,
    totalVcpu,
    allocatedRam: s.allocatedRamGb,
    uptime: s.uptime,
    uptimeDays: s.onlineSince ? Math.floor((Date.now() - new Date(s.onlineSince).getTime()) / 86_400_000) : 0,
    revenue: s.revenue,
    revenueToDate: s.revenueToDate,
    purchasePrice: s.purchasePrice,
    purchasedOn: fmtDate(s.purchasedOn),
    alerts: (s.alerts || [])
      .slice()
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .map((a) => ({ level: a.level, title: a.title, detail: a.detail, time: fmtDate(a.time), at: a.time })),
    dcCosts: {
      colocation: s.dcCosts?.colocation || 0,
      power: s.dcCosts?.power || 0,
      crossConnect: s.dcCosts?.crossConnect || 0,
      remoteHands: s.dcCosts?.remoteHands || 0,
    },
    history: (s.history || []).map((h) => ({ m: h.m, v: h.v })),
    load: s.load?.length ? s.load : Array(24).fill(0),
  };
}
