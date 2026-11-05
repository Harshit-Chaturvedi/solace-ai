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
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn("Gemini AI generation warning/fallback:", (err as Error)?.message);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
