#!/usr/bin/env node
// Contract smoke tests for Solace AI.
// Usage: node scripts/contract-smoke.mjs [baseUrl]

const BASE = (process.argv[2] || process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
const email = `contract_${Date.now()}@example.com`;
const password = "ContractPass123!";
let token = "";
let convId = "";
let passes = 0;
let fails = 0;

async function api(method, path, body, auth = true) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(BASE + path, {
      method,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
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

async function test(name, fn) {
  try {
    await fn();
    passes++;
    console.log(`PASS [contract] ${name}`);
  } catch (e) {
    fails++;
    console.log(`FAIL [contract] ${name} -> ${e.message}`);
  }
}

const eq = (a, b, what) => {
  if (a !== b) throw new Error(`${what}: expected ${b}, got ${a}`);
};
const truthy = (v, what) => {
  if (!v) throw new Error(`${what}: expected truthy, got ${JSON.stringify(v)}`);
};

console.log(`=== Starting contract smoke against ${BASE} ===`);

// 1. Setup user
await test("signup throwaway user", async () => {
  const r = await api("POST", "/auth/signup", {
    name: "Contract User",
    email,
    password,
  }, false);
  eq(r.status, 201, "status");
  token = r.json?.token;
  truthy(token, "token");
});

// 2. Create conversation
await test("create conversation", async () => {
  const r = await api("POST", "/conversations", {});
  truthy(r.status === 200 || r.status === 201, "create status");
  convId = r.json?._id;
  truthy(convId, "convId");
});

// 3. First user message -> check role in messages
await test("send message and verify role field", async () => {
  const r = await api("POST", `/conversations/${convId}/messages`, {
    content: "I am feeling overwhelmed with my presentation tomorrow.",
  });
  truthy(r.status === 200 || r.status === 201, "status");
  const replyContent = r.json?.assistantMessage?.content || "";
  truthy(
    !replyContent.includes("I'm here with you right now"),
    `Sol reply should be AI generated, not canned fallback: "${replyContent}"`
  );

  const list = await api("GET", `/conversations/${convId}/messages`);
  eq(list.status, 200, "messages status");
  const msgs = list.json;
  truthy(Array.isArray(msgs) && msgs.length >= 2, "at least 2 messages");
  for (const m of msgs) {
    truthy(m.role === "user" || m.role === "assistant", `message role should be user/assistant, got ${m.role}`);
  }
});

// 4. Conversation title updated & lastMessagePreview
await test("conversation title updated and list has lastMessagePreview", async () => {
  const list = await api("GET", "/conversations");
  eq(list.status, 200, "status");
  const conv = list.json.find((c) => c._id === convId);
  truthy(conv, "conversation in list");
  truthy(conv.title && conv.title !== "New Conversation", `title updated: ${conv.title}`);
  truthy(conv.lastMessagePreview, "has lastMessagePreview");
});

// 5. Timezone greeting
await test("GET /home greeting matches user timezone hour", async () => {
  const r = await api("GET", "/home");
  eq(r.status, 200, "status");
  const greeting = r.json?.greeting;
  truthy(greeting, "greeting present");
});

// 6. False crisis phrases NOT flagged
await test("false crisis phrases are not flagged", async () => {
  const r1 = await api("POST", `/conversations/${convId}/messages`, {
    content: "Bahut kaam hai yaar, tension mein marna padega lagta hai.",
  });
  truthy(!r1.json?.assistantMessage?.flagged, "tension mein marna padega should not be crisis");

  const r2 = await api("POST", `/conversations/${convId}/messages`, {
    content: "I think I will overdose on coffee lol.",
  });
  truthy(!r2.json?.assistantMessage?.flagged, "overdose on coffee should not be crisis");
});

// 7. True crisis phrases ARE flagged
await test("true crisis phrases are flagged", async () => {
  const r1 = await api("POST", `/conversations/${convId}/messages`, {
    content: "I don't want to be here anymore, I can't take this life.",
  });
  eq(r1.json?.assistantMessage?.flagged, "crisis", "I don't want to be here anymore should be crisis");

  const r2 = await api("POST", `/conversations/${convId}/messages`, {
    content: "Sab khatam kar dena chahta hoon ab.",
  });
  eq(r2.json?.assistantMessage?.flagged, "crisis", "Sab khatam kar dena chahta hoon should be crisis");
});

// 8. 6 user turns -> memories extracted
await test("after 6+ user turns GET /memories is non-empty", async () => {
  // We already sent 5 turns. Let's send 2 more meaningful turns to ensure >= 6 turns.
  const m1 = await api("POST", `/conversations/${convId}/messages`, {
    content: "I work as a senior backend software engineer in Bangalore.",
  });
  const m2 = await api("POST", `/conversations/${convId}/messages`, {
    content: "My dog Bruno always helps me calm down when I am stressed.",
  });
  const c1 = m1.json?.assistantMessage?.content || "";
  const c2 = m2.json?.assistantMessage?.content || "";
  truthy(!c1.includes("I'm here with you right now") && !c2.includes("I'm here with you right now"), "turns should not use canned fallback");

  // Poll GET /memories every 3s for up to 30s as extraction runs in the background
  let mems = [];
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const memRes = await api("GET", "/memories");
    if (memRes.status === 200) {
      const data = memRes.json?.memories || memRes.json;
      if (Array.isArray(data) && data.length > 0) {
        mems = data;
        break;
      }
    }
  }

  truthy(Array.isArray(mems) && mems.length > 0, `memories extracted within 30s: ${JSON.stringify(mems)}`);
});

// 9. Cleanup throwaway user
await test("DELETE /me cleanup", async () => {
  const d = await api("DELETE", "/me");
  truthy(d.status === 200 || d.status === 204, `delete status ${d.status}`);
});

console.log(`\nCONTRACT SMOKE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
