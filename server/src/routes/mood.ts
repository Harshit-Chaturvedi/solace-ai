import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Mood, moodScoreMap, type MoodType } from "../models/Mood.js";
import { User } from "../models/User.js";
import { calculateNewStreak } from "../services/streak.js";
import { checkCrisis } from "../services/ai/safety.js";

export const moodRouter = Router();

moodRouter.use(requireAuth);

const postMoodSchema = z.object({
  mood: z.enum(["great", "good", "okay", "low", "awful"]),
  emotions: z.array(z.string()).optional().default([]),
  note: z.string().trim().optional(),
});

function getWarmSolReply(mood: MoodType): string {
  if (mood === "great") {
    return "It's wonderful to see your light shining so brightly today! Let that positive energy carry you forward.";
  }
  if (mood === "good") {
    return "I'm glad today is treating you well. Hold onto this gentle sense of ease.";
  }
  if (mood === "okay") {
    return "Being okay is more than enough. You're doing just fine, one moment at a time.";
  }
  if (mood === "low") {
    return "I'm holding space for you today. Be extra gentle with yourself, you don't have to carry everything at once.";
  }
  // awful
  return "I'm so sorry things feel heavy right now. Please know you're not alone, and I'm right here with you.";
}

moodRouter.post(
  "/",
  validateBody(postMoodSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { mood, emotions, note } = req.body;
    const score = moodScoreMap[mood as MoodType];

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
      return;
    }

    let solReply = getWarmSolReply(mood as MoodType);
    let flagged: "crisis" | null = null;
    if (note) {
      const crisis = checkCrisis(note);
      if (crisis.isCrisis && crisis.reply) {
        solReply = crisis.reply;
        flagged = "crisis";
      }
    }
    const newStreak = calculateNewStreak(user.streak, user.timezone);

    user.streak = newStreak;
    await user.save();

    const moodDoc = await Mood.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      mood,
      score,
      emotions,
      note,
      solReply,
      source: "checkin",
    });

    res.status(201).json({
      mood: moodDoc,
      streak: newStreak,
      solReply,
      flagged,
      achievementsUnlocked: [],
    });
  },
);

moodRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const rangeDays = req.query.range === "30" ? 30 : 7;
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

  const moods = await Mood.find({
    userId: new mongoose.Types.ObjectId(req.userId),
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .lean();

  const formatted = moods.map((m) => ({
    date: m.createdAt.toISOString().split("T")[0],
    score: m.score,
    mood: m.mood,
    emotions: m.emotions,
  }));

  res.json(formatted);
});
