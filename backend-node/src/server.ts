import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB } from './db';
import { Task } from './models/Task';
import { ActionPlan } from './models/ActionPlan';
import { Employee } from './models/Employee';
import { ResortState } from './models/ResortState';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ML_CORE_URL = process.env.ML_CORE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// Initialize Database Connection and Seed Mock Data
connectDB().then(async () => {
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
  }
});

// Role-Gate Middleware
const roleGate = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const role = req.query.role as string;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};

// --- API Endpoints ---

// 1. GET /dashboard
app.get('/api/dashboard', roleGate(['manager']), async (req, res) => {
  try {
    const state = await ResortState.findOne().sort({ updatedAt: -1 });
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard state" });
  }
});

// 2. GET /forecast
app.get('/api/forecast', async (req, res) => {
  const days = req.query.days || 7;
  try {
    const response = await axios.post(`${ML_CORE_URL}/predict_forecast?days=${days}`);
    res.json(response.data);
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to fetch forecast from ML Core" });
  }
});

// 3. POST /simulate
app.post('/api/simulate', async (req, res) => {
  const { occupancy, weather, inflation } = req.body;
  try {
    const response = await axios.post(`${ML_CORE_URL}/simulate_whatif`, {
      occupancy: parseFloat(occupancy),
      weather: weather,
      inflation: parseFloat(inflation || 0)
    });
    res.json(response.data);
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to run simulation in ML Core" });
  }
});

// 4. POST /parse-review
app.post('/api/parse-review', async (req, res) => {
  const { review_text } = req.body;
  try {
    const response = await axios.post(`${ML_CORE_URL}/parse_review`, { review_text });
    const data = response.data;
    
    let newTask = null;
    if (data.ticket_routed) {
      newTask = await Task.create({
        title: `NLP Alert: ${data.aspects.join(', ')} Issue`,
        description: `Review issue detected. Highlights: ${data.shap_highlights.join(', ')}`,
        department: data.aspects.includes('Maintenance') ? 'Maintenance' : 'F&B',
        priority: 'High',
        source: 'Guest Review',
        status: 'Open'
      });
      data.db_task_id = newTask._id;
    }
    
    res.json(data);
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to parse review in ML Core" });
  }
});

// 5. POST /generate-plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    // Fetch live constraints from DB
    const state = await ResortState.findOne().sort({ updatedAt: -1 });
    const constraints = { 
      occupancy: (state?.occupancy || 72) / 100, 
      salmon_stock: state?.fbStock || 50,
      weather: state?.weather || "Clear"
    };
    
    const response = await axios.post(`${ML_CORE_URL}/generate_action_plan`, { constraints });
    
    const newPlan = await ActionPlan.create({
      actionId: response.data.action_id,
      recommendation: response.data.recommendation,
      badges: response.data.badges,
      status: 'Pending'
    });
    
    res.json({ ...response.data, db_plan_id: newPlan._id });
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to generate plan in ML Core" });
  }
});

// 6. POST /approve-plan
app.post('/api/approve-plan', roleGate(['manager']), async (req, res) => {
  const { db_plan_id, decision } = req.body; // 'approved' or 'rejected'
  try {
    const plan = await ActionPlan.findByIdAndUpdate(db_plan_id, {
      status: decision === 'approved' ? 'Approved' : 'Rejected',
      updatedAt: Date.now()
    }, { new: true });
    
    res.json({
       status: plan?.status,
       message: decision === 'approved' ? "Roster updated, rates published, PO drafted." : "Plan rejected."
    });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to approve plan." });
  }
});

// 7. POST /schedule
app.post('/api/schedule', async (req, res) => {
  const { department } = req.body;
  try {
    // Query available employees dynamically from DB
    const employees = await Employee.find({ isAvailable: true });
    
    const response = await axios.post(`${ML_CORE_URL}/optimize_roster`, {
        department: department,
        pool: employees
    });
    res.json(response.data);
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to generate schedule in ML Core" });
  }
});

// 8. POST /tasks
app.post('/api/tasks', async (req, res) => {
  const { task_id, status } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(task_id, { status, updatedAt: Date.now() }, { new: true });
    res.json({
       task_id: task?._id,
       status: task?.status,
       timer: "stopped"
    });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// 9. GET /notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const pendingPlans = await ActionPlan.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(5);
    const notifications = pendingPlans.map(p => ({
      id: p._id,
      text: `Action Card ${p.actionId} requires approval.`,
      type: "alert"
    }));
    res.json({ notifications });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

app.listen(PORT, () => {
  console.log(`Node API Gateway listening on port ${PORT}`);
});
