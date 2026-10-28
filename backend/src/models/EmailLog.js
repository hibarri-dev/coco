import mongoose from 'mongoose';

export const EMAIL_LOG_STATUSES = ['sending', 'sent', 'failed', 'skipped'];

/** One row per lifecycle email per order/server; the unique key/refId pair is what stops duplicates. */
const emailLogSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    refId: { type: String, required: true },
    to: { type: String, default: '' },
    status: { type: String, enum: EMAIL_LOG_STATUSES, default: 'sending', index: true },
    error: { type: String, default: '' },
    trigger: { type: String, default: '' },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

emailLogSchema.index({ key: 1, refId: 1 }, { unique: true });
emailLogSchema.index({ createdAt: -1 });

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);
