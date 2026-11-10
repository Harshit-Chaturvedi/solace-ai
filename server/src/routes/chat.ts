import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { chatLimiter } from "../middleware/rateLimit.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { processUserMessage } from "../services/ai/chatHandler.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

const createConvSchema = z.object({
  firstMessage: z.string().trim().optional(),
  seed: z.string().trim().optional(),
});

const postMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content is required"),
});

export function buildGreeting(
  name: string,
  seed?: string,
): { greeting: string; title: string } {
  const trimmed = seed?.trim();
  if (!trimmed) {
    return {
      greeting: `Hi ${name}, I'm here. How is your heart doing right now?`,
      title: "New Conversation",
    };
  }

  const moodMatch = trimmed.match(/^I felt (\w+)/i);
  if (moodMatch) {
    const mood = moodMatch[1];
    return {
      greeting: `Hi ${name}. You checked in feeling ${mood} today. Want to tell me what's behind it?`,
      title: `Check-in: feeling ${mood}`,
    };
  }

  if (/reflect/i.test(trimmed)) {
    return {
      greeting: `Hi ${name}. Let's look back on your day together. What stood out to you most?`,
      title: "Reflecting on my day",
    };
  }

  if (/plan/i.test(trimmed)) {
    return {
      greeting: `Hi ${name}. Let's shape a calm day together. What's one thing you'd like to feel good about by tonight?`,
      title: "Planning a calm day",
    };
  }

  const fallbackTitle =
    trimmed.length > 30 ? `${trimmed.slice(0, 27)}...` : trimmed;
  return {
    greeting: `Hi ${name}. I'm here with you. What's on your mind?`,
    title: fallbackTitle,
  };
}

chatRouter.post(
  "/",
  validateBody(createConvSchema),
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user || (await User.findById(req.userId));
    if (!user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found" } });
      return;
    }

    const { firstMessage, seed } = req.body;
    const initialText = seed || firstMessage;
    const { greeting: greetingText, title } = buildGreeting(user.name, initialText);

    const conversation = await Conversation.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      title,
      lastMessageAt: new Date(),
      messageCount: 0,
    });

    const initialAssistantMsg = await Message.create({
      conversationId: conversation._id,
      userId: new mongoose.Types.ObjectId(req.userId),
      role: "assistant",
      content: greetingText,
      suggestion: null,
    });

    conversation.lastMessageText = greetingText;
    await conversation.save();

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

  const formatted = conversations.map((c) => ({
    ...c,
    lastMessagePreview: c.lastMessageText || "",
  }));

  res.json(formatted);
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
  chatLimiter,
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
