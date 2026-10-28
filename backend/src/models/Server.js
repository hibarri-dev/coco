import mongoose from 'mongoose';

export const SERVER_STATUSES = ['Ordered', 'Procuring', 'Shipping', 'Racking', 'Provisioning', 'Online', 'Maintenance'];

const percent = { type: Number, default: 0, min: 0, max: 100 };

const serverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
      default: null,
    },
    orderReference: {
      type: String,
      index: true,
      required: true,
    },
    serial: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String, // City, e.g. "Dallas"
      required: true,
    },
    datacenter: {
      type: String, // e.g. "Dedicated Datacenters · Evocative DAL6"
      required: true,
    },
    dataCenterDetails: {
      id: String,
      provider: String,
      facility: String,
      city: String,
      region: String,
      country: String,
      shipTo: mongoose.Schema.Types.Mixed,
    },

    cpu: { type: String, required: true }, // e.g. "96C"
    cores: { type: Number, default: 0 },
    vcpu: { type: Number, default: 0 },
    cpuModel: { type: String, default: '' },
    ram: { type: String, required: true }, // e.g. "1.5TB"
    ramGb: { type: Number, default: 0 },
    gpu: { type: String, default: null },
    gpuModel: { type: String, default: null },
    storage: { type: String, default: '' },
    network: { type: String, default: '' },
    rackU: { type: Number, default: 1 },

    status: {
      type: String,
      enum: SERVER_STATUSES,
      default: 'Ordered',
      index: true,
    },
    onlineSince: { type: Date, default: null },
    disconnectRequestedAt: { type: Date, default: null },
    // Physical location in the data center, assigned when the server enters configuration.
    rackNumber: { type: String, default: '', trim: true },
    // When the first customer workload was placed here; drives the one-time "first user" email.
    firstUseAt: { type: Date, default: null },
    stageHistory: [
      {
        status: { type: String, enum: SERVER_STATUSES },
        at: { type: Date, default: Date.now },
        by: { type: String, default: '' },
        _id: false,
      },
    ],

    // Telemetry: zero until the server is online and reporting.
    utilization: percent,
    cpuUtil: percent,
    ramUtil: percent,
    storageUtil: percent,
    networkUtil: percent,
    gpuUtil: { type: Number, default: null, min: 0, max: 100 },
    customers: { type: Number, default: 0, min: 0 },
    allocatedVcpu: { type: Number, default: 0, min: 0 },
    allocatedRamGb: { type: Number, default: 0, min: 0 },
    uptime: { type: Number, default: 0, min: 0, max: 100 },
    load: {
      type: [Number],
      default: () => Array(24).fill(0),
    },

    revenue: { type: Number, default: 0 },
    revenueToDate: { type: Number, default: 0 },
    purchasePrice: { type: Number, required: true },
    purchasedOn: { type: Date, default: Date.now },
    history: [
      {
        m: String,
        v: Number,
      },
    ],
    dcCosts: {
      colocation: { type: Number, default: 0 },
      power: { type: Number, default: 0 },
      crossConnect: { type: Number, default: 0 },
      remoteHands: { type: Number, default: 0 },
    },
    alerts: [
      {
        level: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
        title: String,
        detail: String,
        time: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Server = mongoose.model('Server', serverSchema);
