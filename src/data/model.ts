// ─────────────────────────────────────────────────────────────
// ResortSandbox 360 · Domain model & counterfactual simulation engine
// Azure Bay Resort — Luxury Coastal Resort · 200 rooms
// ─────────────────────────────────────────────────────────────

export type ScreenId =
  | 'overview' | 'sandbox' | 'forecast' | 'guests'
  | 'actions' | 'scheduler' | 'tasks' | 'history' | 'accuracy';

export type Weather = 'sunny' | 'rainy' | 'stormy';
export type Risk = 'LOW' | 'MODERATE' | 'HIGH';

export interface ScenarioParams {
  occupancy: number; // 0.60 – 1.00
  weather: Weather;
  inflation: number; // 0 – 50 (%)
}

export interface SimResult {
  occupancy: number;
  occupiedRooms: number;
  adr: number;
  roomRevenue: number;
  goppar: number;
  burnout: number;        // %
  hkDelayMin: number;     // minutes per turnover
  diningWaitMin: number;  // minutes
  salmonKg: number;
  salmonDemandKg: number;
  serviceQuality: number; // %
  riskIndex: number;      // 0–100
  risk: Risk;
  hkLoadPct: number;      // vs baseline workload
  diningDemandPct: number;
}

export const ROOMS = 200;
export const DATE_STR = 'Tuesday, September 8, 2026';
export const PROPERTY = 'Azure Bay Resort';

export const BASE_PARAMS: ScenarioParams = { occupancy: 0.70, weather: 'sunny', inflation: 0 };
export const SURGE_PARAMS: ScenarioParams = { occupancy: 0.95, weather: 'stormy', inflation: 25 };

const W_BURNOUT: Record<Weather, number> = { sunny: 0, rainy: 2, stormy: 4 };
const W_HK: Record<Weather, number> = { sunny: 0, rainy: 2, stormy: 6 };
const W_DINE: Record<Weather, number> = { sunny: 0, rainy: 1, stormy: 2 };

export function computeScenario(p: ScenarioParams): SimResult {
  const occF = (p.occupancy - 0.7) / 0.25;          // 0 @70% · 1 @95%
  const iF = p.inflation / 50;

  const adr = Math.round(200 + occF * 65);                       // $200 → $265 optimized
  const roomRevenue = Math.round(ROOMS * p.occupancy * adr);     // $28,000 → $50,350 (+79.8%)
  const goppar = Math.round(38250 + 4600 * occF);                // $38,250 → $42,850 (+12%)

  const burnout = clamp(Math.round(40 + 40 * occF + W_BURNOUT[p.weather]), 5, 98);
  const hkDelayMin = clamp(Math.round(30 + 48 * occF + W_HK[p.weather]), 12, 180);
  const diningWaitMin = clamp(Math.round(6 + 14 * occF + W_DINE[p.weather]), 3, 45);
  const salmonKg = clamp(Math.round(50 - 43 * occF - 4 * iF), 0, 60);
  const salmonDemandKg = clamp(Math.round(32 + 13 * occF), 20, 60);
  const serviceQuality = Math.round((92.5 - 2.0 * Math.max(occF, 0)) * 10) / 10;

  const hkPct = (hkDelayMin / 84) * 100;
  const salPct = (1 - salmonKg / 50) * 100;
  const riskIndex = clamp(Math.round(0.45 * burnout + 0.3 * hkPct + 0.25 * salPct), 0, 100);
  const risk: Risk = riskIndex >= 70 ? 'HIGH' : riskIndex >= 45 ? 'MODERATE' : 'LOW';

  return {
    occupancy: p.occupancy,
    occupiedRooms: Math.round(ROOMS * p.occupancy),
    adr, roomRevenue, goppar,
    burnout, hkDelayMin, diningWaitMin, salmonKg, salmonDemandKg, serviceQuality,
    riskIndex, risk,
    hkLoadPct: Math.round(hkDelayMin / 30 * 100 - 100 + 63 * Math.max(occF, 0)),
    diningDemandPct: Math.round(diningWaitMin / 6 * 100 - 100 + 12 * Math.max(occF, 0)),
  };
}

export const BASE_RESULT = computeScenario(BASE_PARAMS);

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

