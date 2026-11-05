import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

export const homeRouter = Router();

homeRouter.use(requireAuth);

const affirmations = [
  "I give myself permission to slow down and take things one breath at a time.",
  "I am doing the best I can today, and that is more than enough.",
  "Peace begins with a conscious breath and a kind thought towards myself.",
  "My feelings are valid, and I hold space for myself with warmth and patience.",
  "I choose calm over hurry, and trust my own journey.",
];

homeRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "User not found" },
    });
    return;
  }

  const hour = new Date().getHours();
  let timeOfDay = "day";
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else timeOfDay = "evening";

  const greeting = `Good ${timeOfDay}, ${user.name}`;

  // Find today's mood check-in if one exists
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let todayMood = null;
  try {
    const moodsCol = mongoose.connection.collection("moods");
    const doc = await moodsCol.findOne({
      userId: new mongoose.Types.ObjectId(req.userId),
      createdAt: { $gte: todayStart },
    });
    if (doc) {
      todayMood = {
        mood: doc.mood,
        score: doc.score,
        emotions: doc.emotions || [],
        note: doc.note,
        solReply: doc.solReply,
      };
    }
  } catch {
    // If collection not yet populated
  }

  // Affirmation of the day (stable for the day)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const affirmation = affirmations[dayOfYear % affirmations.length];

  // Tailored suggestion
  interface Suggestion {
    title: string;
    reason: string;
    action: {
      type: string;
      params?: Record<string, unknown>;
    };
  }

  let suggestion: Suggestion = {
    title: "2-min box breathing",
    reason: "A gentle breath to center your morning",
    action: {
      type: "breathing",
      params: { pattern: "box", minutes: 2 },
    },
  };

  if (timeOfDay === "evening") {
    suggestion = {
      title: "Calm 4-6 breathing",
      reason: "Wind down and release the tension from today",
      action: {
        type: "breathing",
        params: { pattern: "calm", minutes: 3 },
      },
    };
  } else if (todayMood && (todayMood.mood === "low" || todayMood.mood === "awful")) {
    suggestion = {
      title: "Talk with Sol",
      reason: "Sol is here to listen and help you unpack your thoughts",
      action: {
        type: "chat",
        params: { initialPrompt: "I've been feeling low today..." },
      },
    };
  }

  const streak = {
    current: user.streak?.current || 0,
    longest: user.streak?.longest || 0,
  };

  const quickActions = [
    { id: "chat", title: "Talk to Sol", route: "/chat/new" },
    { id: "breathe", title: "Breathe", route: "/breathe" },
    { id: "reflect", title: "Reflect", route: "/journal" },
    { id: "reminders", title: "Plan", route: "/reminders" },
  ];

  res.json({
    greeting,
    todayMood,
    affirmation,
    suggestion,
    streak,
    quickActions,
  });
});
