import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { processUserMessage } from "../services/ai/chatHandler.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

const createConvSchema = z.object({
  firstMessage: z.string().trim().optional(),
});

const postMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content is required"),
});

chatRouter.post(
  "/",
  validateBody(createConvSchema),
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user || (await User.findById(req.userId));
    if (!user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found" } });
      return;
    }

    const conversation = await Conversation.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      title: "New Conversation",
      lastMessageAt: new Date(),
      messageCount: 0,
    });

    const greetingText = `Hi ${user.name}, I'm here. How is your heart doing right now?`;
    const initialAssistantMsg = await Message.create({
      conversationId: conversation._id,
      userId: new mongoose.Types.ObjectId(req.userId),
      role: "assistant",
      content: greetingText,
      suggestion: null,
    });

    res.status(201).json({
      conversation,
      messages: [initialAssistantMsg],
      _id: conversation._id,
    });
  },
);

chatRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const conversations = await Conversation.find({
    userId: new mongoose.Types.ObjectId(req.userId),
  })
    .sort({ lastMessageAt: -1 })
    .lean();

  res.json(conversations);
});

chatRouter.get(
  "/:id/messages",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Invalid ID" } });
      return;
    }

    const convId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(req.userId);

    const conv = await Conversation.findOne({ _id: convId, userId });
    if (!conv) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const messages = await Message.find({ conversationId: convId, userId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  },
);

chatRouter.post(
  "/:id/messages",
  validateBody(postMessageSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Invalid ID" } });
      return;
    }

    const convId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(req.userId);

    const conversation = await Conversation.findOne({ _id: convId, userId });
    if (!conversation) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const user = req.user || (await User.findById(req.userId));
    if (!user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found" } });
      return;
    }

    const result = await processUserMessage({
      conversation,
      user,
      content: req.body.content,
    });

    res.status(201).json(result);
  },
);

chatRouter.patch(
  "/:id",
  validateBody(z.object({ title: z.string().trim().min(1) })),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Invalid ID" } });
      return;
    }

    const conv = await Conversation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(req.userId),
      },
      { $set: { title: req.body.title } },
      { new: true },
    );

    if (!conv) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    res.json(conv);
  },
);

chatRouter.delete(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Invalid ID" } });
      return;
    }

    const convId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(req.userId);

    await Message.deleteMany({ conversationId: convId, userId });
    await Conversation.deleteOne({ _id: convId, userId });

    res.status(204).send();
  },
);
