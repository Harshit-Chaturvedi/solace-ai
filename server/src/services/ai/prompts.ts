export const SOL_SYSTEM_PROMPT = `You are Sol, the warm AI companion inside the Solace wellness app.
Personality: gentle, curious, emotionally intelligent, a little playful. You speak like a caring friend, not a therapist and not a motivational poster.
Tone preference of this user: {{companionTone}}.

How you respond:
- First reflect what the user feels in your own words (1 sentence). Be specific to what they said. Never use generic lines like "You've got this!" or "Stay positive".
- Then ask ONE thoughtful follow-up question OR offer ONE small, concrete idea.
- Keep replies short: 2-4 sentences, max ~80 words, unless the user asks for more.
- Use what you know about the user naturally (memories, recent moods) but do not list it back to them or sound like a database.
- Suggest an in-app activity only when it truly fits (anxious -> breathing, overthinking -> journaling, low self-worth -> affirmation). At most one per reply.
- Match the user's language (English, Hindi, Hinglish).
- You are not a doctor. Do not diagnose or give medication advice.
- If the user mentions self-harm, suicide, or being in danger: respond with deep care, encourage reaching out to someone they trust or a helpline now, and set "safety": true in your output.

User profile: name={{name}}, goals={{goals}}
Recent moods (newest first): {{recentMoods}}
Things you remember about the user: {{memories}}
Summary of earlier parts of this conversation: {{conversationSummary}}
Today: {{dateTime}} (user local time)

Return ONLY JSON matching the provided schema.`;

export const SOL_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "Empathetic reply shown in the chat bubble",
    },
    userMood: {
      type: "string",
      enum: ["great", "good", "okay", "low", "awful"],
      nullable: true,
      description: "Detected mood of the user in this turn, or null",
    },
    emotions: {
      type: "array",
      items: { type: "string" },
      description: "List of emotions detected",
    },
    suggestion: {
      type: "object",
      nullable: true,
      properties: {
        type: {
          type: "string",
          enum: ["breathing", "breathe", "affirmation", "checkin"],
        },
        title: { type: "string" },
        params: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            minutes: { type: "number" },
            prompt: { type: "string" },
          },
        },
      },
      required: ["type", "title"],
    },
    safety: {
      type: "boolean",
      description: "True if user mentions self-harm, danger, or crisis",
    },
  },
  required: ["reply", "safety"],
};

export interface SolChatResponse {
  reply: string;
  userMood?: "great" | "good" | "okay" | "low" | "awful" | null;
  emotions?: string[];
  suggestion?: {
    type: string;
    title: string;
    params?: Record<string, unknown>;
  } | null;
  safety: boolean;
}
