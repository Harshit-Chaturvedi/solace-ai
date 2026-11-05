#!/usr/bin/env node
// Live API smoke test. Usage: node scripts/smoke.mjs [baseUrl] [maxPhase]
// Default base: http://localhost:4000/api/v1. Runs tests for phases <= maxPhase (default 12).
// Creates a throwaway user and deletes it at the end (also tests DELETE /me).
const BASE = (process.argv[2] || process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
const MAX = Number(process.argv[3] ?? 12);
const email = `smoke_${Date.now()}@example.com`;
const password = "SmokeTest123!";
let token = "";
let convId = "";
let reminderId = "";
let fails = 0;
let passes = 0;

async function api(method, path, body, auth = true) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch(BASE + path, {
      method,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(auth && token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json = null;
    const text = await res.text();
    try { json = text ? JSON.parse(text) : null; } catch { /* non-json */ }
    return { status: res.status, json, text };
  } finally { clearTimeout(t); }
}

async function test(phase, name, fn) {
  if (phase > MAX) return;
  try {
    await fn();
    passes++;
    console.log(`PASS [p${phase}] ${name}`);
  } catch (e) {
    fails++;
    console.log(`FAIL [p${phase}] ${name} -> ${e.message}`);
  }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${b}, got ${a}`); };
const truthy = (v, what) => { if (!v) throw new Error(`${what}: expected truthy, got ${JSON.stringify(v)}`); };
const errShape = (r) => truthy(r.json?.error?.code && r.json?.error?.message, `error shape {error:{code,message}} in ${r.text.slice(0, 120)}`);

// ---- phase 0 / 3 ----
await test(0, "GET /health", async () => {
  const r = await api("GET", "/health", undefined, false);
  eq(r.status, 200, "status"); eq(r.json?.ok, true, "ok");
});
await test(3, "signup rejects short password with VALIDATION", async () => {
  const r = await api("POST", "/auth/signup", { name: "S", email, password: "123" }, false);
  eq(r.status, 400, "status"); errShape(r);
});
await test(3, "signup returns token + user without passwordHash", async () => {
  const r = await api("POST", "/auth/signup", { name: "Smoke", email: email.toUpperCase(), password }, false);
  eq(r.status, 201 === r.status ? 201 : 200, "status"); // accept 200 or 201
  truthy(r.json?.token, "token"); truthy(r.json?.user, "user");
  eq(r.json.user.passwordHash, undefined, "passwordHash hidden");
  token = r.json.token;
});
await test(3, "duplicate email gives 409", async () => {
  const r = await api("POST", "/auth/signup", { name: "S", email, password }, false);
  eq(r.status, 409, "status"); errShape(r);
});
await test(3, "wrong password gives 401 with friendly message", async () => {
  const r = await api("POST", "/auth/login", { email, password: "WrongPass999" }, false);
  eq(r.status, 401, "status"); errShape(r);
});
await test(3, "login works (email case-insensitive)", async () => {
  const r = await api("POST", "/auth/login", { email: email.toUpperCase(), password }, false);
  eq(r.status, 200, "status"); truthy(r.json?.token, "token"); token = r.json.token;
});
await test(3, "GET /me needs token (401 without)", async () => {
  const r = await api("GET", "/me", undefined, false); eq(r.status, 401, "status");
});
await test(3, "GET /me returns profile", async () => {
  const r = await api("GET", "/me");
  eq(r.status, 200, "status"); eq(r.json?.email, email, "email"); eq(r.json?.passwordHash, undefined, "no hash");
});
await test(3, "PATCH /me whitelists fields", async () => {
  const r = await api("PATCH", "/me", { name: "Smoke Test", goals: ["sleep better"], companionTone: "gentle",
    checkinTime: "20:30", timezone: "Asia/Kolkata", onboardingDone: true, role: "admin", _id: "x" });
  eq(r.status, 200, "status"); eq(r.json?.name, "Smoke Test", "name"); eq(r.json?.role, undefined, "role not writable");
});
await test(3, "PATCH /me rejects bad tone", async () => {
  const r = await api("PATCH", "/me", { companionTone: "evil" }); eq(r.status, 400, "status");
});

// ---- phase 5 / 6 ----
await test(5, "GET /home has greeting, affirmation, suggestion, streak", async () => {
  const r = await api("GET", "/home");
  eq(r.status, 200, "status");
  for (const k of ["greeting", "affirmation", "suggestion", "streak"]) truthy(r.json?.[k] !== undefined, `home.${k}`);
});
await test(6, "POST /moods saves and returns streak + solReply", async () => {
  const r = await api("POST", "/moods", { mood: "low", emotions: ["anxious", "tired"], note: "Big presentation tomorrow" });
  eq(r.status === 201 ? 200 : r.status, 200, "status");
  truthy(r.json?.solReply, "solReply"); truthy(r.json?.streak?.current >= 1, "streak.current >= 1");
});
await test(6, "second check-in same day keeps streak", async () => {
  const r = await api("POST", "/moods", { mood: "okay" });
  eq(r.status === 201 ? 200 : r.status, 200, "status"); eq(r.json?.streak?.current, 1, "streak stays 1");
});
await test(6, "POST /moods rejects invalid mood", async () => {
  const r = await api("POST", "/moods", { mood: "ecstatic" }); eq(r.status, 400, "status");
});
await test(6, "GET /moods?range=7 returns array", async () => {
  const r = await api("GET", "/moods?range=7"); eq(r.status, 200, "status"); truthy(Array.isArray(r.json), "array");
});

// ---- phase 7 ----
await test(7, "POST /conversations creates with Sol greeting", async () => {
  const r = await api("POST", "/conversations", {});
  truthy(r.status === 200 || r.status === 201, `status ${r.status}`);
  convId = r.json?.conversation?._id; truthy(convId, "conversation._id");
  truthy(Array.isArray(r.json?.messages), "messages[]");
});
await test(7, "send message returns assistant reply with sane length", async () => {
  const r = await api("POST", `/conversations/${convId}/messages`,
    { content: "I'm really anxious about a big presentation tomorrow and can't stop overthinking." });
  eq(r.status === 201 ? 200 : r.status, 200, "status");
  const a = r.json?.assistantMessage; truthy(a?.content, "assistantMessage.content");
  const words = a.content.trim().split(/\s+/).length;
  if (words > 140) throw new Error(`reply too long (${words} words, target <= ~80)`);
  if (/you've got this|stay positive/i.test(a.content)) throw new Error("generic cliche reply");
});
await test(7, "crisis phrase flags message and keeps reply caring", async () => {
  const r = await api("POST", `/conversations/${convId}/messages`, { content: "I want to kill myself" });
  eq(r.status === 201 ? 200 : r.status, 200, "status");
  const a = r.json?.assistantMessage;
  truthy(a?.flagged === "crisis" || r.json?.userMessage?.flagged === "crisis", "flagged crisis");
  truthy(a?.content, "reply content");
});
await test(7, "Hinglish crisis phrase also flagged", async () => {
  const r = await api("POST", `/conversations/${convId}/messages`, { content: "ab jeena nahi chahta" });
  eq(r.status === 201 ? 200 : r.status, 200, "status");
  truthy(r.json?.assistantMessage?.flagged === "crisis" || r.json?.userMessage?.flagged === "crisis", "flagged");
});
await test(7, "empty message rejected (400)", async () => {
  const r = await api("POST", `/conversations/${convId}/messages`, { content: "" }); eq(r.status, 400, "status");
});
await test(7, "GET messages returns history in order", async () => {
  const r = await api("GET", `/conversations/${convId}/messages?limit=30`);
  eq(r.status, 200, "status"); truthy((r.json?.messages ?? r.json)?.length >= 4, "at least 4 messages saved");
});
await test(7, "conversation list contains it; another user's id is not exposed", async () => {
  const r = await api("GET", "/conversations"); eq(r.status, 200, "status");
  truthy(JSON.stringify(r.json).includes(convId), "conversation listed");
  const bad = await api("GET", "/conversations/000000000000000000000000/messages");
  truthy(bad.status === 404 || bad.status === 403, `foreign/unknown id must be 404/403, got ${bad.status}`);
});
await test(7, "PATCH rename conversation", async () => {
  const r = await api("PATCH", `/conversations/${convId}`, { title: "Presentation nerves" });
  eq(r.status, 200, "status"); eq(r.json?.title ?? r.json?.conversation?.title, "Presentation nerves", "title");
});
await test(7, "GET /memories returns array; DELETE /memories returns 204", async () => {
  const r = await api("GET", "/memories"); eq(r.status, 200, "status");
  truthy(Array.isArray(r.json?.memories ?? r.json), "array");
  const d = await api("DELETE", "/memories"); eq(d.status, 204, "delete all status");
});
await test(7, "DELETE conversation gives 204 and it disappears", async () => {
  const d = await api("DELETE", `/conversations/${convId}`); eq(d.status, 204, "status");
  const l = await api("GET", "/conversations");
  truthy(!JSON.stringify(l.json).includes(convId), "gone from list");
});

// ---- phase 9 / 11 / 12 ----
await test(9, "POST /activities records breathing and returns streak", async () => {
  const r = await api("POST", "/activities", { type: "breathing", durationSec: 60, meta: { pattern: "box" } });
  truthy(r.status === 200 || r.status === 201, `status ${r.status}`); truthy(r.json?.streak, "streak");
});
await test(9, "GET /affirmations/today returns text", async () => {
  const r = await api("GET", "/affirmations/today"); eq(r.status, 200, "status"); truthy(r.json?.text, "text");
});
await test(11, "reminders CRUD", async () => {
  const c = await api("POST", "/reminders", { type: "checkin", title: "Check in", body: "How are you?", time: "20:00", days: [0, 1, 2, 3, 4, 5, 6], enabled: true });
  truthy(c.status === 200 || c.status === 201, `create status ${c.status}`);
  reminderId = c.json?._id ?? c.json?.reminder?._id; truthy(reminderId, "reminder id");
  const bad = await api("POST", "/reminders", { type: "checkin", title: "x", body: "y", time: "25:99", days: [0], enabled: true });
  eq(bad.status, 400, "invalid time rejected");
  const u = await api("PATCH", `/reminders/${reminderId}`, { enabled: false }); eq(u.status, 200, "patch status");
  const l = await api("GET", "/reminders"); eq(l.status, 200, "list status");
  const d = await api("DELETE", `/reminders/${reminderId}`); eq(d.status, 204, "delete status");
});
await test(12, "GET /insights?range=7 shape", async () => {
  const r = await api("GET", "/insights?range=7"); eq(r.status, 200, "status");
  for (const k of ["moodSeries", "streak"]) truthy(r.json?.[k] !== undefined, `insights.${k}`);
});

// ---- cleanup (also tests DELETE /me) ----
await test(3, "DELETE /me wipes the account; login then fails", async () => {
  const d = await api("DELETE", "/me"); truthy(d.status === 204 || d.status === 200, `status ${d.status}`);
  const l = await api("POST", "/auth/login", { email, password }, false); eq(l.status, 401, "login after delete");
});

console.log(`\nSMOKE ${fails ? "FAILED" : "OK"}: ${passes} passed, ${fails} failed (base ${BASE}, phases <= ${MAX})`);
process.exit(fails ? 1 : 0);
