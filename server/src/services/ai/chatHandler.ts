import mongoose from "mongoose";
import { Conversation, type IConversation } from "../../models/Conversation.js";
import { Message, type IMessage } from "../../models/Message.js";
import { type IUser } from "../../models/User.js";
import { Mood, moodScoreMap } from "../../models/Mood.js";
import { checkCrisis } from "./safety.js";
import { buildChatContext } from "./contextBuilder.js";
import { generateJSON } from "./gemini.js";
import { extractAndSaveMemories } from "./memoryExtractor.js";
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
    conversation.lastMessageText = assistantMessage.content;
    conversation.messageCount += 2;
    await conversation.save();

    return { userMessage, assistantMessage, conversation };
  }

  // 2. Normal AI chat flow - save user turn
  const userMessage = await Message.create({
    conversationId: convId,
    userId,
    role: "user",
    content,
  });

  let replyText =
    "I'm listening. Can you tell me a little bit more about what's on your mind?";
  let userMood = null;
  let suggestion = null;
  let isFlaggedCrisis = false;

  try {
    const context = await buildChatContext(user, conversation);

    const aiResult = await generateJSON<SolChatResponse>({
      system: context.systemPrompt,
      history: context.history,
      schema: SOL_RESPONSE_SCHEMA,
    });

    if (aiResult.reply) {
      replyText = aiResult.reply;
      userMood = aiResult.userMood || null;
      suggestion = aiResult.suggestion || null;
      if (aiResult.safety) {
        isFlaggedCrisis = true;
      }
    }
  } catch {
    // Generic fallback reply without hardcoded symptoms
    replyText =
      "I'm here with you right now. Take your time, whenever you feel ready to share more.";
  }

  const assistantMessage = await Message.create({
    conversationId: convId,
    userId,
    role: "assistant",
    content: replyText,
    mood: userMood,
    suggestion,
    flagged: isFlaggedCrisis ? "crisis" : null,
  });

  // Log mood to insights if AI detected user mood
  if (userMood && moodScoreMap[userMood]) {
    Mood.create({
      userId,
      mood: userMood,
      score: moodScoreMap[userMood],
      source: "chat",
      note: `Chat with Sol: ${conversation.title}`,
      solReply: replyText,
    }).catch((err) => {
      console.warn("Mood log error:", (err as Error)?.message);
    });
  }

  // 3. Update conversation state
  conversation.lastMessageAt = new Date();
  conversation.lastMessageText = assistantMessage.content;
  conversation.messageCount += 2;
  const userTurnCount = Math.floor(conversation.messageCount / 2);

  // Title generation strictly on turn 1
  if (
    userTurnCount === 1 &&
    (conversation.title === "New Conversation" || !conversation.title)
  ) {
    const fallbackTitle =
      content.length > 40 ? `${content.slice(0, 37)}...` : content;
    conversation.title = fallbackTitle;

    generateJSON<{ title: string }>({
      system:
        "Generate a gentle 3-5 word title summarizing this message for a wellness chat. Return JSON with 'title'.",
      history: [{ role: "user", text: content }],
      schema: {
        type: "object",
        properties: { title: { type: "string" } },
        required: ["title"],
      },
    })
      .then(async (res) => {
        if (res?.title) {
          await Conversation.findByIdAndUpdate(convId, {
            title: res.title.trim().replace(/^["']|["']$/g, ""),
          });
        }
      })
      .catch(() => {});
  }

  await conversation.save();

  // 4. Memory extraction on turns 3, 6, and every 6th turn
  const shouldExtract =
    user.memoryEnabled &&
    (userTurnCount === 3 ||
      userTurnCount === 6 ||
      (userTurnCount > 6 && userTurnCount % 6 === 0));

  if (!user.memoryEnabled) {
    console.log("Memory extraction skipped: memoryEnabled is false");
  } else if (!shouldExtract) {
    console.log(
      `Memory extraction skipped: turn ${userTurnCount} is not an extraction turn (runs on turns 3, 6, then every 6th turn)`,
    );
  } else {
    Message.find({ conversationId: convId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
      .then((msgs) => {
        const chronological = msgs.reverse().map((m) => ({
          role: m.role,
          content: m.content,
        }));
        return extractAndSaveMemories({
          userId,
          conversationId: convId,
          messages: chronological,
        });
      })
      .catch((err) => {
        const e = err as Error;
        console.error(`Memory extraction error: [${e.name}] ${e.message}`);
      });
  }

  return { userMessage, assistantMessage, conversation };
}
