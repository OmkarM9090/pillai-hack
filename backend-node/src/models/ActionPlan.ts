import mongoose from 'mongoose';

const ActionPlanSchema = new mongoose.Schema({
  actionId: { type: String, required: true },
  recommendation: { type: String, required: true },
  badges: [{ type: String }],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  managerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ActionPlan = mongoose.model('ActionPlan', ActionPlanSchema);
