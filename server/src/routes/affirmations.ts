import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { User, type IUser } from "../models/User.js";
import { formatLocalDate } from "../services/streak.js";
import { generateJSON } from "../services/ai/gemini.js";

export const affirmationsRouter = Router();

affirmationsRouter.use(requireAuth);

export const DAILY_AFFIRMATIONS = [
  "You are doing better than you give yourself credit for. Take a deep breath.",
  "Your feelings are valid, and it is safe to give yourself grace today.",
  "Peace begins the moment you decide not to allow another person or event to control your emotions.",
  "You do not have to carry the whole world on your shoulders today. One step is enough.",
  "In the middle of difficulty lies opportunity for gentleness toward yourself.",
  "You are resilient, capable, and worthy of rest.",
  "Honor where you are right now. Growth happens in quiet moments too.",
  "I give myself permission to slow down and take things one breath at a time.",
  "I am doing the best I can today, and that is more than enough.",
  "I choose calm over hurry, and trust my own journey.",
];

export interface CachedAffirmation {
  text: string;
  dateStr: string;
}

const userAffirmationCache = new Map<string, CachedAffirmation>();

export function getDailyAffirmation(timezone: string = "Asia/Kolkata"): {
  text: string;
  dateStr: string;
} {
  const now = new Date();
  const dateStr = formatLocalDate(now, timezone);
  const parts = dateStr.split("-").map(Number);
  const hash = (parts[0] * 365 + parts[1] * 31 + parts[2]) % DAILY_AFFIRMATIONS.length;
  const text = DAILY_AFFIRMATIONS[Math.abs(hash)];
  return { text, dateStr };
}

export async function getPersonalizedDailyAffirmation(user: {
  _id: string | mongoose.Types.ObjectId;
  name?: string;
  companionTone?: string;
  goals?: string[];
  timezone?: string;
}): Promise<{ text: string; dateStr: string }> {
  const tz = user.timezone || "Asia/Kolkata";
  const now = new Date();
  const dateStr = formatLocalDate(now, tz);
  const cacheKey = `${user._id}_${dateStr}`;

  const cached = userAffirmationCache.get(cacheKey);
  if (cached && cached.dateStr === dateStr) {
    return cached;
  }

  const fallback = getDailyAffirmation(tz);

  try {
    const tone = user.companionTone || "gentle";
    const name = user.name || "friend";
    const goals = user.goals?.length ? user.goals.join(", ") : "inner peace and wellness";

    const prompt = `Generate a 1-sentence warm, uplifting daily affirmation for ${name} (goals: "${goals}"). Tone: ${tone}. Do not use quotes or prefixes, max 20 words. Return JSON with "text".`;

    const aiRes = await generateJSON<{ text: string }>({
      system: prompt,
      history: [{ role: "user", text: "Today's affirmation" }],
      schema: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
    });

    if (aiRes?.text?.trim()) {
      const result = { text: aiRes.text.trim(), dateStr };
      userAffirmationCache.set(cacheKey, result);
      return result;
    }
  } catch {
    // Return fallback on AI timeout or failure
  }

  userAffirmationCache.set(cacheKey, fallback);
  return fallback;
}

affirmationsRouter.get("/today", async (req: Request, res: Response): Promise<void> => {
  const user = req.user || (await User.findById(req.userId));
  if (!user) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found" } });
    return;
  }

  const { text, dateStr } = await getPersonalizedDailyAffirmation(user);

  res.json({
    text,
    affirmation: text,
    author: "Sol",
    date: dateStr,
  });
});

affirmationsRouter.get("/recent", async (req: Request, res: Response): Promise<void> => {
  const user = req.user || (await User.findById(req.userId));
  const tz = user?.timezone || "Asia/Kolkata";
  const now = new Date();

  const items = [0, 1, 2, 3].map((offset) => {
    const d = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const dateStr = formatLocalDate(d, tz);
    const parts = dateStr.split("-").map(Number);
    const hash = (parts[0] * 365 + parts[1] * 31 + parts[2]) % DAILY_AFFIRMATIONS.length;
    const text = DAILY_AFFIRMATIONS[Math.abs(hash)];

    return {
      text,
      affirmation: text,
      author: "Sol",
      date: dateStr,
    };
  });

  res.json(items);
});
