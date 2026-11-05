# Solace AI - Phases (scoped to the final brief)

Deadline: Tue 10 Nov 2026, 11:59 am (confirm in the Telegram group).
Deliverable: working APK + demo video. Required: auth, API backend, chat history,
closed-app notifications. CUT: assessment/7-day plan, voice, dark mode, server push,
cron summary, 30-day insights, achievements UI. Journal only if ahead on Sunday.

Each phase: goal | files | acceptance. `bash scripts/check.sh N` must print
`PHASE N PASSED` before moving on. Full detail for each phase: PLAN.md section 10.

| # | Phase | Day | Auto-check covers |
|---|-------|-----|-------------------|
| 0 | Repo, Expo app, server skeleton, env, git | Fri | folders, scripts, tsc, /health |
| 1 | Theme, fonts, UI kit, haptics | Fri | theme files, ui components, no hex in screens |
| 2 | Sol mascot + TypingSol | Fri | SolMascot props/expressions, reanimated usage |
| 3 | Auth backend (User, JWT, /me) | Fri | live smoke: signup/login/me/409/401/validation |
| 4 | Splash, onboarding, auth screens, profile setup | Fri | routes exist, api client, secure-store, zustand |
| 5 | Tabs + Home (+ GET /home) | Sat | tab layout, home route, /home smoke |
| 6 | Mood check-in + streaks | Sat | /moods smoke, streak logic, checkin route |
| 7 | AI chat backend (Gemini, memory, safety) | Sat | chat smoke, crisis flag, memories CRUD, no key in app |
| 8 | Chat UI + history | Sun | chat routes, ActivityCard, SupportCard, composer |
| 9 | Breathing + affirmations | Sun | breathe route, patterns, /activities smoke |
| 10 | Journal (OPTIONAL, only if ahead) | Sun | journal routes |
| 11 | Notifications + reminders + deep links | Sun | notifications lib, channel, cold-start handler, /reminders smoke |
| 12 | Memories screen, simple 7-day insights, profile | Mon | memories route, insights smoke |
| 13 | Polish (no new features) | Mon | no dev-kit, no console.log, empty/error states |
| 14 | Deploy, APK, demo | Mon/Tue | eas.json, https health (manual) |

## Per-phase quick prompt (paste once, the agent loops itself)
> Read AGENTS.md, PLAN.md, PHASES.md, PROGRESS.md. Run the autopilot loop from
> .agent/workflows/autopilot.md starting at the first phase not DONE. Do not stop
> between phases unless check.sh is BLOCKED or a manual step is needed.

## Manual gates (agent must STOP and tell the human, cannot be automated)
- After phase 0: human creates MongoDB Atlas cluster, fills server/.env (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL).
- After phase 4/6/9: human opens the app on a phone and confirms the DONE WHEN list.
- Phase 11: human kills the app, waits for the reminder, taps it (cannot be simulated).
- Phase 14: `eas login`, `eas build`, install APK, record video.
