import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { formatLocalDate } from "../services/streak.js";
import { getPersonalizedDailyAffirmation } from "./affirmations.js";

export const homeRouter = Router();

homeRouter.use(requireAuth);

homeRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "User not found" },
    });
    return;
  }

  const userTz = user.timezone || "Asia/Kolkata";
  const now = new Date();

  // Compute timezone-accurate local hour for greeting
  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: userTz,
  });
  const hour = parseInt(hourFormatter.format(now), 10);

  let timeOfDay = "day";
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else timeOfDay = "evening";

  const greeting = `Good ${timeOfDay}, ${user.name}`;

  // Find today's mood check-in in user's timezone
  const todayDateStr = formatLocalDate(now, userTz);
  let todayMood = null;
  try {
    const moodsCol = mongoose.connection.collection("moods");
    const recentMoods = await moodsCol
      .find({
        userId: new mongoose.Types.ObjectId(req.userId),
        createdAt: { $gte: new Date(now.getTime() - 36 * 60 * 60 * 1000) },
      })
      .sort({ createdAt: -1 })
      .toArray();

    const matchingMood = recentMoods.find(
      (m) => m.source === "checkin" && formatLocalDate(m.createdAt, userTz) === todayDateStr,
    );

    if (matchingMood) {
      todayMood = {
        mood: matchingMood.mood,
        score: matchingMood.score,
        emotions: matchingMood.emotions || [],
        note: matchingMood.note,
        solReply: matchingMood.solReply,
      };
    }
  } catch {
    // If collection not accessible or empty
  }

  // Affirmation of the day from single unified source
  const affirmationObj = await getPersonalizedDailyAffirmation(user);
  const affirmation = affirmationObj.text;

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

  if (todayMood && (todayMood.mood === "low" || todayMood.mood === "awful")) {
    suggestion = {
      title: "Talk with Sol",
      reason: "Sol is here to listen and help you unpack your thoughts",
      action: {
        type: "chat",
        params: { initialPrompt: "I've been feeling low today..." },
      },
    };
  } else if (timeOfDay === "evening") {
    suggestion = {
      title: "Calm 4-6 breathing",
      reason: "Wind down and release the tension from today",
      action: {
        type: "breathing",
        params: { pattern: "calm", minutes: 3 },
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
    { id: "reflect", title: "Reflect", route: "/chat/new?seed=I%20want%20to%20reflect%20on%20my%20day" },
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
