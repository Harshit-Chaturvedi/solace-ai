import { Router, Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';
import { calculateNewStreak } from '../services/streak.js';

export const activitiesRouter = Router();

activitiesRouter.use(requireAuth);

const createActivitySchema = z.object({
  type: z.enum(['breathing', 'affirmation', 'journal', 'meditation']),
  durationSec: z.number().nonnegative().optional(),
  durationSeconds: z.number().nonnegative().optional(),
  meta: z.record(z.unknown()).optional(),
});

activitiesRouter.post(
  '/',
  validateBody(createActivitySchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { type, meta = {} } = req.body;
    const duration = req.body.durationSec ?? req.body.durationSeconds ?? 0;

    const activity = await Activity.create({
      userId,
      type,
      durationSeconds: duration,
      meta,
    });

    const user = await User.findById(userId);
    let streak = { current: 1, longest: 1 };
    if (user) {
      user.streak = calculateNewStreak(user.streak, user.timezone || 'Asia/Kolkata');
      await user.save();
      streak = { current: user.streak.current, longest: user.streak.longest };
    }

    res.status(201).json({
      ...activity.toObject(),
      activity,
      streak,
    });
  }
);

activitiesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(activities);
});
