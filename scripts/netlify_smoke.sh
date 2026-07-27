#!/usr/bin/env bash
set -euo pipefail

PORT="${NETLIFY_DEV_PORT:-8888}"
BASE_URL="http://127.0.0.1:${PORT}"
LOCAL_ORIGIN="http://localhost:${PORT}"
LOG_FILE="${TMPDIR:-/tmp}/shane-netlify-dev.log"

cleanup() {
  if [[ -n "${NETLIFY_PID:-}" ]] && kill -0 "$NETLIFY_PID" 2>/dev/null; then
    kill "$NETLIFY_PID" || true
    wait "$NETLIFY_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

PUBLIC_SITE_READY=false ALLOWED_ORIGINS="${BASE_URL},${LOCAL_ORIGIN}" npx netlify dev \
  --offline \
  --dir dist \
  --functions netlify/functions \
  --framework "#static" \
  --port "$PORT" \
  >"$LOG_FILE" 2>&1 &
NETLIFY_PID=$!

ready=false
for _ in {1..90}; do
  if curl --silent --fail "${BASE_URL}/" >/dev/null; then
    ready=true
    break
  fi
  if ! kill -0 "$NETLIFY_PID" 2>/dev/null; then
    cat "$LOG_FILE"
    exit 1
  fi
  sleep 1
done
if [[ "$ready" != "true" ]]; then
  echo "Netlify Dev did not become ready within 90 seconds."
  cat "$LOG_FILE"
  exit 1
fi

routes=(/ /about-shane/ /leadership-journey/ /builder-of-builders/ /join-my-team/ /team-leadership-community/ /financial-education/ /insights/ /success-stories/ /events-achievements/ /book-consultation/ /recruitment-application/ /contact/ /privacy-policy/ /cookie-notice/ /terms-disclosures/ /robots.txt /admin/)
for route in "${routes[@]}"; do
  curl --silent --show-error --fail "${BASE_URL}${route}" >/dev/null
  printf 'OK %s\n' "$route"
done

get_status=$(curl --silent --output /tmp/forms-get.json --write-out '%{http_code}' "${BASE_URL}/api/forms/contact")
if [[ "$get_status" != "404" && "$get_status" != "405" ]]; then
  echo "Expected 404 or 405 from GET /api/forms/contact, received $get_status"
  cat /tmp/forms-get.json
  cat "$LOG_FILE"
  exit 1
fi

post_status=$(curl --silent --output /tmp/forms-post.json --write-out '%{http_code}' \
  --request POST \
  --header "Origin: ${LOCAL_ORIGIN}" \
  --header "Accept: application/json" \
  --form "fullName=Synthetic Test" \
  "${BASE_URL}/api/forms/contact")
if [[ "$post_status" != "503" ]]; then
  echo "Expected 503 from the unconfigured protected form in CI, received $post_status"
  cat /tmp/forms-post.json
  cat "$LOG_FILE"
  exit 1
fi
if ! grep -q 'Form security is not configured' /tmp/forms-post.json; then
  echo "The protected-form response did not contain the expected safe configuration message."
  cat /tmp/forms-post.json
  exit 1
fi

echo "Netlify local smoke test passed."
