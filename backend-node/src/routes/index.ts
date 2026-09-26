import { Router } from 'express';
import { roleGate } from '../middlewares/roleGate';
import { getDashboard, getForecast, simulateWhatIf, getNotifications } from '../controllers/resortController';
import { generatePlan, approvePlan } from '../controllers/planController';
import { parseReview, scheduleStaff, updateTask, createTask } from '../controllers/taskController';
import { getReviews } from '../controllers/reviewController';
import { getStaff } from '../controllers/staffController';

const router = Router();

// Resort & Dashboard routes
router.get('/dashboard', roleGate(['gm', 'ops', 'hk', 'fb', 'eng']), getDashboard);
router.get('/forecast', roleGate(['gm', 'ops']), getForecast);
router.post('/simulate', roleGate(['gm', 'ops']), simulateWhatIf);
router.get('/notifications', roleGate(['gm', 'ops', 'hk', 'fb', 'eng', 'staff']), getNotifications);

// Plan routes
router.get('/plans', roleGate(['gm', 'ops', 'fb']), async (req, res) => {
  const { ActionPlan } = await import('../models/ActionPlan');
  const plans = await ActionPlan.find();
  res.json(plans);
});
router.post('/generate-plan', roleGate(['gm', 'ops', 'fb']), generatePlan);
router.post('/approve-plan', roleGate(['gm', 'ops']), approvePlan);

// Task & Operations routes
router.get('/tasks', roleGate(['gm', 'ops', 'hk', 'fb', 'eng', 'staff']), async (req, res) => {
  const { Task } = await import('../models/Task');
  const tasks = await Task.find();
  res.json(tasks);
});
router.post('/parse-review', roleGate(['gm', 'ops', 'guest']), parseReview);
router.post('/schedule', roleGate(['gm', 'ops', 'hk', 'fb', 'eng']), scheduleStaff);
router.post('/tasks/create', roleGate(['gm', 'ops', 'hk', 'fb', 'eng', 'staff']), createTask);
router.post('/tasks', roleGate(['gm', 'ops', 'hk', 'fb', 'eng', 'staff']), updateTask);
router.get('/reviews', roleGate(['gm', 'ops', 'guest']), getReviews);
router.get('/staff', roleGate(['gm', 'ops', 'hk', 'fb', 'eng', 'staff']), getStaff);

export default router;