// ─── Formatters ──────────────────────────────────────────────
export const fmtMoney = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
export const fmtPct = (v: number, d = 0) => (v * (d ? 1 : 100)).toFixed(d) + (d ? '' : '%');
export function fmtDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  return `${(min / 60).toFixed(1)} hr`;
}
export const fmtOcc = (o: number) => Math.round(o * 100) + '%';

// ─── Actions (AI prescriptive plan) ──────────────────────────
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'queued' | 'manual';

export interface ActionItem {
  id: string;           // ACT-2048
  num: string;          // ACTION 01
  title: string;
  dept: string;
  desc: string;
  why: string;
  impact: string;
  cost: 'None' | 'Low' | 'Medium' | 'High';
  confidence: number;
  risk: 'Low' | 'Medium' | 'High';
  priority: 'HIGH' | 'MEDIUM';
  status: ActionStatus;
  approveMsg: string;
  queuedMsg: string;
  detail?: { label: string; value: string }[];
  approvedBy?: string;
  approvedAt?: string;
}

export const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'ACT-2048', num: 'ACTION 01', title: 'Staff Reallocation', dept: 'Operations',
    desc: 'Deploy 3 cross-trained Spa employees to Front Desk / F&B during the evening peak (14:00–22:00).',
    why: 'Predicted staffing gap exceeds safe capacity: 84% burnout risk at 95% occupancy.',
    impact: '−31% predicted guest wait', cost: 'Low', confidence: 94, risk: 'Low', priority: 'HIGH', status: 'pending',
    approveMsg: 'Action approved. Staff allocation updated.',
    queuedMsg: 'OPS-105 queued — reassignment notices sent to Spa team.',
    detail: [
      { label: 'Employees', value: 'N. Rossi · S. Kim · L. Fontaine' },
      { label: 'Window', value: '14:00 – 22:00' },
      { label: 'Skill check', value: 'Certified · FD + F&B L2' },
    ],
  },
  {
    id: 'ACT-2049', num: 'ACTION 02', title: 'F&B Inventory', dept: 'Food & Beverage',
    desc: 'Prepare salmon replenishment order for evening service at Azure Grill.',
    why: 'Stock 5 kg vs expected demand ~45 kg under surge conditions. Stockout projected at 20:10.',
    impact: 'Avoid 20:00 stockout', cost: 'Medium', confidence: 91, risk: 'Low', priority: 'HIGH', status: 'pending',
    approveMsg: 'Purchase order approved. Supplier notified.',
    queuedMsg: 'FNB-034 queued — PO #7741 routed to Coastal Seafood Co.',
    detail: [
      { label: 'PO #7741', value: '40 kg Atlantic salmon · $1,150' },
      { label: 'Supplier', value: 'Coastal Seafood Co. · SLA 4 hr' },
      { label: 'Delivery', value: 'Today 14:30 · Receiving dock B' },
    ],
  },
  {
    id: 'ACT-2050', num: 'ACTION 03', title: 'Revenue Control', dept: 'Revenue',
    desc: 'Adjust remaining premium dining / room inventory pricing to slow demand velocity.',
    why: 'Unmanaged velocity would push occupancy past safe operating envelope before 18:00.',
    impact: 'Protect operational capacity', cost: 'None', confidence: 88, risk: 'Low', priority: 'MEDIUM', status: 'pending',
    approveMsg: 'Rate fence applied to premium inventory.',
    queuedMsg: 'REV-012 queued — channel manager sync in progress.',
    detail: [
      { label: 'Premium suites', value: '$265 → $305 · fence +$40' },
      { label: 'Min. stay', value: '2 nights · tonight only' },
      { label: 'Channels', value: 'Direct · OTA · GDS sync' },
    ],
  },
  {
    id: 'ACT-2051', num: 'ACTION 04', title: 'Breakfast Window Extension', dept: 'Food & Beverage',
    desc: 'Extend breakfast service by 45 min to smooth morning F&B load tomorrow.',
    why: 'Model confidence below approval threshold — demand spread uncertain after storm clears.',
    impact: '−8% morning peak load', cost: 'Low', confidence: 71, risk: 'Medium', priority: 'MEDIUM', status: 'manual',
    approveMsg: 'Action approved after manual review.',
    queuedMsg: 'FNB-035 queued — breakfast roster updated.',
  },
];

