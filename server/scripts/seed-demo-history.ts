/**
 * Demo-Data Seeding Script for Solace AI
 *
 * Scope: ONLY touches the demo user: demo@solace.app (and their associated records).
 * Does not touch or modify any real user accounts or records.
 *
 * Usage: cd server && npx tsx scripts/seed-demo-history.ts [--through-yesterday]
 * Flags: --through-yesterday  Seeds days -7..-1 (lastActiveDate yesterday) so live check-in makes streak 8.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { Mood, type MoodType } from "../src/models/Mood.js";
import { Activity } from "../src/models/Activity.js";
import { Conversation } from "../src/models/Conversation.js";
import { Message } from "../src/models/Message.js";
import { Memory } from "../src/models/Memory.js";
import { Reminder } from "../src/models/Reminder.js";

dotenv.config();

const DEMO_EMAIL = "demo@solace.app";
const DEMO_PASSWORD = "SolaceDemo123!";
const API_BASE = process.env.API_URL || "https://solace-ai-tq52.onrender.com/api/v1";

async function fetchWithRetry(url: string, opts?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try { return await fetch(url, opts); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Fetch failed");
}

async function seed() {
  const throughYesterday = process.argv.includes("--through-yesterday");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing from .env");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Target email: ${DEMO_EMAIL}`);
  console.log(`Mode: ${throughYesterday ? "Through Yesterday (days -7..-1)" : "Through Today (days -6..0)"}`);

  // Safely clean up existing demo records only
  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    const uid = existingUser._id;
    await Promise.all([
      Mood.deleteMany({ userId: uid }),
      Activity.deleteMany({ userId: uid }),
      Conversation.deleteMany({ userId: uid }),
      Message.deleteMany({ userId: uid }),
      Memory.deleteMany({ userId: uid }),
      Reminder.deleteMany({ userId: uid }),
      User.deleteOne({ _id: uid }),
    ]);
    console.log("Cleaned up previous demo user records.");
  }

  const now = new Date();
  const lastActiveDate = throughYesterday ? new Date(now.getTime() - 86400000) : now;
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({
    email: DEMO_EMAIL,
    passwordHash,
    name: "Harshit",
    timezone: "Asia/Kolkata",
    onboardingDone: true,
    companionTone: "gentle",
    goals: ["sleep better", "manage stress"],
    memoryEnabled: true,
    streak: { current: 7, longest: 7, lastActiveDate },
  });

  // 7 days of mood check-ins (okay, low, okay, good, good, great, good)
  const moods: Array<{ mood: MoodType; score: number; emotions: string[]; note?: string }> = [
    { mood: "okay", score: 3, emotions: ["tired"], note: "Long week starting" },
    { mood: "low", score: 2, emotions: ["anxious", "stressed"], note: "Exam stress today" },
    { mood: "okay", score: 3, emotions: ["tired", "hopeful"], note: "Slowly catching up" },
    { mood: "good", score: 4, emotions: ["calm", "hopeful"], note: "Went for a walk, felt lighter" },
    { mood: "good", score: 4, emotions: ["grateful", "calm"], note: "Quiet evening at home" },
    { mood: "great", score: 5, emotions: ["grateful", "hopeful"], note: "Good sleep last night" },
    { mood: "good", score: 4, emotions: ["calm", "grateful"], note: "Feeling grounded today" },
  ];

  for (let i = 0; i < 7; i++) {
    const dayOffset = throughYesterday ? 7 - i : 6 - i;
    const date = new Date(now.getTime() - dayOffset * 86400000);
    date.setHours(9, 30, 0, 0);
    const m = moods[i];
    await Mood.create({
      userId: user._id,
      mood: m.mood,
      score: m.score,
      emotions: m.emotions,
      note: m.note,
      source: "checkin",
      createdAt: date,
      updatedAt: date,
    });
  }

  // 5 breathing activities across different days (box, 4-7-8, calm)
  const activities = [
    { pattern: "box", minutes: 2, seconds: 120, offset: throughYesterday ? 6 : 5 },
    { pattern: "4-7-8", minutes: 3, seconds: 180, offset: throughYesterday ? 5 : 4 },
    { pattern: "calm", minutes: 1, seconds: 60, offset: throughYesterday ? 4 : 3 },
    { pattern: "box", minutes: 2, seconds: 120, offset: throughYesterday ? 3 : 2 },
    { pattern: "calm", minutes: 2, seconds: 120, offset: throughYesterday ? 2 : 1 },
  ];
  for (const act of activities) {
    const actDate = new Date(now.getTime() - act.offset * 86400000);
    actDate.setHours(15, 0, 0, 0);
    await Activity.create({
      userId: user._id,
      type: "breathing",
      durationSeconds: act.seconds,
      meta: { pattern: act.pattern, minutes: act.minutes },
      createdAt: actDate,
      updatedAt: actDate,
    });
  }

  // Conversation 1: Exam stress
  const conv1Date = new Date(now.getTime() - (throughYesterday ? 6 : 5) * 86400000);
  conv1Date.setHours(18, 0, 0, 0);
  const conv1 = await Conversation.create({
    userId: user._id,
    title: "Exam stress",
    messageCount: 6,
    lastMessageAt: new Date(conv1Date.getTime() + 600000),
    lastMessageText: "I'm so glad your shoulders feel lighter. Be gentle with yourself tonight—one small topic at a time.",
    createdAt: conv1Date,
  });
  const c1Turns = [
    { role: "user" as const, text: "I have a big exam coming up on Friday and my chest feels tight just thinking about it." },
    { role: "assistant" as const, text: "I hear you, Harshit. Exam pressure can feel really heavy. Take a slow breath with me. What part is weighing on you most?" },
    { role: "user" as const, text: "I feel like I haven't revised enough and I keep procrastinating because I'm stressed." },
    { role: "assistant" as const, text: "That's natural—when stress peaks, our brain freezes up. How about 2 minutes of box breathing together to steady your nervous system?" },
    { role: "user" as const, text: "Okay, let's do the box breathing. That actually helped loosen my shoulders." },
    { role: "assistant" as const, text: "I'm so glad your shoulders feel lighter. Be gentle with yourself tonight—one small topic at a time." },
  ];
  for (let m = 0; m < c1Turns.length; m++) {
    await Message.create({
      conversationId: conv1._id,
      userId: user._id,
      role: c1Turns[m].role,
      content: c1Turns[m].text,
      createdAt: new Date(conv1Date.getTime() + m * 60000),
    });
  }

  // Conversation 2: A good walk
  const conv2Date = new Date(now.getTime() - (throughYesterday ? 4 : 3) * 86400000);
  conv2Date.setHours(19, 30, 0, 0);
  const conv2 = await Conversation.create({
    userId: user._id,
    title: "A good walk",
    messageCount: 6,
    lastMessageAt: new Date(conv2Date.getTime() + 480000),
    lastMessageText: "Savor that peace. Hold on to this quiet feeling as you wind down tonight. You did something kind for yourself today.",
    createdAt: conv2Date,
  });
  const c2Turns = [
    { role: "user" as const, text: "I was feeling stuck earlier, but I just took a 30-minute walk outside." },
    { role: "assistant" as const, text: "Arre that's wonderful, Harshit! Fresh air has a way of resetting everything. How does your body feel right now?" },
    { role: "user" as const, text: "Much lighter. My thoughts were spiraling before, but the quiet evening helped calm me down." },
    { role: "assistant" as const, text: "That shift is so real. Walking lets the mind untangle without forcing it. Did anything special catch your eye outside?" },
    { role: "user" as const, text: "Just the cool breeze and some trees in the park. It felt peaceful." },
    { role: "assistant" as const, text: "Savor that peace. Hold on to this quiet feeling as you wind down tonight. You did something kind for yourself today." },
  ];
  for (let m = 0; m < c2Turns.length; m++) {
    await Message.create({
      conversationId: conv2._id,
      userId: user._id,
      role: c2Turns[m].role,
      content: c2Turns[m].text,
      createdAt: new Date(conv2Date.getTime() + m * 60000),
    });
  }

  // 4 memories
  const memories = [
    { category: "life_event" as const, text: "Has an exam on Friday", importance: 3 },
    { category: "preference" as const, text: "Feels calmer after walking", importance: 2 },
    { category: "struggle" as const, text: "Struggles to fall asleep before exams", importance: 2 },
    { category: "goal" as const, text: "Wants to build a daily breathing habit", importance: 3 },
  ];
  for (const mem of memories) {
    await Memory.create({ userId: user._id, category: mem.category, text: mem.text, importance: mem.importance });
  }

  // 1 reminder
  await Reminder.create({
    userId: user._id, type: "checkin", title: "Daily Check-in",
    body: "Take a moment to reflect with Sol", time: "20:00", days: [0, 1, 2, 3, 4, 5, 6], enabled: true,
  });

  console.log("Seeding complete. Disconnecting from database...");
  await mongoose.disconnect();

  // API Verification
  console.log(`\n--- Verifying Live API against ${API_BASE} ---`);
  try {
    const loginRes = await fetchWithRetry(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });
    const loginData = (await loginRes.json()) as any;
    const token = loginData?.token;
    console.log(`POST /auth/login: ${token ? "PASS" : "FAIL"}`);

    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      const homeData = (await (await fetchWithRetry(`${API_BASE}/home`, { headers })).json()) as any;
      console.log(`GET /home (streak.current === 7): ${homeData?.streak?.current === 7 ? "PASS" : `FAIL (${homeData?.streak?.current})`}`);

      const insData = (await (await fetchWithRetry(`${API_BASE}/insights?range=7`, { headers })).json()) as any;
      console.log(`GET /insights (7 mood points): ${insData?.moodSeries?.length === 7 ? "PASS" : `FAIL (${insData?.moodSeries?.length})`}`);
      console.log(`GET /insights (5 activity sessions): ${insData?.activitySummary?.totalSessions === 5 ? "PASS" : `FAIL (${insData?.activitySummary?.totalSessions})`}`);

      const convsData = (await (await fetchWithRetry(`${API_BASE}/conversations`, { headers })).json()) as any;
      console.log(`GET /conversations (count === 2): ${Array.isArray(convsData) && convsData.length === 2 ? "PASS" : `FAIL (${convsData?.length})`}`);

      const memsData = (await (await fetchWithRetry(`${API_BASE}/memories`, { headers })).json()) as any;
      console.log(`GET /memories (count === 4): ${Array.isArray(memsData) && memsData.length === 4 ? "PASS" : `FAIL (${memsData?.length})`}`);
    }
  } catch (err: any) {
    console.error("Live API verification request failed:", err?.message || err);
  }

  console.log("\n========================================================");
  console.log(`DEMO EMAIL:    ${DEMO_EMAIL}`);
  console.log(`DEMO PASSWORD: ${DEMO_PASSWORD}`);
  console.log("NOTE: This demo account is seeded in the production Atlas database.");
  console.log("========================================================\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
