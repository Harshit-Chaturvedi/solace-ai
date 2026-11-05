import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { User } from "../models/User.js";

export const meRouter = Router();

meRouter.use(requireAuth);

const patchMeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  goals: z.array(z.string()).optional(),
  companionTone: z.enum(["gentle", "cheerful", "direct"]).optional(),
  checkinTime: z.string().optional(),
  timezone: z.string().optional(),
  memoryEnabled: z.boolean().optional(),
  onboardingDone: z.boolean().optional(),
  expoPushToken: z.string().optional(),
});

meRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "User not found" },
    });
    return;
  }
  res.json(user);
});

meRouter.patch(
  "/",
  validateBody(patchMeSchema),
  async (req: Request, res: Response): Promise<void> => {
    const allowedUpdates = req.body as z.infer<typeof patchMeSchema>;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "User not found" },
      });
      return;
    }

    res.json(updatedUser);
  },
);

meRouter.delete("/", async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
    return;
  }

  // Cascade delete all user documents across all collections
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const collections = [
    "users",
    "moods",
    "conversations",
    "messages",
    "memories",
    "reminders",
    "journals",
    "activities",
    "achievements",
  ];

  for (const colName of collections) {
    try {
      const col = mongoose.connection.collection(colName);
      if (colName === "users") {
        await col.deleteOne({ _id: userObjectId });
      } else {
        await col.deleteMany({ userId: userObjectId });
      }
    } catch {
      // Ignore if collection does not exist yet
    }
  }

  res.status(204).send();
});
