import mongoose from "mongoose";
import { type IUser } from "../../models/User.js";
import { Mood } from "../../models/Mood.js";
import { Memory } from "../../models/Memory.js";
import { Message } from "../../models/Message.js";
import { type IConversation } from "../../models/Conversation.js";
import { SOL_SYSTEM_PROMPT } from "./prompts.js";
import { formatLocalDate } from "../streak.js";

export interface ContextBundle {
  systemPrompt: string;
  history: Array<{ role: "user" | "model"; text: string }>;
}

export async function buildChatContext(
  user: IUser,
  conversation: IConversation,
): Promise<ContextBundle> {
  const userId = user._id as mongoose.Types.ObjectId;

  // 1. Last 7 moods formatted compactly
  const recentMoodDocs = await Mood.find({ userId })
    .sort({ createdAt: -1 })
    .limit(7)
    .lean();

  const recentMoodsStr = recentMoodDocs.length
    ? recentMoodDocs
        .map((m) => {
          const dayName = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            timeZone: user.timezone || "Asia/Kolkata",
          }).format(m.createdAt);
          const ems = m.emotions.length ? ` (${m.emotions.join(", ")})` : "";
          return `${dayName}: ${m.mood}${ems}`;
        })
        .join("; ")
    : "No recent moods recorded yet";

  // 2. Up to 15 memories if memoryEnabled
  let memoriesStr = "None yet";
  if (user.memoryEnabled) {
    const memoryDocs = await Memory.find({ userId })
      .sort({ importance: -1, createdAt: -1 })
      .limit(15)
      .lean();

    if (memoryDocs.length) {
      memoriesStr = memoryDocs.map((m) => `- ${m.text}`).join("\n");
    }
  }

  // 3. Current local date/time
  const now = new Date();
  const dateTimeStr = `${formatLocalDate(now, user.timezone)} ${now.toLocaleTimeString("en-US", { hour12: false, timeZone: user.timezone })}`;

  // 4. Fill system prompt
  const systemPrompt = SOL_SYSTEM_PROMPT
    .replace("{{companionTone}}", user.companionTone || "gentle")
    .replace("{{name}}", user.name || "Friend")
    .replace("{{goals}}", user.goals?.join(", ") || "General wellbeing")
    .replace("{{recentMoods}}", recentMoodsStr)
    .replace("{{memories}}", memoriesStr)
    .replace(
      "{{conversationSummary}}",
      conversation.summary || "Conversation just started",
    )
    .replace("{{dateTime}}", dateTimeStr);

  // 5. Newest 16 messages in chronological order
  const recentMessages = await Message.find({
    conversationId: conversation._id,
  })
    .sort({ createdAt: -1 })
    .limit(16)
    .lean();

  const history = recentMessages.reverse().map((m) => ({
    role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
    text: m.content,
  }));

  return {
    systemPrompt,
    history,
  };
}
