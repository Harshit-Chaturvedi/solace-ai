import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const affirmationsRouter = Router();

affirmationsRouter.use(requireAuth);

const DAILY_AFFIRMATIONS = [
  'You are doing better than you give yourself credit for. Take a deep breath.',
  'Your feelings are valid, and it is safe to give yourself grace today.',
  'Peace begins the moment you decide not to allow another person or event to control your emotions.',
  'You do not have to carry the whole world on your shoulders today. One step is enough.',
  'In the middle of difficulty lies opportunity for gentleness toward yourself.',
  'You are resilient, capable, and worthy of rest.',
  'Honor where you are right now. Growth happens in quiet moments too.',
];

affirmationsRouter.get('/today', (req: Request, res: Response): void => {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = dayOfYear % DAILY_AFFIRMATIONS.length;
  const affirmation = DAILY_AFFIRMATIONS[index];

  res.json({
    text: affirmation,
    affirmation,
    author: 'Sol',
    date: now.toISOString().split('T')[0],
  });
});

affirmationsRouter.get('/recent', (req: Request, res: Response): void => {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const items = [0, 1, 2, 3].map((offset) => {
    const idx = (dayOfYear - offset + DAILY_AFFIRMATIONS.length * 10) % DAILY_AFFIRMATIONS.length;
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const text = DAILY_AFFIRMATIONS[idx];
    return {
      text,
      affirmation: text,
      author: 'Sol',
      date: d.toISOString().split('T')[0],
    };
  });

  res.json(items);
});
