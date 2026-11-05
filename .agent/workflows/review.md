---
description: Independent self-review of the last phase before moving on
---

# /review

Act as a strict reviewer who did not write the code.

1. `git diff HEAD~1 --stat` and read every changed file.
2. Check against AGENTS.md rules: strict TS, theme-only colours, api client only,
   zod on every body, userId from JWT, files < 250 lines, no secrets, no console.log
   of user content.
3. Check for the usual Flash mistakes: hallucinated imports (verify each import
   exists in node_modules), unused code, missing await, missing loading/error/empty
   states, missing keyboard handling, hard-coded URLs, TODO stubs left in P0 paths.
4. Run `bash scripts/check.sh N` again from a clean state (`rm -rf node_modules/.cache`).
5. Output a list: `OK:` items and `FIX:` items. Fix every FIX item via /fix, then re-run check.
