import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function generateJSON<T>(opts: {
  system: string;
  history: Array<{ role: "user" | "model"; text: string }>;
  schema: object;
  temperature?: number;
}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const contents = opts.history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: opts.system,
        temperature: opts.temperature ?? 0.7,
        responseMimeType: "application/json",
        responseSchema: opts.schema,
        abortSignal: controller.signal,
      },
    });

    const rawText = (response.text || "").trim();
    if (!rawText) {
      return {} as T;
    }
    try {
      return JSON.parse(rawText) as T;
    } catch {
      const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch {
          // fall through
        }
      }
      return {} as T;
    }
  } catch (err) {
    console.warn("Gemini AI generation warning/fallback:", (err as Error)?.message);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
