#!/bin/sh
set -eu

API_BASE_URL=${API_BASE_URL:-http://127.0.0.1:3000/api}
ADMIN_TOKEN=${ADMIN_TOKEN:-}
SMOKE_SKIP_API=${SMOKE_SKIP_API:-false}
SMOKE_RETRIES=${SMOKE_RETRIES:-5}
SMOKE_SLEEP=${SMOKE_SLEEP:-1}
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if ! command -v curl >/dev/null 2>&1; then
  echo '[smoke] curl not found. Please install curl.' >&2
  exit 1
fi

admin_curl() {
  if [ -n "$ADMIN_TOKEN" ]; then
    curl -fsS -H "x-admin-token: $ADMIN_TOKEN" "$1"
  else
    curl -fsS "$1"
  fi
}

curl_with_retry() {
  name=$1
  url=$2
  shift 2

  attempt=1
  while [ "$attempt" -le "$SMOKE_RETRIES" ]; do
    if "$@" "$url" >/dev/null; then
      return 0
    fi
    echo "[smoke] $name failed (attempt $attempt/$SMOKE_RETRIES): $url" >&2
    attempt=$((attempt + 1))
    sleep "$SMOKE_SLEEP"
  done

  echo "[smoke] $name failed after $SMOKE_RETRIES attempts: $url" >&2
  echo "[smoke] hint: ensure api-server is running and API_BASE_URL is correct." >&2
  echo "[smoke] hint: start api with: pnpm dev:api" >&2
  exit 1
}

echo "[smoke] API_BASE_URL=$API_BASE_URL"

if [ "$SMOKE_SKIP_API" != 'true' ]; then
  printf '[smoke] health\n'
  curl_with_retry 'health' "$API_BASE_URL/health" curl -fsS

  printf '[smoke] admin overview\n'
  curl_with_retry 'admin overview' "$API_BASE_URL/admin/overview" admin_curl

  printf '[smoke] admin requests\n'
  curl_with_retry 'admin requests' "$API_BASE_URL/admin/explanation-requests?page=1&pageSize=2" admin_curl

  printf '[smoke] question list\n'
  curl_with_retry 'question list' "$API_BASE_URL/questions?page=1&pageSize=2" curl -fsS
else
  echo '[smoke] SMOKE_SKIP_API=true; skipping API checks.'
fi

printf '[smoke] build artifacts\n'
test -f "$ROOT_DIR/admin-web/dist/index.html"
test -f "$ROOT_DIR/app-uni/dist/build/h5/index.html"

echo 'smoke test passed.'
