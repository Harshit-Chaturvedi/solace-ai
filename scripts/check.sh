#!/usr/bin/env bash
# Referee for a phase. Usage: bash scripts/check.sh <0-14|all>
# 1) static verify  2) tsc on app + server  3) live API smoke (server phases)
# Prints "PHASE N PASSED" only if everything is green.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 2
PHASE="${1:-all}"
LIMIT="$PHASE"; [ "$PHASE" = "all" ] && LIMIT=14
FAILED=0
step() { echo; echo "=== $* ==="; }

step "static verify (phase $PHASE)"
node scripts/verify.mjs "$PHASE" || FAILED=1

for dir in server app; do
  if [ -f "$dir/tsconfig.json" ]; then
    step "tsc --noEmit in $dir"
    if [ ! -d "$dir/node_modules" ]; then
      echo "FAIL $dir/node_modules missing: run npm install in $dir"; FAILED=1
    else
      (cd "$dir" && npx --no-install tsc --noEmit) || { echo "FAIL tsc errors in $dir"; FAILED=1; }
    fi
  fi
done

# server smoke needs the API running: phases 3,5,6,7,9,11,12 and "all"
NEEDS_SMOKE=0
case "$PHASE" in 3|5|6|7|9|11|12|all) NEEDS_SMOKE=1 ;; esac

if [ "$NEEDS_SMOKE" = "1" ] && [ -f server/package.json ]; then
  step "live API smoke test"
  if [ ! -f server/.env ]; then
    echo "FAIL server/.env missing. MANUAL: human must create it from server/.env.example (MongoDB Atlas URI, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL)."
    FAILED=1
  else
    PORT_VAL="$(grep -E '^PORT=' server/.env | cut -d= -f2 | tr -d '\r' )"; PORT_VAL="${PORT_VAL:-4000}"
    BASE="http://localhost:${PORT_VAL}/api/v1"
    LOG="$(mktemp)"
    STARTED=0
    if curl -fs "$BASE/health" >/dev/null 2>&1; then
      echo "server already running on $PORT_VAL, reusing it"
    else
      (cd server && npm run dev >"$LOG" 2>&1 &) ; STARTED=1
      for i in $(seq 1 40); do
        curl -fs "$BASE/health" >/dev/null 2>&1 && break
        sleep 1
      done
    fi
    if curl -fs "$BASE/health" >/dev/null 2>&1; then
      MAXP="$LIMIT"; [ "$PHASE" = "all" ] && MAXP=12
      node scripts/smoke.mjs "$BASE" "$MAXP" || FAILED=1
    else
      echo "FAIL server did not start within 40s. Last log lines:"; tail -n 25 "$LOG"; FAILED=1
    fi
    if [ "$STARTED" = "1" ]; then
      pkill -f "tsx watch src/index.ts" >/dev/null 2>&1 || true
    fi
  fi
fi

echo
if [ "$FAILED" = "0" ]; then
  echo "PHASE $PHASE PASSED"
  exit 0
fi
echo "PHASE $PHASE FAILED - read the FAIL lines above, fix the root cause, rerun this command."
exit 1
