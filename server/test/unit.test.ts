import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateNewStreak,
  formatLocalDate,
  type StreakState,
} from "../src/services/streak.js";
import { checkCrisis } from "../src/services/ai/safety.js";
import { buildGreeting } from "../src/routes/chat.js";

test("Streak - first check-in starts at 1", () => {
  const result = calculateNewStreak(undefined, "Asia/Kolkata", new Date());
  assert.equal(result.current, 1);
  assert.equal(result.longest, 1);
});

test("Streak - same day check-in preserves streak", () => {
  const now = new Date("2026-11-07T10:00:00.000Z");
  const prev: StreakState = {
    current: 3,
    longest: 5,
    lastActiveDate: new Date("2026-11-07T06:00:00.000Z"),
  };
  const result = calculateNewStreak(prev, "Asia/Kolkata", now);
  assert.equal(result.current, 3);
  assert.equal(result.longest, 5);
});

test("Streak - consecutive day increments streak", () => {
  const now = new Date("2026-11-07T10:00:00.000Z");
  const yesterday = new Date("2026-11-06T10:00:00.000Z");
  const prev: StreakState = {
    current: 4,
    longest: 4,
    lastActiveDate: yesterday,
  };
  const result = calculateNewStreak(prev, "Asia/Kolkata", now);
  assert.equal(result.current, 5);
  assert.equal(result.longest, 5);
});

test("Streak - missed day resets current to 1 but keeps longest", () => {
  const now = new Date("2026-11-07T10:00:00.000Z");
  const twoDaysAgo = new Date("2026-11-04T10:00:00.000Z");
  const prev: StreakState = {
    current: 7,
    longest: 10,
    lastActiveDate: twoDaysAgo,
  };
  const result = calculateNewStreak(prev, "Asia/Kolkata", now);
  assert.equal(result.current, 1);
  assert.equal(result.longest, 10);
});

test("Streak - timezone boundary formatting", () => {
  // Midnight UTC on Nov 7 is already 5:30 AM in Asia/Kolkata
  const date = new Date("2026-11-06T20:00:00.000Z");
  const kolkataDate = formatLocalDate(date, "Asia/Kolkata");
  const utcDate = formatLocalDate(date, "UTC");
  assert.equal(kolkataDate, "2026-11-07");
  assert.equal(utcDate, "2026-11-06");
});

test("Safety - benign phrases are NOT flagged", () => {
  const benign1 = checkCrisis("tension mein marna padega");
  const benign2 = checkCrisis("overdose on coffee lol");
  const benign3 = checkCrisis("This workout is killing me haha");
  const benign4 = checkCrisis("this deadline is killing me");

  assert.equal(benign1.isCrisis, false);
  assert.equal(benign2.isCrisis, false);
  assert.equal(benign3.isCrisis, false);
  assert.equal(benign4.isCrisis, false);
});

test("Safety - crisis phrases ARE flagged", () => {
  const c1 = checkCrisis("I don't want to be here anymore");
  const c2 = checkCrisis("Sab khatam kar dena chahta hoon");
  const c3 = checkCrisis("jeena nahi chahta");
  const c4 = checkCrisis("I want to kill myself");
  const c5 = checkCrisis("I feel suicidal");
  const c6 = checkCrisis("self-harm");
  const c7 = checkCrisis("I don\u2019t want to be here anymore");
  const c8 = checkCrisis("mar jaunga");

  assert.equal(c1.isCrisis, true);
  assert.equal(c2.isCrisis, true);
  assert.equal(c3.isCrisis, true);
  assert.equal(c4.isCrisis, true);
  assert.equal(c5.isCrisis, true);
  assert.equal(c6.isCrisis, true);
  assert.equal(c7.isCrisis, true);
  assert.equal(c8.isCrisis, true);
  assert.ok(c1.reply && c1.reply.includes("14416"));
});

test("Context window - newest 16 ordering logic", () => {
  const sampleMessages = Array.from({ length: 25 }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `Message ${i + 1}`,
    createdAt: new Date(Date.now() - (25 - i) * 60000),
  }));

  // Replicating contextBuilder logic: sort -1, limit 16, reverse
  const sortedDesc = [...sampleMessages].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const sliced16 = sortedDesc.slice(0, 16);
  const chronological = sliced16.reverse();

  assert.equal(chronological.length, 16);
  assert.equal(chronological[0].content, "Message 10");
  assert.equal(chronological[15].content, "Message 25");
});

test("buildGreeting - 1: mood checkin seed", () => {
  const res1 = buildGreeting("Maya", "I felt low today");
  assert.equal(
    res1.greeting,
    "Hi Maya. You checked in feeling low today. Want to tell me what's behind it?",
  );
  assert.equal(res1.title, "Check-in: feeling low");

  const res2 = buildGreeting("Maya", "i felt anxious (work)");
  assert.equal(
    res2.greeting,
    "Hi Maya. You checked in feeling anxious today. Want to tell me what's behind it?",
  );
  assert.equal(res2.title, "Check-in: feeling anxious");
});

test("buildGreeting - 2: reflection seed", () => {
  const res = buildGreeting("Maya", "I want to reflect on my day");
  assert.equal(
    res.greeting,
    "Hi Maya. Let's look back on your day together. What stood out to you most?",
  );
  assert.equal(res.title, "Reflecting on my day");
});

test("buildGreeting - 3: plan seed", () => {
  const res = buildGreeting("Maya", "Help me plan a calm day");
  assert.equal(
    res.greeting,
    "Hi Maya. Let's shape a calm day together. What's one thing you'd like to feel good about by tonight?",
  );
  assert.equal(res.title, "Planning a calm day");
});

test("buildGreeting - 4: any other seed or firstMessage", () => {
  const shortText = "Can we talk?";
  const resShort = buildGreeting("Maya", shortText);
  assert.equal(resShort.greeting, "Hi Maya. I'm here with you. What's on your mind?");
  assert.equal(resShort.title, "Can we talk?");

  const longText = "I have a really long message about what happened at work today and why I feel tired";
  const resLong = buildGreeting("Maya", longText);
  assert.equal(resLong.greeting, "Hi Maya. I'm here with you. What's on your mind?");
  assert.equal(resLong.title, `${longText.slice(0, 27)}...`);
});

test("buildGreeting - 5: no seed", () => {
  const resUndef = buildGreeting("Maya", undefined);
  assert.equal(resUndef.greeting, "Hi Maya, I'm here. How is your heart doing right now?");
  assert.equal(resUndef.title, "New Conversation");

  const resEmpty = buildGreeting("Maya", "   ");
  assert.equal(resEmpty.greeting, "Hi Maya, I'm here. How is your heart doing right now?");
  assert.equal(resEmpty.title, "New Conversation");
});
