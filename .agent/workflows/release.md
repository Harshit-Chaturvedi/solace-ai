---
description: Deploy backend, produce APK, prepare the demo
---

# /release

Precondition: phases 0-9, 11, 12, 13 DONE and `bash scripts/check.sh all` passes.

1. Run /ai-quality and /review one last time.
2. Server: build (`npm run build`), confirm `npm start` works locally. Prepare Render
   settings text for the human: build `npm i && npm run build`, start `npm start`, env vars list
   from server/.env.example. STOP for the human to deploy and give the https URL.
3. With the URL: `node scripts/smoke.mjs https://<host>/api/v1` must pass.
4. App: set EXPO_PUBLIC_API_URL in eas.json preview env, buildType apk, distribution internal.
   Ensure splash pings /health and shows "Waking Sol up..." when slow.
5. Tell the human the exact commands: `eas login`, `eas build -p android --profile preview`.
   Remind: start the build by Sunday night, free queue can be slow.
6. Generate DEMO_SCRIPT.md from PLAN.md section 11.1 with the user's real screen names,
   plus a pre-recording checklist: hit /health, fresh account, airplane mode test last.
