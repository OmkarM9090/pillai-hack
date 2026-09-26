import { Request, Response } from 'express';
import axios from 'axios';
import { ResortState } from '../models/ResortState';
import { ActionPlan } from '../models/ActionPlan';

const ML_CORE_URL = process.env.ML_CORE_URL || 'http://localhost:8000';

export const generatePlan = async (req: Request, res: Response) => {
  try {
    // Fetch live constraints from DB
    const state = await ResortState.findOne().sort({ updatedAt: -1 });
    const constraints = { 
      occupancy: (state?.occupancy || 72) / 100, 
      salmon_stock: state?.fbStock || 50,
      weather: state?.weather || "Clear"
    };
    
    const response = await axios.post(`${ML_CORE_URL}/generate_action_plan`, { constraints });
    
    const newPlan: any = await ActionPlan.create({
      id: response.data.action_id || `A-${Date.now()}`,
      actionId: response.data.action_id,
      recommendation: response.data.recommendation,
      badges: response.data.badges,
      status: 'pending'
    } as any);
    
    res.json({ ...response.data, db_plan_id: newPlan._id });
  } catch (error) {
    console.error("ML Backend Error:", error);
    res.status(500).json({ error: "Failed to generate plan in ML Core" });
  }
};

export const approvePlan = async (req: Request, res: Response) => {
  const { db_plan_id, decision } = req.body; // 'approved' or 'rejected'
  try {
    const plan = await ActionPlan.findOneAndUpdate({ id: db_plan_id }, {
      status: decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'pending',
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
};
