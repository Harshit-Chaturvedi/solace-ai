import mongoose from "mongoose";
import { Memory, type MemoryCategory } from "../../models/Memory.js";
import { generateJSON } from "./gemini.js";

const MEMORY_EXTRACTION_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      text: { type: "string" },
      category: {
        type: "string",
        enum: ["life_event", "preference", "struggle", "goal", "person"],
      },
      importance: { type: "number", minimum: 1, maximum: 3 },
    },
    required: ["text", "category", "importance"],
  },
};

interface ExtractedMemory {
  text: string;
  category: MemoryCategory;
  importance: number;
}

export async function extractAndSaveMemories(opts: {
  userId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  messages: Array<{ role: string; content: string }>;
}): Promise<void> {
  try {
    const existingMemories = await Memory.find({ userId: opts.userId })
      .limit(20)
      .lean();

    const existingList = existingMemories.map((m) => m.text).join("; ");
    const conversationText = opts.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `From these messages extract durable facts worth remembering about the user (life events, people, goals, preferences, struggles). Return a JSON array of objects with text, category, and importance (1-3). Return an empty array [] if there are no new personal facts worth storing. Do not duplicate these existing memories: "${existingList}".`;

    const extracted = await generateJSON<ExtractedMemory[]>({
      system: prompt,
      history: [{ role: "user", text: conversationText }],
      schema: MEMORY_EXTRACTION_SCHEMA,
    });

    if (Array.isArray(extracted) && extracted.length > 0) {
      for (const item of extracted) {
        if (item.text && item.category) {
          await Memory.create({
            userId: opts.userId,
            text: item.text,
            category: item.category,
            sourceConversationId: opts.conversationId,
            importance: item.importance || 1,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Memory extraction warning:", (err as Error)?.message);
  }
}
