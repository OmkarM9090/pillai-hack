import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
  start: { type: Number, required: true },
  span: { type: Number, required: true },
  dept: { type: String, required: true },
  kind: { type: String },
  label: { type: String }
});

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: [{ type: String }],
  costPerHour: { type: Number, required: true },
  role: { type: String },
  dept: { type: String },
  blocks: { type: [BlockSchema], default: [] },
  afterBlocks: { type: [BlockSchema], default: [] },
  isAvailable: { type: Boolean, default: true }
});

export const Employee = mongoose.model('Employee', EmployeeSchema);
