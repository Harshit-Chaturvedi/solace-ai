import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { Memory } from "../models/Memory.js";

export const memoriesRouter = Router();

memoriesRouter.use(requireAuth);

memoriesRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const memories = await Memory.find({
    userId: new mongoose.Types.ObjectId(req.userId),
  })
    .sort({ importance: -1, createdAt: -1 })
    .lean();

  res.json(memories);
});

memoriesRouter.delete(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Invalid ID" } });
      return;
    }

    await Memory.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.userId),
    });

    res.status(204).send();
  },
);

memoriesRouter.delete("/", async (req: Request, res: Response): Promise<void> => {
  await Memory.deleteMany({
    userId: new mongoose.Types.ObjectId(req.userId),
  });

  res.status(204).send();
});
