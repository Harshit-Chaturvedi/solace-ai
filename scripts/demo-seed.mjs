#!/usr/bin/env node
// Seed demo account with sample check-ins and conversations for Solace AI demo video.
// Usage: node scripts/demo-seed.mjs [baseUrl]

const BASE = (process.argv[2] || process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");

const demoEmail = `demo_${Date.now()}@solace.ai`;
const demoPassword = "DemoSolace123!";

async function api(method, path, body, token) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(BASE + path, {
      method,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json = null;
    const text = await res.text();
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // non-json
    }
    return { status: res.status, json, text };
  } finally {
    clearTimeout(t);
  }
}

async function seed() {
  console.log(`=== Seeding demo account on ${BASE} ===`);

  // 1. Signup demo user
  const signupRes = await api("POST", "/auth/signup", {
    name: "Aarav",
    email: demoEmail,
    password: demoPassword,
  });

  if (signupRes.status !== 201 && signupRes.status !== 200) {
    console.error("Signup failed:", signupRes.status, signupRes.text);
    process.exit(1);
  }

  const token = signupRes.json?.token;
  if (!token) {
    console.error("No token returned");
    process.exit(1);
  }

  // 2. Setup profile
  await api("PATCH", "/me", {
    onboardingDone: true,
    goals: ["Reduce stress", "Sleep better", "Be kinder to myself"],
    companionTone: "gentle",
    timezone: "Asia/Kolkata",
    memoryEnabled: true,
  }, token);

  // 3. Log a check-in
  await api("POST", "/moods", {
    mood: "good",
    emotions: ["hopeful", "calm"],
    note: "Productive morning, looking forward to the week ahead.",
  }, token);

  // 4. Create sample conversation 1: Presentation anxiety
  const conv1 = await api("POST", "/conversations", {}, token);
  const conv1Id = conv1.json?._id;
  if (conv1Id) {
    await api("POST", `/conversations/${conv1Id}/messages`, {
      content: "I have a big project presentation tomorrow and I am feeling nervous.",
    }, token);
    await api("POST", `/conversations/${conv1Id}/messages`, {
      content: "Thank you Sol, that perspective really helps me calm down.",
    }, token);
  }

  // 5. Create sample conversation 2: Evening wind-down
  const conv2 = await api("POST", "/conversations", {}, token);
  const conv2Id = conv2.json?._id;
  if (conv2Id) {
    await api("POST", `/conversations/${conv2Id}/messages`, {
      content: "Just checking in before bed. Today was full of gratitude.",
    }, token);
  }

  // 6. Log activities
  await api("POST", "/activities", {
    type: "breathing",
    durationSeconds: 120,
    meta: { pattern: "calm" },
  }, token);

  await api("POST", "/activities", {
    type: "affirmation",
    durationSeconds: 30,
    meta: { affirmation: "You are doing better than you give yourself credit for." },
  }, token);

  // 7. Add reminders
  await api("POST", "/reminders", {
    type: "checkin",
    title: "Morning check-in",
    body: "How is your heart today? Sol is here whenever you need.",
    time: "09:00",
    enabled: true,
  }, token);

  await api("POST", "/reminders", {
    type: "breathe",
    title: "Midday pause",
    body: "Take 2 minutes to breathe and reset.",
    time: "14:00",
    enabled: true,
  }, token);

  console.log("\n========================================");
  console.log("=== DEMO ACCOUNT SEEDED SUCCESSFULLY ===");
  console.log(`API Base:    ${BASE}`);
  console.log(`Email:       ${demoEmail}`);
  console.log(`Password:    ${demoPassword}`);
  console.log("Name:        Aarav");
  console.log("Data Seeded: Profile, 1 Check-in, 2 Conversations, 2 Activities, 2 Reminders");
  console.log("========================================\n");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
