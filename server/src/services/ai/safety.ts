export const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "marna chahta",
  "marna chahti",
  "mar jaana chahta",
  "mar jana chahta",
  "jeena nahi chahta",
  "jeena nahi chahti",
  "jeena nahi",
  "khudkushi",
  "self harm",
  "cutting myself",
  "hang myself",
  "overdose",
  "sab khatam kar dena",
];

export const CRISIS_SUPPORT_REPLY =
  "Thank you for telling me. What you're carrying sounds really heavy, and you deserve support right now. Please call Tele-MANAS on 14416 (free, 24x7), or 112 if you are in immediate danger. Are you safe right now? I'm still here with you.";

const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid(e|al)\b/i,
  /\bkill myself\b/i,
  /\bend (my life|it all)\b/i,
  /\b(want|wanna) to die\b/i,
  /\bdon'?t want to (live|be here|exist)\b/i,
  /\bno reason to live\b/i,
  /\bbetter off dead\b/i,
  /\b(hurt|harm|cut) myself\b/i,
  /\bself[\s-]harm\b/i,
  /\boverdose(?! on (coffee|caffeine|tea|sugar|work))\b/i,
  /\bhang myself\b/i,
  /\bmarna\s+chaht[ai]\b/i,
  /\bmar\s+ja+na\s+chaht[ai]\b/i,
  /\bmar\s+ja+ung[ai]\b/i,
  /\bjeena\s+nahi\b/i,
  /\bkhudkushi\b/i,
  /\baatmhatya\b/i,
  /\bsuicide\s+kar\b/i,
  /\bkhud\s+ko\s+(khatam|maar)\b/i,
  /\bzindagi\s+khatam\b/i,
  /\bsab\s+khatam\s+kar\s+(dena|du|doon|dena chaht[ai])/i,
  /\u0906\u0924\u094d\u092e\u0939\u0924\u094d\u092f\u093e/i,
  /\u092e\u0930\u0928\u093e\s+\u091a\u093e\u0939\u0924[\u093e\u0940]/i,
  /\u091c\u0940\u0928\u093e\s+\u0928\u0939\u0940\u0902?\s+\u091a\u093e\u0939\u0924[\u093e\u0940]/i,
  /\u0916\u0941\u0926\s+\u0915\u094b\s+\u0916\u0924\u094d\u092e/i,
];

export function checkCrisis(text: string): {
  isCrisis: boolean;
  reply?: string;
} {
  const normalized = text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  const isCrisis = CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));

  if (isCrisis) {
    return {
      isCrisis: true,
      reply: CRISIS_SUPPORT_REPLY,
    };
  }

  return { isCrisis: false };
}
