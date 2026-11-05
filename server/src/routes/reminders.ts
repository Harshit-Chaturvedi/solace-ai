import { Router, Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { Reminder } from '../models/Reminder.js';

export const remindersRouter = Router();

remindersRouter.use(requireAuth);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createReminderSchema = z.object({
  type: z.enum(['checkin', 'breathe', 'affirmation', 'reflection']).optional(),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  time: z.string().regex(timeRegex, 'Time must be in HH:MM 24-hour format'),
  days: z.array(z.number().int().min(0).max(6)).optional(),
  enabled: z.boolean().optional(),
});

const patchReminderSchema = z.object({
  type: z.enum(['checkin', 'breathe', 'affirmation', 'reflection']).optional(),
  title: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1).optional(),
  time: z.string().regex(timeRegex, 'Time must be in HH:MM 24-hour format').optional(),
  days: z.array(z.number().int().min(0).max(6)).optional(),
  enabled: z.boolean().optional(),
});

remindersRouter.post(
  '/',
  validateBody(createReminderSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { type = 'checkin', title, body, time, days = [0, 1, 2, 3, 4, 5, 6], enabled = true } = req.body;

    const reminder = await Reminder.create({
      userId,
      type,
      title,
      body,
      time,
      days,
      enabled,
    });

    res.status(201).json(reminder);
  }
);

remindersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const reminders = await Reminder.find({ userId }).sort({ time: 1 }).lean();
  res.json(reminders);
});

remindersRouter.patch(
  '/:id',
  validateBody(patchReminderSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid ID' } });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
    const updated = await Reminder.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Reminder not found' } });
      return;
    }

    res.json(updated);
  }
);

remindersRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid ID' } });
    return;
  }

  const userId = new mongoose.Types.ObjectId(req.userId);
  await Reminder.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id), userId });
  res.status(204).send();
});
