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

const VALID_CATEGORIES = new Set<string>([
  "life_event",
  "preference",
  "struggle",
  "goal",
  "person",
]);

async function callExtractionWithRetry(
  prompt: string,
  historyText: string,
): Promise<ExtractedMemory[]> {
  const executeCall = async () => {
    return await generateJSON<unknown>({
      system: prompt,
      history: [{ role: "user", text: historyText }],
      schema: MEMORY_EXTRACTION_SCHEMA,
    });
  };

  let raw: unknown;
  try {
    raw = await executeCall();
  } catch (err) {
    const msg = (err as Error)?.message || "";
    const isRateLimit =
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota");

    if (isRateLimit) {
      // Single retry with 2s delay on rate limit
      await new Promise((r) => setTimeout(r, 2000));
      raw = await executeCall();
    } else {
      throw err;
    }
  }

  // Gracefully handle array or object wrapping array
  if (Array.isArray(raw)) {
    return raw as ExtractedMemory[];
  }
  if (raw && typeof raw === "object") {
    for (const val of Object.values(raw)) {
      if (Array.isArray(val)) {
        return val as ExtractedMemory[];
      }
    }
  }

  return [];
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

    const extracted = await callExtractionWithRetry(prompt, conversationText);

    let savedCount = 0;
    if (Array.isArray(extracted) && extracted.length > 0) {
      for (const item of extracted) {
        if (item?.text && typeof item.text === "string" && item.text.trim()) {
          const cat = VALID_CATEGORIES.has(item.category)
            ? item.category
            : "preference";
          await Memory.create({
            userId: opts.userId,
            text: item.text.trim(),
            category: cat,
            sourceConversationId: opts.conversationId,
            importance: item.importance || 1,
          });
          savedCount++;
        }
      }
    }

    console.log(`memory extraction saved ${savedCount}`);
  } catch (err) {
    const e = err as Error;
    console.error(`Memory extraction failed: [${e.name}] ${e.message}`);
  }
}
