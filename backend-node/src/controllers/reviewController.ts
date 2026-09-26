import { Request, Response } from 'express';
import Review from '../models/Review';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching reviews' });
  }
};
