#!/usr/bin/env node
// Static referee for Solace phases. Usage: node scripts/verify.mjs <phase|all>
// Prints PASS/FAIL lines. Exit code 1 if any FAIL. Zero dependencies.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv[2] ?? "all";
const phases = arg === "all" ? Array.from({ length: 15 }, (_, i) => i) : [Number(arg)];
if (phases.some((p) => !Number.isInteger(p) || p < 0 || p > 14)) {
  console.error("usage: verify.mjs <0-14|all>");
  process.exit(2);
}

let fails = 0;
const ok = (m) => console.log(`PASS ${m}`);
const bad = (m) => { fails++; console.log(`FAIL ${m}`); };

const abs = (p) => path.join(ROOT, p);
const exists = (p) => fs.existsSync(abs(p));
const read = (p) => (exists(p) ? fs.readFileSync(abs(p), "utf8") : "");

function walk(dir, exts = [".ts", ".tsx"]) {
  const out = [];
  const full = abs(dir);
  if (!fs.existsSync(full)) return out;
  for (const e of fs.readdirSync(full, { withFileTypes: true })) {
    if (["node_modules", "dist", ".expo", "build", ".git"].includes(e.name)) continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(rel, exts));
    else if (exts.some((x) => e.name.endsWith(x))) out.push(rel);
  }
  return out;
}

const mustExist = (files, label) => {
  for (const f of files) exists(f) ? ok(`${label}: ${f}`) : bad(`${label}: missing ${f}`);
};
const mustMatch = (file, re, label) => {
  re.test(read(file)) ? ok(`${label}`) : bad(`${label} (expected in ${file}: ${re})`);
};
const anyFileMatches = (dir, re, label) => {
  const hit = walk(dir).some((f) => re.test(read(f)));
  hit ? ok(label) : bad(`${label} (no file under ${dir} matches ${re})`);
};

