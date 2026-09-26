import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './src/models/Review';

dotenv.config();

const INITIAL_REVIEWS = [
  { id: 'RV-1042', guest: 'G-8832', room: '304', date: 'Sep 7 · 21:36', source: 'Post-stay survey', sentiment: 'Negative', aspect: 'Facilities', priority: 'High', overall: -0.84, text: 'The dinner was amazing, but the AC in Room 304 made a loud rattling noise and was leaking.', highlights: ['rattling noise', 'leaking'], aspects: [{ label: 'F&B', score: 0.78, tag: 'Positive' }, { label: 'Room Comfort', score: -0.72, tag: 'Negative' }, { label: 'AC / Maintenance', score: -0.91, tag: 'Critical' }], reasoning: 'Maintenance issue detected from negative facilities language and explicit room reference. Two physical defect phrases extracted; leak indicates water-damage risk if unresolved.', destination: 'Engineering', genTask: 'Inspect AC unit in Room 304 before next check-in.', resolved: false },
  { id: 'RV-1041', guest: 'G-8710', room: '118', date: 'Sep 7 · 20:04', source: 'Google Reviews', sentiment: 'Positive', aspect: 'F&B', priority: 'Low', overall: 0.81, text: "Chef's tasting menu at Azure Grill was outstanding — the seared scallops were the highlight of our stay.", highlights: ['outstanding', 'highlight of our stay'], aspects: [{ label: 'F&B', score: 0.88, tag: 'Positive' }, { label: 'Service', score: 0.61, tag: 'Positive' }], reasoning: 'Strong positive F&B language with named-menu specificity. Routed to F&B for kudos and menu engineering signal.', destination: 'Food & Beverage', genTask: 'Log menu-win signal: seared scallops.', resolved: false },
  { id: 'RV-1039', guest: 'G-8654', room: '512', date: 'Sep 7 · 14:12', source: 'In-stay app', sentiment: 'Positive', aspect: 'Service', priority: 'Low', overall: 0.74, text: 'Concierge arranged anniversary flowers within an hour — genuinely impressive service recovery after our late check-in.', highlights: ['genuinely impressive', 'service recovery'], aspects: [{ label: 'Service', score: 0.82, tag: 'Positive' }, { label: 'Arrival', score: 0.42, tag: 'Neutral' }], reasoning: 'Service recovery succeeded: initial friction converted to promoter language. Recommend logging recovery play.', destination: 'Front Desk', genTask: 'Log recovery play: late check-in → concierge gesture.', resolved: false },
  { id: 'RV-1038', guest: 'G-8622', room: '305', date: 'Sep 7 · 11:40', source: 'Post-stay survey', sentiment: 'Mixed', aspect: 'Facilities', priority: 'Medium', overall: -0.32, text: 'Lovely view, but Wi-Fi dropped three times during work calls. Fine for leisure, risky for remote work.', highlights: ['Wi-Fi dropped', 'risky for remote work'], aspects: [{ label: 'Connectivity', score: -0.58, tag: 'Negative' }, { label: 'Room View', score: 0.7, tag: 'Positive' }], reasoning: 'Recurring connectivity complaint pattern (3rd this week, Tower B). Suggests AP capacity issue, not isolated device fault.', destination: 'Engineering', genTask: 'Check Tower B AP load — floors 3–4.', resolved: false }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  await Review.deleteMany({});
  await Review.insertMany(INITIAL_REVIEWS);
  console.log('Reviews seeded');
  process.exit(0);
}

seed();
