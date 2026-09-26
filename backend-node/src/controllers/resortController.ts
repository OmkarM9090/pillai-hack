import { Request, Response } from 'express';
import axios from 'axios';
import { ResortState } from '../models/ResortState';
import { ActionPlan } from '../models/ActionPlan';

const ML_CORE_URL = process.env.ML_CORE_URL || 'http://localhost:8000';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const state = await ResortState.findOne().sort({ updatedAt: -1 });
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard state' });
  }
};

export const getForecast = async (req: Request, res: Response) => {
  const days = req.query.days || 7;
  try {
    const response = await axios.post(`${ML_CORE_URL}/predict_forecast?days=${days}`);
    res.json(response.data);
  } catch (error) {
    console.error('ML Backend Error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast from ML Core' });
  }
};

export const simulateWhatIf = async (req: Request, res: Response) => {
  const { occupancy, weather, inflation } = req.body;
  try {
    const response = await axios.post(`${ML_CORE_URL}/simulate_whatif`, {
      occupancy: parseFloat(occupancy),
      weather: weather,
      inflation: parseFloat(inflation || '0')
    });
    res.json(response.data);
  } catch (error) {
    console.error('ML Backend Error:', error);
    res.status(500).json({ error: 'Failed to run simulation in ML Core' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const pendingPlans = await ActionPlan.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5);
    const notifications = pendingPlans.map((p: any) => ({
      id: p._id,
      text: `Action Card ${p.id || p.actionId} requires approval.`,
      type: 'alert'
    }));
    res.json({ notifications });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};
