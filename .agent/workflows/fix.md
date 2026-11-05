---
description: Repair loop for failing checks, build errors or runtime errors
---

# /fix

Input: the failing output (check.sh FAIL lines, tsc errors, or a pasted runtime error).

1. Copy the FIRST error verbatim into PROGRESS.md under "## Fix log". Fix the first
   error only; later errors are often consequences of it.
2. Diagnose in 3 lines: what the error says, which file/line, the likely root cause.
   Verify the cause by reading the file and (for libraries) node_modules/<pkg> types or README.
3. Apply the smallest change that fixes the root cause. Do not refactor, do not touch
   unrelated files, do not disable the failing check or loosen tsconfig.
4. Re-run the same command that failed. Then re-run `bash scripts/check.sh N`.
5. Loop counter:
   - same error 3 times: stop, write a 5-line root-cause note, change approach
     (different API, simpler implementation, check version in package.json vs docs).
   - 5 loops total: write `BLOCKED: <what, what you tried, what you need>` and ask the human.
6. Known fixes:
   - Expo version mismatch: `npx expo install --check` then `npx expo-doctor`.
   - Reanimated/worklets: read the installed version's docs for the babel plugin, then `npx expo start -c`.
   - Phone cannot reach server: use LAN IP not localhost, same Wi-Fi, or tunnel.
   - Gemini empty/invalid JSON: set responseMimeType + responseSchema, try/catch JSON.parse, log raw text length (not content).
   - Notification tap opens Home: store pending url in a ref, push after auth redirect finished.
   - Keyboard covers composer on Android: android.softwareKeyboardLayoutMode "resize".
