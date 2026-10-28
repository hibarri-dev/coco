import mongoose from 'mongoose';
import { Server } from '../models/Server.js';
import { Service } from '../models/Service.js';
import { notifyFirstUse } from './notificationService.js';

const RUNNING = ['active', 'deploying'];

/**
 * Picks the Online server a service runs on: its current host if still online, otherwise the one
 * with the most free vCPU that fits it. Returns null when nothing fits, in which case the service
 * runs on CoCo's own capacity and no server owner is paid for it.
 */
export async function placeService(service) {
  const need = service.vcpu * service.replicas;
  if (service.server) {
    const current = await Server.exists({ _id: service.server, status: 'Online' });
    if (current) return service.server;
  }
  const servers = await Server.find({ status: 'Online', vcpu: { $gt: 0 } }, { vcpu: 1, allocatedVcpu: 1 }).lean();
  let best = null;
  for (const s of servers) {
    const free = s.vcpu - (s.allocatedVcpu || 0);
    if (free >= need && (!best || free > best.free)) best = { id: s._id, free };
  }
  return best?.id ?? null;
}

/** Recomputes allocation from the services actually running on each server, so it never drifts. */
export async function syncAllocation(serverIds) {
  const ids = [...new Set((serverIds ?? []).filter(Boolean).map(String))]
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (!ids.length) return;

  const rows = await Service.aggregate([
    { $match: { server: { $in: ids }, status: { $in: RUNNING } } },
    {
      $group: {
        _id: '$server',
        vcpu: { $sum: { $multiply: ['$vcpu', '$replicas'] } },
        ramGb: { $sum: { $multiply: ['$memoryGb', '$replicas'] } },
        owners: { $addToSet: '$owner' },
      },
    },
  ]);
  const byServer = new Map(rows.map((r) => [String(r._id), r]));
  const before = await Server.find({ _id: { $in: ids } }, { customers: 1 }).lean();
  const gainedFirstCustomer = before
    .filter((s) => !s.customers && byServer.get(String(s._id))?.owners.length)
    .map((s) => s._id);
  await Server.bulkWrite(
    ids.map((id) => {
      const r = byServer.get(String(id));
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: { allocatedVcpu: r?.vcpu ?? 0, allocatedRamGb: r?.ramGb ?? 0, customers: r?.owners.length ?? 0 } },
        },
      };
    })
  );
  if (gainedFirstCustomer.length) void notifyFirstUse(gainedFirstCustomer);
}
