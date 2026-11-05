---
description: Run Solace phases back-to-back with self-verification and self-repair
---

# /autopilot

Goal: finish every non-optional phase in PHASES.md in order, without human prompting.

1. Read AGENTS.md, PLAN.md, PHASES.md, PROGRESS.md.
2. Find the first phase not marked DONE in PROGRESS.md. Call it N.
3. Run the /phase workflow for N.
4. If /phase ends in PASSED, commit and go to step 2 with N+1.
5. STOP and report to the human only when:
   - a Manual gate in PHASES.md is reached (say exactly what to do, then wait), or
   - a phase is BLOCKED after 5 repair loops, or
   - all phases through 13 are DONE (then say "ready for /release").
6. Skip phase 10 unless the human said "journal on".

Rules while looping:
- Never ask "should I continue?". Continue.
- Keep each phase's changes in its own git commit so a bad phase can be reverted.
- If a previous phase's check starts failing, run /fix before continuing.