// ─── Tasks ───────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'progress' | 'verify' | 'done';
export const TASK_COLS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'TO DO' }, { id: 'progress', label: 'IN PROGRESS' },
  { id: 'verify', label: 'VERIFYING' }, { id: 'done', label: 'COMPLETED' },
];
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Task {
  id: string; title: string; dept: string; priority: Priority; source: string;
  assignee: string; location: string; createdAt: string; status: TaskStatus;
  origin: string; prediction: string; action: string;
}

export const AC_TASK: Task = {
  id: 'OPS-104', title: 'Inspect AC unit — rattle + leak', dept: 'Engineering', priority: 'High',
  source: 'Guest Intelligence', assignee: 'Alex Carter', location: 'Room 304', createdAt: '09:21 AM',
  status: 'progress', origin: 'AI Action Plan · Guest Intel',
  prediction: 'Negative facilities sentiment −0.91 · Room 304',
  action: 'Inspect AC unit in Room 304 before next check-in (15:00).',
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'HSK-039', title: 'Evening turndown coverage — floors 4–5', dept: 'Housekeeping', priority: 'Low',
    source: 'Resort Sandbox', assignee: 'Luis Vega', location: 'Floors 4–5', createdAt: '08:55 AM',
    status: 'todo', origin: 'Shift Plan · SP-118',
    prediction: '82 occupied rooms by 21:00', action: 'Confirm turndown route for 40 upper-floor rooms.',
  },
  {
    id: 'ENG-090', title: 'Pool heater calibration', dept: 'Engineering', priority: 'Medium',
    source: 'Preventive Maintenance', assignee: 'Daniel Osei', location: 'Main Pool', createdAt: '07:05 AM',
    status: 'progress', origin: 'PM Schedule · PM-2210',
    prediction: 'Heater efficiency −8% vs spec', action: 'Calibrate heat exchanger, log baseline kWh.',
  },
  {
    id: 'ENG-091', title: 'Elevator 2 door sensor fault', dept: 'Engineering', priority: 'Low',
    source: 'Asset Monitoring', assignee: 'Unassigned', location: 'Tower B', createdAt: '08:40 AM',
    status: 'todo', origin: 'IoT Sensor Alert · ELEV-B2',
    prediction: 'Sensor drift 2.1σ above nominal', action: 'Replace door sensor, test 20 cycles.',
  },
  {
    id: 'FNB-033', title: 'Private event AV walkthrough', dept: 'Food & Beverage', priority: 'Medium',
    source: 'Events Desk', assignee: 'Rosa Diaz', location: 'Seabreeze Hall', createdAt: '08:12 AM',
    status: 'verify', origin: 'BEO-118 · Corporate dinner',
    prediction: '—', action: 'Verify stage + AV with event lead before 16:00.',
  },
  {
    id: 'HSK-041', title: 'Stain treatment — 3 room carpets', dept: 'Housekeeping', priority: 'Medium',
    source: 'Housekeeping QC', assignee: 'Mia Chen', location: 'Floor 5', createdAt: '07:48 AM',
    status: 'done', origin: 'QC Inspection · HK-QC-88',
    prediction: '—', action: 'Deep-clean carpets rooms 512, 514, 518.',
  },
  {
    id: 'REV-011', title: 'Publish updated OTA rate parity', dept: 'Revenue', priority: 'Low',
    source: 'Revenue Playbook', assignee: 'James Whitfield', location: 'Distribution', createdAt: 'Yesterday',
    status: 'done', origin: 'Rate Audit · RA-56',
    prediction: '—', action: 'Confirm parity across 6 channels.',
  },
];

