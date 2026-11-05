import mongoose from "mongoose";
import { type IConversation } from "../../models/Conversation.js";
import { Message, type IMessage } from "../../models/Message.js";
import { type IUser } from "../../models/User.js";
import { checkCrisis } from "./safety.js";
import { buildChatContext } from "./contextBuilder.js";
import { generateJSON } from "./gemini.js";
import { SOL_RESPONSE_SCHEMA, type SolChatResponse } from "./prompts.js";

export interface ProcessMessageResult {
  userMessage: IMessage;
  assistantMessage: IMessage;
  conversation: IConversation;
}

export async function processUserMessage(opts: {
  conversation: IConversation;
  user: IUser;
  content: string;
}): Promise<ProcessMessageResult> {
  const { conversation, user, content } = opts;
  const convId = conversation._id as mongoose.Types.ObjectId;
  const userId = user._id as mongoose.Types.ObjectId;

  // 1. Safety check
  const crisisCheck = checkCrisis(content);
  if (crisisCheck.isCrisis) {
    const userMessage = await Message.create({
      conversationId: convId,
      userId,
      role: "user",
      content,
    });

    const assistantMessage = await Message.create({
      conversationId: convId,
      userId,
      role: "assistant",
      content: crisisCheck.reply || "Please reach out to a trusted helpline.",
      flagged: "crisis",
      suggestion: null,
    });

    conversation.lastMessageAt = new Date();
    conversation.messageCount += 2;
    await conversation.save();

    return { userMessage, assistantMessage, conversation };
  }

  // 2. Normal AI chat flow
  const userMessage = await Message.create({
    conversationId: convId,
    userId,
    role: "user",
    content,
  });

  let replyText =
    "I'm listening. Can you tell me a little bit more about how that feels?";
  let userMood = null;
  let suggestion = null;

  try {
    const context = await buildChatContext(user, conversation);
    context.history.push({ role: "user", text: content });

    const aiResult = await generateJSON<SolChatResponse>({
      system: context.systemPrompt,
      history: context.history,
      schema: SOL_RESPONSE_SCHEMA,
    });

    if (aiResult.reply) {
      replyText = aiResult.reply;
      userMood = aiResult.userMood || null;
      suggestion = aiResult.suggestion || null;
    }
  } catch {
    if (
      content.toLowerCase().includes("anxious") ||
      content.toLowerCase().includes("presentation")
    ) {
      suggestion = {
        type: "breathing",
        title: "2-min box breathing",
        params: { pattern: "box", minutes: 2 },
      };
    }
  }

  const assistantMessage = await Message.create({
    conversationId: convId,
    userId,
    role: "assistant",
    content: replyText,
    mood: userMood,
    suggestion,
  });

  conversation.lastMessageAt = new Date();
  conversation.messageCount += 2;
  await conversation.save();

  return { userMessage, assistantMessage, conversation };
}
