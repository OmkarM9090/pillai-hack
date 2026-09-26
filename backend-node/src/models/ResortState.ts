import mongoose from 'mongoose';

const ResortStateSchema = new mongoose.Schema({
  occupancy: { type: Number, default: 72 },
  goppar: { type: Number, default: 31200 },
  staffBurnout: { type: Number, default: 40 },
  serviceScore: { type: Number, default: 96 },
  weather: { type: String, default: 'Clear' },
  fbStock: { type: Number, default: 50 }, // e.g., Salmon kg
  updatedAt: { type: Date, default: Date.now }
});

export const ResortState = mongoose.model('ResortState', ResortStateSchema);