// Tasks spawned when AI actions are approved
export const ACTION_TASKS: Record<string, Task> = {
  'ACT-2048': {
    id: 'OPS-105', title: 'Reallocate 3 cross-trained staff — Spa → FD/F&B', dept: 'Operations', priority: 'Critical',
    source: 'Resort Sandbox', assignee: 'Alex Carter', location: 'Front Desk · Azure Grill', createdAt: '09:22 AM',
    status: 'todo', origin: 'AI Action Plan · ACT-2048',
    prediction: '22 min dining wait · 84% burnout risk',
    action: 'Deploy 3 cross-trained staff (14:00–22:00 window).',
  },
  'ACT-2049': {
    id: 'FNB-034', title: 'Restock salmon — PO #7741 (40 kg)', dept: 'Food & Beverage', priority: 'High',
    source: 'Inventory Forecast', assignee: 'Marco Ruiz', location: 'Receiving Dock B', createdAt: '09:22 AM',
    status: 'todo', origin: 'AI Action Plan · ACT-2049',
    prediction: 'Stock 5 kg vs demand ~45 kg',
    action: 'Receive 40 kg Atlantic salmon by 14:30; QC + cold-store.',
  },
  'ACT-2050': {
    id: 'REV-012', title: 'Apply rate fence — premium inventory', dept: 'Revenue', priority: 'Medium',
    source: 'Resort Sandbox', assignee: 'James Whitfield', location: 'Distribution', createdAt: '09:23 AM',
    status: 'todo', origin: 'AI Action Plan · ACT-2050',
    prediction: 'Demand velocity +36% without controls',
    action: 'Fence premium suites +$40, min-stay 2, sync all channels.',
  },
};

// ─── Guest reviews ───────────────────────────────────────────
export interface Aspect { label: string; score: number; tag: string }
export interface Review {
  id: string; guest: string; room: string; date: string; source: string;
  sentiment: 'Negative' | 'Positive' | 'Mixed'; aspect: string; priority: 'High' | 'Medium' | 'Low';
  overall: number; text: string; highlights: string[]; aspects: Aspect[];
  reasoning: string; destination: string; genTask: string; resolved: boolean;
}

export const REVIEWS: Review[] = [
  {
    id: 'RV-1042', guest: 'G-8832', room: '304', date: 'Sep 7 · 21:36', source: 'Post-stay survey',
    sentiment: 'Negative', aspect: 'Facilities', priority: 'High', overall: -0.84,
    text: 'The dinner was amazing, but the AC in Room 304 made a loud rattling noise and was leaking.',
    highlights: ['rattling noise', 'leaking'],
    aspects: [
      { label: 'F&B', score: 0.78, tag: 'Positive' },
      { label: 'Room Comfort', score: -0.72, tag: 'Negative' },
      { label: 'AC / Maintenance', score: -0.91, tag: 'Critical' },
    ],
    reasoning: 'Maintenance issue detected from negative facilities language and explicit room reference. Two physical defect phrases extracted; leak indicates water-damage risk if unresolved.',
    destination: 'Engineering', genTask: 'Inspect AC unit in Room 304 before next check-in.',
    resolved: false,
  },
  {
    id: 'RV-1041', guest: 'G-8710', room: '118', date: 'Sep 7 · 20:04', source: 'Google Reviews',
    sentiment: 'Positive', aspect: 'F&B', priority: 'Low', overall: 0.81,
    text: "Chef's tasting menu at Azure Grill was outstanding — the seared scallops were the highlight of our stay.",
    highlights: ['outstanding', 'highlight of our stay'],
    aspects: [
      { label: 'F&B', score: 0.88, tag: 'Positive' },
      { label: 'Service', score: 0.61, tag: 'Positive' },
    ],
    reasoning: 'Strong positive F&B language with named-menu specificity. Routed to F&B for kudos and menu engineering signal.',
    destination: 'Food & Beverage', genTask: 'Log menu-win signal: seared scallops.',
    resolved: false,
  },

  {
    id: 'RV-1039', guest: 'G-8654', room: '512', date: 'Sep 7 · 14:12', source: 'In-stay app',
    sentiment: 'Positive', aspect: 'Service', priority: 'Low', overall: 0.74,
    text: 'Concierge arranged anniversary flowers within an hour — genuinely impressive service recovery after our late check-in.',
    highlights: ['genuinely impressive', 'service recovery'],
    aspects: [
      { label: 'Service', score: 0.82, tag: 'Positive' },
      { label: 'Arrival', score: 0.42, tag: 'Neutral' },
    ],
    reasoning: 'Service recovery succeeded: initial friction converted to promoter language. Recommend logging recovery play.',
    destination: 'Front Desk', genTask: 'Log recovery play: late check-in → concierge gesture.',
    resolved: false,
  },
  {
    id: 'RV-1038', guest: 'G-8622', room: '305', date: 'Sep 7 · 11:40', source: 'Post-stay survey',
    sentiment: 'Mixed', aspect: 'Facilities', priority: 'Medium', overall: -0.32,
    text: 'Lovely view, but Wi-Fi dropped three times during work calls. Fine for leisure, risky for remote work.',
    highlights: ['Wi-Fi dropped', 'risky for remote work'],
    aspects: [
      { label: 'Connectivity', score: -0.58, tag: 'Negative' },
      { label: 'Room View', score: 0.7, tag: 'Positive' },
    ],
    reasoning: 'Recurring connectivity complaint pattern (3rd this week, Tower B). Suggests AP capacity issue, not isolated device fault.',
    destination: 'Engineering', genTask: 'Check Tower B AP load — floors 3–4.',
    resolved: false,
  },
];

