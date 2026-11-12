import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpiresIn } from '../config/env.js';

export const ROLES = ['investor', 'user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    // Opt-in for marketing email; forwarded with leads so MailLady only lists consenting contacts.
    marketingConsent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
    devPlan: {
      tier: { type: String, enum: ['hobby', 'pro'], default: null },
      status: { type: String, enum: ['none', 'active', 'past_due', 'canceled'], default: 'none' },
      stripeSubscriptionId: { type: String, default: '' },
      currentPeriodStart: { type: Date, default: null },
      currentPeriodEnd: { type: Date, default: null },
      includedCents: { type: Number, default: 0 },
      overageBilledFor: { type: Date, default: null },
    },
    // Cached sum of CreditLedger. The ledger is the source of truth; see creditService.
    credits: {
      balanceCents: { type: Number, default: 0 },
      fundedCents: { type: Number, default: 0 },
      lowNotifiedAt: { type: Date, default: null },
      suspendedAt: { type: Date, default: null },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, jwtSecret(), { expiresIn: jwtExpiresIn() });
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    company: this.company,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
