import { generateJSON } from "../src/services/ai/gemini.js";
import {
  SOL_RESPONSE_SCHEMA,
  SOL_SYSTEM_PROMPT,
  type SolChatResponse,
} from "../src/services/ai/prompts.js";

async function runTest() {
  console.log("Testing Sol Gemini integration...");

  const system = SOL_SYSTEM_PROMPT.replace("{{companionTone}}", "gentle")
    .replace("{{name}}", "Test User")
    .replace("{{goals}}", "reduce stress")
    .replace("{{recentMoods}}", "Fri: low (anxious)")
    .replace("{{memories}}", "- Has an upcoming interview")
    .replace("{{conversationSummary}}", "Conversation started")
    .replace("{{dateTime}}", new Date().toISOString());

  try {
    const res = await generateJSON<SolChatResponse>({
      system,
      history: [
        {
          role: "user",
          text: "I am nervous about my interview tomorrow and can't sleep.",
        },
      ],
      schema: SOL_RESPONSE_SCHEMA,
    });

    console.log("Response received from Sol:");
    console.log("Reply:", res.reply);
    console.log("Detected Mood:", res.userMood);
    console.log("Suggestion:", res.suggestion);
    console.log("Safety:", res.safety);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

if (process.env.RUN_TEST === "1") {
  runTest().catch(console.error);
}

export { runTest };