// ─── Scenario history ────────────────────────────────────────
export interface ScenarioRun {
  id: string; when: string; name: string; occ: number; weather: Weather; inflation: number;
  goppar: string; risk: Risk; decision: 'APPLIED' | 'REJECTED' | 'ARCHIVED' | 'FAILED'; user: string;
}

export const SCENARIO_RUNS: ScenarioRun[] = [
  { id: 'SCN-311', when: 'Sep 8 · 09:02', name: 'Evening surge — storm + 95%', occ: 95, weather: 'stormy', inflation: 25, goppar: '+12.0%', risk: 'HIGH', decision: 'APPLIED', user: 'S. Morgan' },
  { id: 'SCN-310', when: 'Sep 7 · 16:40', name: 'Full house stress test', occ: 100, weather: 'stormy', inflation: 30, goppar: '+13.1%', risk: 'HIGH', decision: 'REJECTED', user: 'S. Morgan' },
  { id: 'SCN-309', when: 'Sep 7 · 11:15', name: 'Wine festival demand', occ: 85, weather: 'sunny', inflation: 10, goppar: '+6.4%', risk: 'MODERATE', decision: 'APPLIED', user: 'J. Whitfield' },
  { id: 'SCN-308', when: 'Sep 6 · 09:50', name: 'Rain day indoor load', occ: 78, weather: 'rainy', inflation: 5, goppar: '+1.8%', risk: 'LOW', decision: 'FAILED', user: 'S. Morgan' },
  { id: 'SCN-307', when: 'Sep 5 · 15:22', name: 'Conference checkout dip', occ: 64, weather: 'sunny', inflation: 0, goppar: '−4.2%', risk: 'LOW', decision: 'ARCHIVED', user: 'A. Carter' },
  { id: 'SCN-306', when: 'Sep 4 · 10:03', name: 'Labor Day surge replay', occ: 92, weather: 'sunny', inflation: 15, goppar: '+9.7%', risk: 'MODERATE', decision: 'APPLIED', user: 'S. Morgan' },
];

// ─── Forecast data (Sep 1–14) ────────────────────────────────
export const FORECAST_DAYS = [
  { d: 'Sep 1', occ: 62, adr: 198 }, { d: 'Sep 2', occ: 65, adr: 201 }, { d: 'Sep 3', occ: 68, adr: 200 },
  { d: 'Sep 4', occ: 70, adr: 205 }, { d: 'Sep 5', occ: 71, adr: 208 }, { d: 'Sep 6', occ: 74, adr: 212 },
  { d: 'Sep 7', occ: 88, adr: 238 }, { d: 'Sep 8', occ: 95, adr: 265 }, { d: 'Sep 9', occ: 92, adr: 258 },
  { d: 'Sep 10', occ: 86, adr: 241 }, { d: 'Sep 11', occ: 79, adr: 224 }, { d: 'Sep 12', occ: 93, adr: 262 },
  { d: 'Sep 13', occ: 84, adr: 233 }, { d: 'Sep 14', occ: 73, adr: 209 },
];

export const ACCURACY_7D = {
  labels: ['Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8'],
  predicted: [32, 34, 31, 45, 62, 78, 84],
  actual: [30, 35, 29, 41, 58, 71, 79],
};

export const HEALTH_SPARKS: Record<string, number[]> = {
  hk: [28, 30, 32, 31, 38, 52, 60, 74, 84],
  fd: [3.8, 3.9, 4.4, 4.1, 3.7, 4.0, 4.3, 4.1, 4.2],
  fb: [6, 6, 7, 6, 8, 11, 15, 19, 22],
  eng: [1, 2, 2, 1, 2, 2, 2, 2, 2],
  pantry: [50, 48, 44, 40, 33, 24, 14, 8, 5],
};
