import mongoose from 'mongoose';

/** Admin overrides for a lifecycle email's copy (defaults live in services/emailTemplates.js). */
const cocoEmailTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    subject: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export const CocoEmailTemplate = mongoose.model('CocoEmailTemplate', cocoEmailTemplateSchema);
