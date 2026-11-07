import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateNewStreak,
  formatLocalDate,
  type StreakState,
} from "../src/services/streak.js";
import { checkCrisis } from "../src/services/ai/safety.js";

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

  assert.equal(benign1.isCrisis, false);
  assert.equal(benign2.isCrisis, false);
  assert.equal(benign3.isCrisis, false);
});

test("Safety - crisis phrases ARE flagged", () => {
  const c1 = checkCrisis("I don't want to be here anymore");
  const c2 = checkCrisis("Sab khatam kar dena chahta hoon");
  const c3 = checkCrisis("jeena nahi chahta");
  const c4 = checkCrisis("I want to kill myself");

  assert.equal(c1.isCrisis, true);
  assert.equal(c2.isCrisis, true);
  assert.equal(c3.isCrisis, true);
  assert.equal(c4.isCrisis, true);
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