// ---------- phase checks ----------
const checks = {
  0() {
    mustExist(["app/package.json", "server/package.json", "server/src/index.ts", "server/src/app.ts",
      "server/src/config/env.ts", "server/src/db.ts", "server/.env.example", "app/.env.example",
      ".gitignore", "PLAN.md", "AGENTS.md"], "p0");
    mustMatch(".gitignore", /\.env/, "p0: .gitignore ignores .env");
    mustMatch(".gitignore", /node_modules/, "p0: .gitignore ignores node_modules");
    mustMatch("server/src/config/env.ts", /zod/, "p0: env parsed with zod");
    for (const k of ["PORT", "MONGODB_URI", "JWT_SECRET", "GEMINI_API_KEY", "GEMINI_MODEL"])
      mustMatch("server/.env.example", new RegExp(k), `p0: .env.example has ${k}`);
    mustMatch("app/.env.example", /EXPO_PUBLIC_API_URL/, "p0: app .env.example has API url");
    anyFileMatches("server/src", /\/health|"\/health"/, "p0: /health route exists");
    mustMatch("server/package.json", /"dev"\s*:\s*"tsx watch/, "p0: server dev script");
  },
  1() {
    mustExist(["app/src/theme/colors.ts", "app/src/theme/typography.ts", "app/src/theme/spacing.ts",
      "app/src/theme/index.ts", "app/src/lib/haptics.ts"], "p1");
    for (const t of ["#FBF8F4", "#7C6FD6", "#2E2A47", "#9ED9C3", "#FFC9A8"])
      mustMatch("app/src/theme/colors.ts", new RegExp(t, "i"), `p1: colour token ${t}`);
    for (const c of ["Screen", "Text", "Button", "Card", "Input", "Chip", "Skeleton", "EmptyState"])
      anyFileMatches("app/src/components/ui", new RegExp(`export (default )?(function|const) ${c}\\b|export \\{[^}]*\\b${c}\\b`), `p1: ui/${c}`);
    mustMatch("app/app/_layout.tsx", /Fraunces/, "p1: Fraunces loaded");
    mustMatch("app/app/_layout.tsx", /Nunito/, "p1: Nunito loaded");
    for (const fn of ["tap", "select", "success", "warn"])
      mustMatch("app/src/lib/haptics.ts", new RegExp(`\\b${fn}\\b`), `p1: haptics.${fn}`);
  },
  2() {
    mustExist(["app/src/components/Sol/SolMascot.tsx"], "p2");
    for (const e of ["happy", "calm", "concerned", "thinking", "sleepy", "excited"])
      anyFileMatches("app/src/components/Sol", new RegExp(`['"]${e}['"]`), `p2: expression ${e}`);
    anyFileMatches("app/src/components/Sol", /react-native-svg/, "p2: uses react-native-svg");
    anyFileMatches("app/src/components/Sol", /react-native-reanimated/, "p2: uses reanimated");
    anyFileMatches("app/src/components/Sol", /TypingSol/, "p2: TypingSol exported");
  },
  3() {
    mustExist(["server/src/models/User.ts", "server/src/routes/auth.ts", "server/src/routes/me.ts",
      "server/src/middleware/auth.ts", "server/src/middleware/validate.ts", "server/src/middleware/error.ts"], "p3");
    mustMatch("server/src/models/User.ts", /select:\s*false/, "p3: passwordHash select:false");
    mustMatch("server/src/routes/auth.ts", /bcrypt/, "p3: bcrypt used");
    mustMatch("server/src/routes/auth.ts", /30d/, "p3: JWT 30d");
    anyFileMatches("server/src", /express-rate-limit|rateLimit/, "p3: rate limit present");
    anyFileMatches("server/src/routes", /delete\(["']\/me["']|\.delete\(\s*["']\/["']/, "p3: DELETE /me route");
    mustExist(["server/requests.http"], "p3");
  },
  4() {
    mustExist(["app/src/api/client.ts", "app/src/store/auth.ts", "app/app/index.tsx"], "p4");
    mustMatch("app/src/store/auth.ts", /zustand/, "p4: zustand store");
    mustMatch("app/src/store/auth.ts", /expo-secure-store|SecureStore/, "p4: token in SecureStore");
    mustMatch("app/src/api/client.ts", /EXPO_PUBLIC_API_URL/, "p4: client uses EXPO_PUBLIC_API_URL");
    mustMatch("app/src/api/client.ts", /Bearer/, "p4: client sends Bearer token");
    mustMatch("app/src/api/client.ts", /ApiError/, "p4: ApiError class");
    mustMatch("app/app/_layout.tsx", /QueryClientProvider/, "p4: react-query provider");
    mustExist(["app/app/(onboarding)/index.tsx", "app/app/(auth)/login.tsx", "app/app/(auth)/signup.tsx",
      "app/app/(auth)/profile-setup.tsx"], "p4");
    anyFileMatches("app/app", /onboardingSeen/, "p4: onboardingSeen remembered");
  },
  5() {
    mustExist(["app/app/(tabs)/_layout.tsx", "app/app/(tabs)/home.tsx", "server/src/routes/home.ts"], "p5");
    anyFileMatches("app/app", /useQuery/, "p5: react-query used on Home");
    mustMatch("app/app/(tabs)/home.tsx", /Skeleton/, "p5: Home has skeleton");
    mustMatch("app/app/(tabs)/home.tsx", /RefreshControl|refreshing/, "p5: pull to refresh");
    anyFileMatches("app/app", /\/checkin/, "p5: check-in route linked");
  },
  6() {
    mustExist(["server/src/models/Mood.ts", "server/src/services/streak.ts", "server/src/routes/mood.ts",
      "app/app/checkin.tsx"], "p6");
    mustMatch("server/src/services/streak.ts", /timezone|timeZone/i, "p6: streak uses timezone");
    mustMatch("server/src/services/streak.ts", /longest/, "p6: longest streak tracked");
    mustMatch("app/app/checkin.tsx", /haptic|select\(|success\(/i, "p6: check-in haptics");
  },
  7() {
    mustExist(["server/src/services/ai/gemini.ts", "server/src/services/ai/prompts.ts",
      "server/src/services/ai/contextBuilder.ts", "server/src/services/ai/safety.ts",
      "server/src/services/ai/memoryExtractor.ts", "server/src/models/Conversation.ts",
      "server/src/models/Message.ts", "server/src/models/Memory.ts", "server/src/routes/chat.ts",
      "server/src/routes/memories.ts", "server/scripts/chatTest.ts"], "p7");
    mustMatch("server/src/services/ai/gemini.ts", /responseSchema/, "p7: structured output schema");
    mustMatch("server/src/services/ai/gemini.ts", /timeout|AbortController|Promise\.race/i, "p7: Gemini timeout");
    mustMatch("server/src/services/ai/safety.ts", /kill myself/i, "p7: safety keywords EN");
    mustMatch("server/src/services/ai/safety.ts", /marna|jeena/i, "p7: safety keywords Hinglish");
    mustMatch("server/src/services/ai/prompts.ts", /Sol/, "p7: Sol prompt");
    mustMatch("server/src/services/ai/contextBuilder.ts", /memoryEnabled/, "p7: memory consent respected");
    const leaks = walk("app").filter((f) => /GEMINI|genai|AIza/i.test(read(f)));
    leaks.length ? bad(`p7: Gemini reference inside app: ${leaks.join(", ")}`) : ok("p7: no Gemini key/SDK in app");
  },
  8() {
    mustExist(["app/src/api/chat.ts", "app/app/chat/[id].tsx", "app/app/(tabs)/chat/index.tsx"], "p8");
    for (const c of ["MessageBubble", "ActivityCard", "SupportCard", "Composer", "TypingSol"])
      anyFileMatches("app/src", new RegExp(c), `p8: ${c} exists`);
    anyFileMatches("app", /tel:14416/, "p8: Tele-MANAS tel link");
    anyFileMatches("app", /tel:112/, "p8: 112 tel link");
    anyFileMatches("app", /inverted/, "p8: inverted FlatList");
    anyFileMatches("app", /Swipeable|ReanimatedSwipeable/, "p8: swipe to delete");
  },
  9() {
    mustExist(["app/app/breathe.tsx", "app/app/affirmation.tsx", "server/src/routes/activities.ts"], "p9");
    for (const p of ["box", "478", "calm"]) mustMatch("app/app/breathe.tsx", new RegExp(p), `p9: pattern ${p}`);
    mustMatch("app/app/breathe.tsx", /useLocalSearchParams/, "p9: reads route params");
    mustMatch("app/app/breathe.tsx", /keep-awake|useKeepAwake/, "p9: keeps screen awake");
    mustMatch("app/app/breathe.tsx", /activities/, "p9: records activity");
  },
  10() {
    if (!exists("app/app/journal.tsx") && !exists("server/src/routes/journals.ts"))
      return console.log("SKIP p10: optional phase not started");
    mustExist(["app/app/journal.tsx", "server/src/routes/journals.ts", "server/src/models/Journal.ts"], "p10");
  },
  11() {
    mustExist(["app/src/lib/notifications.ts", "app/app/reminders.tsx", "server/src/models/Reminder.ts",
      "server/src/routes/reminders.ts"], "p11");
    const n = "app/src/lib/notifications.ts";
    mustMatch(n, /setNotificationChannelAsync/, "p11: Android channel");
    mustMatch(n, /cancelAllScheduledNotificationsAsync/, "p11: syncReminders cancels first");
    mustMatch(n, /scheduleNotificationAsync/, "p11: schedules notifications");
    mustMatch(n, /url/, "p11: notification carries data.url");
    mustMatch("app/app/_layout.tsx", /setNotificationHandler|notifications/, "p11: foreground handler wired");
    mustMatch("app/app/_layout.tsx", /getLastNotificationResponseAsync|useLastNotificationResponse/, "p11: cold-start tap handled");
    mustMatch("app/app/_layout.tsx", /addNotificationResponseReceivedListener|useLastNotificationResponse/, "p11: tap listener");
    mustMatch("app/app.json", /expo-notifications/, "p11: plugin in app.json");
  },
  12() {
    mustExist(["app/app/memories.tsx", "app/app/(tabs)/insights.tsx", "app/app/(tabs)/profile.tsx",
      "server/src/routes/insights.ts"], "p12");
    mustMatch("app/app/memories.tsx", /memoryEnabled/, "p12: memory toggle");
    anyFileMatches("app/app", /DELETE|method:\s*["']DELETE["']|\.delete\(/i, "p12: delete calls in app");
    mustMatch("app/app/(tabs)/profile.tsx", /14416/, "p12: helpline on profile");
    mustMatch("app/app/(tabs)/profile.tsx", /not a medical|medical or emergency/i, "p12: disclaimer on profile");
  },
  13() {
    if (exists("app/app/dev-kit.tsx")) bad("p13: dev-kit route still present");
    else ok("p13: dev-kit removed");
    const logs = walk("app/app").concat(walk("app/src")).filter((f) => /console\.log\(/.test(read(f)));
    logs.length ? bad(`p13: console.log in ${logs.join(", ")}`) : ok("p13: no console.log in app");
    const slogs = walk("server/src").filter((f) => /console\.log\(.*(content|password|token)/i.test(read(f)));
    slogs.length ? bad(`p13: server logs sensitive data in ${slogs.join(", ")}`) : ok("p13: no sensitive server logs");
    anyFileMatches("app", /EmptyState/, "p13: empty states used");
    anyFileMatches("app", /netinfo|NetInfo/, "p13: offline banner");
    anyFileMatches("app", /accessibilityLabel/, "p13: accessibility labels");
    mustMatch("app/app.json", /icon/, "p13: app icon configured");
  },
  14() {
    mustExist(["app/eas.json"], "p14");
    mustMatch("app/eas.json", /"buildType"\s*:\s*"apk"/, "p14: preview builds APK");
    mustMatch("app/eas.json", /EXPO_PUBLIC_API_URL/, "p14: API url in eas env");
    mustMatch("app/eas.json", /https:\/\//, "p14: https API url");
    anyFileMatches("app/app", /Waking Sol up/, "p14: cold-start 'Waking Sol up' message");
    console.log("MANUAL p14: deploy to Render, run eas build, install APK, record video");
  },
};

// ---------- global source rules (run once phases >= 1 exist) ----------
function globalRules(maxPhase) {
  if (maxPhase >= 1) {
    const screens = walk("app/app").concat(walk("app/src/components"));
    const hexHits = screens.filter((f) => /#[0-9a-fA-F]{3,8}\b/.test(read(f).replace(/\/\/.*$/gm, "")));
    hexHits.length ? bad(`global: hard-coded hex colours in ${hexHits.join(", ")}`) : ok("global: no hex literals outside theme");
  }
  const fetchHits = walk("app/app").concat(walk("app/src")).filter(
    (f) => !f.endsWith(path.join("api", "client.ts")) && /\bfetch\(/.test(read(f)));
  fetchHits.length ? bad(`global: raw fetch() outside api/client.ts in ${fetchHits.join(", ")}`) : ok("global: all HTTP via api client");
  const big = walk("app/app").concat(walk("app/src"), walk("server/src")).filter(
    (f) => read(f).split("\n").length > 250);
  big.length ? bad(`global: files over 250 lines: ${big.join(", ")}`) : ok("global: files <= 250 lines");
  const keyLeak = walk("app", [".ts", ".tsx", ".json", ".js"]).filter((f) => /AIza[0-9A-Za-z_-]{20,}/.test(read(f)));
  keyLeak.length ? bad(`global: API key-like string in ${keyLeak.join(", ")}`) : ok("global: no API keys in app");
  const tracked = ["server/.env", "app/.env"].filter((f) => exists(f));
  if (tracked.length && exists(".git")) {
    const gi = read(".gitignore");
    /\.env/.test(gi) ? ok("global: .env files are gitignored") : bad("global: .env present but not gitignored");
  }
  const anyHits = walk("app/app").concat(walk("app/src"), walk("server/src")).filter((f) => {
    return read(f).split("\n").some((l, i, a) => /:\s*any\b|as any\b|<any>/.test(l) && !/\/\/|\/\*/.test(l) && !/\/\//.test(a[i - 1] ?? ""));
  });
  anyHits.length ? bad(`global: uncommented 'any' in ${anyHits.join(", ")}`) : ok("global: no uncommented any");
  const strict = read("app/tsconfig.json") + read("server/tsconfig.json");
  if (strict) /"strict"\s*:\s*true/.test(read("server/tsconfig.json")) || !exists("server/tsconfig.json")
    ? ok("global: server tsconfig strict") : bad("global: server tsconfig not strict");
}

for (const p of phases) {
  console.log(`--- phase ${p} ---`);
  checks[p]();
}
globalRules(Math.max(...phases));

if (fails) {
  console.log(`\nVERIFY FAILED: ${fails} problem(s). Fix the root cause and re-run.`);
  process.exit(1);
}
console.log("\nVERIFY OK");
