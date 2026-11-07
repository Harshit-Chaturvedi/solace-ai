import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { formatLocalDate } from "../services/streak.js";

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

affirmationsRouter.get("/today", async (req: Request, res: Response): Promise<void> => {
  const user = req.user || (await User.findById(req.userId));
  const tz = user?.timezone || "Asia/Kolkata";
  const { text, dateStr } = getDailyAffirmation(tz);

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
