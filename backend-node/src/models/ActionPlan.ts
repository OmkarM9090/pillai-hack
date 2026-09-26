import mongoose from 'mongoose';

const ActionPlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  num: { type: String },
  title: { type: String },
  dept: { type: String },
  desc: { type: String },
  why: { type: String },
  impact: { type: String },
  cost: { type: String },
  confidence: { type: Number },
  risk: { type: String },
  priority: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'queued', 'manual'], default: 'pending' },
  approveMsg: { type: String },
  queuedMsg: { type: String },
  detail: [{ label: String, value: String }],
  approvedBy: { type: String },
  approvedAt: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ActionPlan = mongoose.model('ActionPlan', ActionPlanSchema);
