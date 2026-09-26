import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: [{ type: String }],
  costPerHour: { type: Number, required: true },
  currentRole: { type: String },
  isAvailable: { type: Boolean, default: true }
});

export const Employee = mongoose.model('Employee', EmployeeSchema);
