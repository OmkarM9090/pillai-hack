import { Request, Response } from 'express';
import axios from 'axios';
import { Task } from '../models/Task';
import { Employee } from '../models/Employee';

const ML_CORE_URL = process.env.ML_CORE_URL || 'http://localhost:8000';

export const parseReview = async (req: Request, res: Response) => {
  const { review_text } = req.body;
  try {
    const response = await axios.post(`${ML_CORE_URL}/parse_review`, { review_text });
    const data = response.data;
    
    let newTask = null;
    if (data.ticket_routed) {
      const generatedId = `NLP-${Math.floor(100 + Math.random() * 900)}`;
      newTask = await Task.create({
        id: generatedId,
        title: `NLP Alert: ${data.aspects.join(', ')} Issue`,
        dept: data.aspects.includes('Maintenance') ? 'Engineering' : 'Food & Beverage',
        priority: 'High',
        source: 'Guest Intelligence',
        assignee: 'Unassigned',
        location: 'TBD',
        createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'todo',
        origin: 'AI NLP Parser',
        prediction: `Highlights: ${data.shap_highlights.join(', ')}`,
        action: `Address ${data.aspects.join(', ')} issue.`
      });
      data.db_task_id = generatedId;
      data.created_task = newTask; // Return to frontend
    }
    
    res.json(data);
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to parse review in ML Core" });
  }
};

export const scheduleStaff = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find({ isAvailable: true });
    
    // Clear all existing afterBlocks first
    await Employee.updateMany({}, { $set: { afterBlocks: [] } });

    // For the optimization scenario, we optimize Front Desk and F&B for the evening peak (14:00 - 22:00, which is block start 3, span 4)
    const departmentsToOptimize = ['Front Desk', 'F&B'];
    
    for (const dept of departmentsToOptimize) {
      const response = await axios.post(`${ML_CORE_URL}/optimize_roster`, {
          department: dept,
          pool: employees
      });
      
      const shifts = response.data.shifts || [];
      for (const shift of shifts) {
        if (shift.worker !== 'Temp Agency (Auto-Requested)') {
          await Employee.updateOne(
            { name: shift.worker },
            { $push: { 
                afterBlocks: { start: 3, span: 4, dept: dept, kind: shift.role.includes('Cross-trained') ? 'reassigned' : 'normal', label: `XT → ${dept}` } 
              } 
            }
          );
        }
      }
    }
    
    // Since cross-trained workers keep their morning shifts, we need to push their morning shift into afterBlocks too
    // For simplicity, we just copy `blocks` to `afterBlocks` for everyone, EXCEPT where we just added reassigned ones.
    // Actually, it's easier to iterate all employees.
    const updatedEmps = await Employee.find();
    for (const emp of updatedEmps) {
      // If they got reassigned, we keep their original morning block and add it to afterBlocks
      if (emp.afterBlocks.length > 0) {
         // Add their original morning block (e.g. 0 to 3)
         if (emp.blocks.length > 0) {
            const orig = emp.blocks[0] as any;
            // E.g. start: 0, span: 3
            emp.afterBlocks.unshift({ start: orig.start, span: 3, dept: orig.dept });
            await emp.save();
         }
      }
    }

    res.json({ success: true, message: "Roster optimized successfully" });
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to generate schedule in ML Core" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { task_id, status } = req.body;
  try {
    const task = await Task.findOneAndUpdate({ id: task_id }, { status, updatedAt: Date.now() }, { new: true });
    res.json({
       task_id: task?.id,
       status: task?.status,
       timer: "stopped"
    });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to update task." });
  }
};
export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = req.body;
    const newTask = await Task.create(taskData);
    res.json(newTask);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to create task." });
  }
};
