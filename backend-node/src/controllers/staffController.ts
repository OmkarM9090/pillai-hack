import { Request, Response } from 'express';
import { Employee } from '../models/Employee';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Employee.find();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching staff' });
  }
};
