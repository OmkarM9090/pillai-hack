import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { Employee } from './models/Employee';
import { ResortState } from './models/ResortState';
import apiRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database Connection and Seed Mock Data
connectDB().then(async () => {
  try {
    const { ActionPlan } = await import('./models/ActionPlan');
    const { Task } = await import('./models/Task');
    const ReviewModel = (await import('./models/Review')).default;
    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      console.log("Seeding realistic demo data to DB...");
      await Employee.insertMany([
        { name: "Alice", skills: ["Spa", "Front Desk"], costPerHour: 15 },
        { name: "Bob", skills: ["Maintenance"], costPerHour: 20 },
        { name: "Charlie", skills: ["F&B", "Front Desk"], costPerHour: 16 },
        { name: "Dave", skills: ["Housekeeping"], costPerHour: 14 },
        { name: "Eve", skills: ["Spa", "Housekeeping"], costPerHour: 15 },
      ]);
      await ResortState.create({
        occupancy: 72, goppar: 31200, staffBurnout: 40, serviceScore: 96, weather: "Clear", fbStock: 50
      });
      
      const INITIAL_ACTIONS = [
        { id: 'ACT-2048', num: 'ACTION 01', title: 'Staff Reallocation', dept: 'Operations', desc: 'Deploy 3 cross-trained Spa employees to Front Desk / F&B during the evening peak (14:00–22:00).', why: 'Predicted staffing gap exceeds safe capacity: 84% burnout risk at 95% occupancy.', impact: '−31% predicted guest wait', cost: 'Low', confidence: 94, risk: 'Low', priority: 'HIGH', status: 'pending', approveMsg: 'Action approved. Staff allocation updated.', queuedMsg: 'OPS-105 queued — reassignment notices sent to Spa team.', detail: [ { label: 'Employees', value: 'N. Rossi · S. Kim · L. Fontaine' }, { label: 'Window', value: '14:00 – 22:00' }, { label: 'Skill check', value: 'Certified · FD + F&B L2' }, ] },
        { id: 'ACT-2049', num: 'ACTION 02', title: 'F&B Inventory', dept: 'Food & Beverage', desc: 'Prepare salmon replenishment order for evening service at Azure Grill.', why: 'Stock 5 kg vs expected demand ~45 kg under surge conditions. Stockout projected at 20:10.', impact: 'Avoid 20:00 stockout', cost: 'Medium', confidence: 91, risk: 'Low', priority: 'HIGH', status: 'pending', approveMsg: 'Purchase order approved. Supplier notified.', queuedMsg: 'FNB-034 queued — PO #7741 routed to Coastal Seafood Co.', detail: [ { label: 'PO #7741', value: '40 kg Atlantic salmon · $1,150' }, { label: 'Supplier', value: 'Coastal Seafood Co. · SLA 4 hr' }, { label: 'Delivery', value: 'Today 14:30 · Receiving dock B' }, ] },
        { id: 'ACT-2050', num: 'ACTION 03', title: 'Revenue Control', dept: 'Revenue', desc: 'Adjust remaining premium dining / room inventory pricing to slow demand velocity.', why: 'Unmanaged velocity would push occupancy past safe operating envelope before 18:00.', impact: 'Protect operational capacity', cost: 'None', confidence: 88, risk: 'Low', priority: 'MEDIUM', status: 'pending', approveMsg: 'Rate fence applied to premium inventory.', queuedMsg: 'REV-012 queued — channel manager sync in progress.', detail: [ { label: 'Premium suites', value: '$265 → $305 · fence +$40' }, { label: 'Min. stay', value: '2 nights · tonight only' }, { label: 'Channels', value: 'Direct · OTA · GDS sync' }, ] },
        { id: 'ACT-2051', num: 'ACTION 04', title: 'Breakfast Window Extension', dept: 'Food & Beverage', desc: 'Extend breakfast service by 45 min to smooth morning F&B load tomorrow.', why: 'Model confidence below approval threshold — demand spread uncertain after storm clears.', impact: '−8% morning peak load', cost: 'Low', confidence: 71, risk: 'Medium', priority: 'MEDIUM', status: 'manual', approveMsg: 'Action approved after manual review.', queuedMsg: 'FNB-035 queued — breakfast roster updated.' }
      ];
      await ActionPlan.insertMany(INITIAL_ACTIONS);

      const INITIAL_TASKS = [
        { id: 'HSK-039', title: 'Evening turndown coverage — floors 4–5', dept: 'Housekeeping', priority: 'Low', source: 'Resort Sandbox', assignee: 'Luis Vega', location: 'Floors 4–5', createdAt: '08:55 AM', status: 'todo', origin: 'Shift Plan · SP-118', prediction: '82 occupied rooms by 21:00', action: 'Confirm turndown route for 40 upper-floor rooms.' },
        { id: 'ENG-090', title: 'Pool heater calibration', dept: 'Engineering', priority: 'Medium', source: 'Preventive Maintenance', assignee: 'Daniel Osei', location: 'Main Pool', createdAt: '07:05 AM', status: 'progress', origin: 'PM Schedule · PM-2210', prediction: 'Heater efficiency −8% vs spec', action: 'Calibrate heat exchanger, log baseline kWh.' },
        { id: 'ENG-091', title: 'Elevator 2 door sensor fault', dept: 'Engineering', priority: 'Low', source: 'Asset Monitoring', assignee: 'Unassigned', location: 'Tower B', createdAt: '08:40 AM', status: 'todo', origin: 'IoT Sensor Alert · ELEV-B2', prediction: 'Sensor drift 2.1σ above nominal', action: 'Replace door sensor, test 20 cycles.' },
        { id: 'FNB-033', title: 'Private event AV walkthrough', dept: 'Food & Beverage', priority: 'Medium', source: 'Events Desk', assignee: 'Rosa Diaz', location: 'Seabreeze Hall', createdAt: '08:12 AM', status: 'verify', origin: 'BEO-118 · Corporate dinner', prediction: '—', action: 'Verify stage + AV with event lead before 16:00.' },
        { id: 'HSK-041', title: 'Stain treatment — 3 room carpets', dept: 'Housekeeping', priority: 'Medium', source: 'Housekeeping QC', assignee: 'Mia Chen', location: 'Floor 5', createdAt: '07:48 AM', status: 'done', origin: 'QC Inspection · HK-QC-88', prediction: '—', action: 'Deep-clean carpets rooms 512, 514, 518.' },
        { id: 'REV-011', title: 'Publish updated OTA rate parity', dept: 'Revenue', priority: 'Low', source: 'Revenue Playbook', assignee: 'James Whitfield', location: 'Distribution', createdAt: 'Yesterday', status: 'done', origin: 'Rate Audit · RA-56', prediction: '—', action: 'Confirm parity across 6 channels.' }
      ];
      await Task.insertMany(INITIAL_TASKS);
      
      const INITIAL_REVIEWS = [
        { id: 'RV-1042', guest: 'G-8832', room: '304', date: 'Sep 7 · 21:36', source: 'Post-stay survey', sentiment: 'Negative', aspect: 'Facilities', priority: 'High', overall: -0.84, text: 'The dinner was amazing, but the AC in Room 304 made a loud rattling noise and was leaking.', highlights: ['rattling noise', 'leaking'], aspects: [{ label: 'F&B', score: 0.78, tag: 'Positive' }, { label: 'Room Comfort', score: -0.72, tag: 'Negative' }, { label: 'AC / Maintenance', score: -0.91, tag: 'Critical' }], reasoning: 'Maintenance issue detected from negative facilities language and explicit room reference. Two physical defect phrases extracted; leak indicates water-damage risk if unresolved.', destination: 'Engineering', genTask: 'Inspect AC unit in Room 304 before next check-in.', resolved: false },
        { id: 'RV-1041', guest: 'G-8710', room: '118', date: 'Sep 7 · 20:04', source: 'Google Reviews', sentiment: 'Positive', aspect: 'F&B', priority: 'Low', overall: 0.81, text: "Chef's tasting menu at Azure Grill was outstanding — the seared scallops were the highlight of our stay.", highlights: ['outstanding', 'highlight of our stay'], aspects: [{ label: 'F&B', score: 0.88, tag: 'Positive' }, { label: 'Service', score: 0.61, tag: 'Positive' }], reasoning: 'Strong positive F&B language with named-menu specificity. Routed to F&B for kudos and menu engineering signal.', destination: 'Food & Beverage', genTask: 'Log menu-win signal: seared scallops.', resolved: false },
        { id: 'RV-1039', guest: 'G-8654', room: '512', date: 'Sep 7 · 14:12', source: 'In-stay app', sentiment: 'Positive', aspect: 'Service', priority: 'Low', overall: 0.74, text: 'Concierge arranged anniversary flowers within an hour — genuinely impressive service recovery after our late check-in.', highlights: ['genuinely impressive', 'service recovery'], aspects: [{ label: 'Service', score: 0.82, tag: 'Positive' }, { label: 'Arrival', score: 0.42, tag: 'Neutral' }], reasoning: 'Service recovery succeeded: initial friction converted to promoter language. Recommend logging recovery play.', destination: 'Front Desk', genTask: 'Log recovery play: late check-in → concierge gesture.', resolved: false },
        { id: 'RV-1038', guest: 'G-8622', room: '305', date: 'Sep 7 · 11:40', source: 'Post-stay survey', sentiment: 'Mixed', aspect: 'Facilities', priority: 'Medium', overall: -0.32, text: 'Lovely view, but Wi-Fi dropped three times during work calls. Fine for leisure, risky for remote work.', highlights: ['Wi-Fi dropped', 'risky for remote work'], aspects: [{ label: 'Connectivity', score: -0.58, tag: 'Negative' }, { label: 'Room View', score: 0.7, tag: 'Positive' }], reasoning: 'Recurring connectivity complaint pattern (3rd this week, Tower B). Suggests AP capacity issue, not isolated device fault.', destination: 'Engineering', genTask: 'Check Tower B AP load — floors 3–4.', resolved: false }
      ];
      await ReviewModel.insertMany(INITIAL_REVIEWS);

      console.log("DB seeding complete.");
    }
  } catch (err) {
    console.error("Skipping DB seeding because MongoDB is unavailable:", err);
  }
});

// API Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Node API Gateway listening on port ${PORT}`);
});
