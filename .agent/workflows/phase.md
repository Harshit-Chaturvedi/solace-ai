---
description: Build ONE phase, verify it, repair it until the check passes
---

# /phase N

1. Open PLAN.md section 10, "Phase N". Open the sections it references (3.2 folders,
   4 schema, 5 API, 6 AI, 7 design, 8 screens, 9 notifications).
2. Append to PROGRESS.md: `## Phase N - in progress` with a 5-line plan: files to
   create/edit, packages to install, how you will verify.
3. Build in small steps. After EACH step run the cheapest check:
   - app code:    `cd app && npx tsc --noEmit`
   - server code: `cd server && npx tsc --noEmit`
4. Install packages the right way (see AGENTS.md). After installing Expo packages run
   `cd app && npx expo install --check`.
5. Run `bash scripts/check.sh N`.
6. On FAIL: apply /fix. On PASSED: continue to 7.
7. Do a self-review: re-read the DONE WHEN list for phase N in PLAN.md and confirm each
   item with evidence (command output, file path, route). Items that need a phone are
   listed under "Needs human" in your report, never claimed as done.
8. Update PROGRESS.md (replace "in progress" with "DONE": built, how to test, known issues).
9. `git add -A && git commit -m "phase N done"`.
10. Print: `PHASE N DONE | files: <n> | check: PASSED | next: N+1`.
