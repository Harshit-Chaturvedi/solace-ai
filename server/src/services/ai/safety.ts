export const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "marna chahta",
  "marna chahti",
  "marna",
  "jeena nahi",
  "khudkushi",
  "self harm",
  "cutting myself",
  "hang myself",
  "overdose",
];

export const CRISIS_SUPPORT_REPLY =
  "I hear how much pain you are in right now, and I care about your safety deeply. You don't have to carry this alone. Please reach out to someone who can help right away: call the Tele-MANAS helpline at 14416 (24x7, toll-free) or emergency services at 112.";

export function checkCrisis(text: string): {
  isCrisis: boolean;
  reply?: string;
} {
  const lower = text.toLowerCase();
  const matched = CRISIS_KEYWORDS.some((kw) => lower.includes(kw));

  if (matched) {
    return {
      isCrisis: true,
      reply: CRISIS_SUPPORT_REPLY,
    };
  }

  return { isCrisis: false };
}
