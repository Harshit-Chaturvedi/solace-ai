# Solace Autopilot Kit for Antigravity

The agent builds, then a script judges. It cannot mark a phase done until
`bash scripts/check.sh N` prints `PHASE N PASSED`.

## Setup (5 minutes, tonight)
1. Create the repo folder `solace/` and copy EVERYTHING from this kit into its root
   (including the hidden `.agent/` folder).
2. `cd solace && git init && git add -A && git commit -m "kit"`.
3. Open `solace/` in Antigravity. Rules in `.agent/rules/solace.md` load automatically
   (also AGENTS.md). Workflows appear as `/autopilot`, `/phase`, `/fix`, `/review`,
   `/ai-quality`, `/release`. If your build does not show them, paste the file text.
4. Use the strongest model available for phases 7, 11 and any /fix that loops.
   Flash is fine elsewhere.

## The one prompt (paste into a fresh agent task)
> Read AGENTS.md, PLAN.md, PHASES.md and PROGRESS.md. Run /autopilot: build phases in
> order, run `bash scripts/check.sh N` after each, repair failures yourself, commit
> each green phase, and keep going. Stop only at a manual gate or when BLOCKED.
> Do not edit scripts/ or .agent/.

If the agent stops early or drifts: `Continue /autopilot from the first phase not DONE in PROGRESS.md.`
If one phase keeps failing: `Run /fix with the last check.sh output.`

## What you must do by hand (agent will tell you)
| When | You |
|------|-----|
| After phase 0 | Create MongoDB Atlas free cluster, fill `server/.env`; get Gemini key from AI Studio |
| Phases 4, 6, 9 | Open app on phone, confirm the DONE WHEN list |
| Phase 11 | Kill app, wait for reminder, tap it |
| Phase 14 | Deploy on Render, `eas login`, `eas build -p android --profile preview`, record video |

## Commands
- `bash scripts/check.sh 7`      one phase (static + tsc + live API)
- `bash scripts/check.sh all`    everything built so far
- `node scripts/verify.mjs 5`    static checks only (no server needed)
- `node scripts/smoke.mjs https://<render-host>/api/v1`  test the deployed API

## Honest limits
- Checks verify structure, types, API behaviour and safety rules. They cannot see UI
  looks, animation smoothness, real notification delivery or reply "feel". Those stay
  on your phone checklist (PLAN.md section 11) and `/ai-quality`.
- verify.mjs expects the file names from PLAN.md section 3.2. If the agent picks other
  names the check fails: tell it to rename, do not edit the script.
- Smoke tests call the real Gemini API: set GEMINI_API_KEY and watch your free quota.
- Checks were tested here against a mock API and a fake phase 0 repo, not against the real app, so expect to tune a check or two on first real run.
