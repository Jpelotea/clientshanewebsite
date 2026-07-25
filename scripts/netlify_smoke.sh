#!/usr/bin/env bash
set -euo pipefail

PORT="${NETLIFY_DEV_PORT:-8888}"
LOG_FILE="${TMPDIR:-/tmp}/shane-netlify-dev.log"
cleanup() {
  if [[ -n "${NETLIFY_PID:-}" ]] && kill -0 "$NETLIFY_PID" 2>/dev/null; then
    kill "$NETLIFY_PID" || true
    wait "$NETLIFY_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT
PUBLIC_SITE_READY=false npm run netlify:dev -- --offline --port "$PORT" >"$LOG_FILE" 2>&1 &
NETLIFY_PID=$!
for _ in {1..90}; do
  if curl --silent --fail "http://127.0.0.1:${PORT}/" >/dev/null; then break; fi
  if ! kill -0 "$NETLIFY_PID" 2>/dev/null; then cat "$LOG_FILE"; exit 1; fi
  sleep 1
done
routes=(/ /about-shane/ /leadership-journey/ /builder-of-builders/ /join-my-team/ /team-leadership-community/ /financial-education/ /insights/ /success-stories/ /events-achievements/ /book-consultation/ /recruitment-application/ /contact/ /privacy-policy/ /cookie-notice/ /terms-disclosures/ /robots.txt /admin/)
for route in "${routes[@]}"; do
  curl --silent --show-error --fail "http://127.0.0.1:${PORT}${route}" >/dev/null
  printf 'OK %s\n' "$route"
done
status=$(curl --silent --output /tmp/forms-method.json --write-out '%{http_code}' "http://127.0.0.1:${PORT}/api/forms/contact")
if [[ "$status" != "405" ]]; then
  echo "Expected 405 from GET /api/forms/contact, received $status"
  cat /tmp/forms-method.json
  exit 1
fi
echo "Netlify local smoke test passed."
