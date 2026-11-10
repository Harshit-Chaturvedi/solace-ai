import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Mood } from '../models/Mood.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { formatLocalDate } from '../services/streak.js';

export const insightsRouter = Router();

insightsRouter.use(requireAuth);

const MOOD_SCORES: Record<string, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  awful: 1,
};

insightsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const range = Number(req.query.range) === 30 ? 30 : 7;

  const since = new Date();
  since.setDate(since.getDate() - range);

  const [moods, user, activities] = await Promise.all([
    Mood.find({ userId, createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .lean(),
    User.findById(userId).lean(),
    Activity.find({ userId, createdAt: { $gte: since } }).lean(),
  ]);

  const timezone = user?.timezone || 'Asia/Kolkata';

  // Group moods by local date
  const moodMap = new Map<string, { mood: string; score: number; count: number }>();
  for (const m of moods) {
    const day = formatLocalDate(new Date(m.createdAt), timezone);
    const score = MOOD_SCORES[m.mood] || 3;
    const existing = moodMap.get(day);
    if (!existing) {
      moodMap.set(day, { mood: m.mood, score, count: 1 });
    } else {
      moodMap.set(day, {
        mood: m.mood,
        score: Math.round((existing.score * existing.count + score) / (existing.count + 1)),
        count: existing.count + 1,
      });
    }
  }

  const moodSeries = Array.from(moodMap.entries()).map(([date, data]) => ({
    date,
    mood: data.mood,
    score: data.score,
  }));

  const totalMinutes = Math.round(
    activities.reduce((acc, a) => acc + (a.durationSeconds || 0), 0) / 60
  );

  const emotionMap = new Map<string, number>();
  let totalScore = 0;
  for (const m of moods) {
    const score = MOOD_SCORES[m.mood] || 3;
    totalScore += score;
    if (Array.isArray(m.emotions)) {
      for (const e of m.emotions) {
        if (typeof e === "string" && e.trim()) {
          const norm = e.trim();
          emotionMap.set(norm, (emotionMap.get(norm) || 0) + 1);
        }
      }
    }
  }

  const emotionCounts = Array.from(emotionMap.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const checkinCount = moods.length;
  const averageScore =
    checkinCount === 0 ? null : Number((totalScore / checkinCount).toFixed(1));

  res.json({
    range,
    moodSeries,
    streak: user?.streak || { current: 0, longest: 0 },
    activitySummary: {
      totalSessions: activities.length,
      totalMinutes,
    },
    emotionCounts,
    checkinCount,
    averageScore,
  });
});
