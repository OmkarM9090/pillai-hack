import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  dept: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  source: { type: String },
  assignee: { type: String },
  location: { type: String },
  createdAt: { type: String }, // Storing as String to match frontend formatting (e.g., '09:21 AM')
  status: { type: String, enum: ['todo', 'progress', 'verify', 'done'], default: 'todo' },
  origin: { type: String },
  prediction: { type: String },
  action: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

export const Task = mongoose.model('Task', TaskSchema);
