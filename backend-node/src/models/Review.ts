import mongoose, { Schema, Document } from 'mongoose';

export interface IAspect {
  label: string;
  score: number;
  tag: string;
}

export interface IReview extends Document {
  id: string;
  guest: string;
  room: string;
  date: string;
  source: string;
  sentiment: 'Negative' | 'Positive' | 'Mixed';
  aspect: string;
  priority: 'High' | 'Medium' | 'Low';
  overall: number;
  text: string;
  highlights: string[];
  aspects: IAspect[];
  reasoning: string;
  destination: string;
  genTask: string;
  resolved: boolean;
}

const AspectSchema: Schema = new Schema({
  label: { type: String, required: true },
  score: { type: Number, required: true },
  tag: { type: String, required: true }
});

const ReviewSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  guest: { type: String, required: true },
  room: { type: String },
  date: { type: String, required: true },
  source: { type: String, required: true },
  sentiment: { type: String, enum: ['Negative', 'Positive', 'Mixed'], required: true },
  aspect: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  overall: { type: Number, required: true },
  text: { type: String, required: true },
  highlights: { type: [String], default: [] },
  aspects: { type: [AspectSchema], default: [] },
  reasoning: { type: String },
  destination: { type: String },
  genTask: { type: String },
  resolved: { type: Boolean, default: false }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
