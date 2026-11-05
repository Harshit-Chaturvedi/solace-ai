# Solace AI - Agent Rules (always on)

You are building Solace AI: Expo (React Native, TypeScript) app in /app and a
Node.js + Express + TypeScript + MongoDB API in /server. Full spec: PLAN.md.
Phase list and acceptance checks: PHASES.md. Progress log: PROGRESS.md.

## The autopilot loop (follow for EVERY task, no exceptions)
1. READ    PLAN.md, PHASES.md, PROGRESS.md. Find the first phase not marked DONE.
2. PLAN    Write a 5-line plan in PROGRESS.md under "## Phase N - in progress"
           (files you will touch, how you will verify). Touch only those files.
3. BUILD   Implement the phase in small steps. After each step run the quick check.
4. VERIFY  Run `bash scripts/check.sh N` (N = phase number). It runs type checks,
           source rules, and (for server phases) a live API smoke test.
5. FIX     If check.sh prints any FAIL: read the message, fix the ROOT CAUSE, rerun.
           Repeat up to 5 times. Never edit scripts/ or weaken a check to pass.
6. STUCK   Same error 3 times -> stop coding. Write a 5-line root-cause analysis in
           PROGRESS.md, read the package docs/README in node_modules, then try a
           different approach. After 5 failed loops write "BLOCKED: <reason>" and
           ask the human. Do not fake success.
7. CLOSE   When check.sh prints "PHASE N PASSED": mark phase DONE in PROGRESS.md
           (what was built, how to test, known issues), `git add -A && git commit
           -m "phase N done"`, then start the next phase automatically.

## ALWAYS
- TypeScript strict. No `any` unless a comment says why.
- Expo packages: `npx expo install <pkg>`. Server packages: `npm i`.
- expo-router file-based routes under app/app/. No manual react-navigation setup.
- Colours, spacing, fonts only from app/src/theme. No hex literals in screens.
- All API calls through app/src/api/client.ts. Base URL = EXPO_PUBLIC_API_URL.
- Server: validate every body with zod; errors are {error:{code,message}}.
- Every DB query scoped by req.userId from the JWT, never from the body.
- Secrets only in .env (gitignored). Keep .env.example updated.
- Files under 250 lines. Split into components/hooks.
- Verify package APIs in node_modules/<pkg>/README or types before using them.
- Run the app/server for real when the phase says so; reading code is not testing.

## NEVER
- Never put the Gemini key in /app. AI calls go through /server only.
- Never delete or rewrite files outside the phase scope.
- Never invent library APIs. Never add a major library not in PLAN.md without a
  one-line reason in PROGRESS.md.
- Never mark a phase DONE while check.sh fails or was not run.
- Never edit files in scripts/ or .agent/ (they are the referee, not the player).
- Never log message contents or tokens.

## Output style
Short status lines. No essays. After each phase print:
`PHASE N DONE | files: <n> | check: PASSED | next: phase N+1`
