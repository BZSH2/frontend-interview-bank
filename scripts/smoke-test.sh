#!/bin/sh
set -eu

API_BASE_URL=${API_BASE_URL:-http://127.0.0.1:3000/api}
APP_BASE_URL=${APP_BASE_URL:-}
ADMIN_BASE_URL=${ADMIN_BASE_URL:-}
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
  exit 1
}

html_curl() {
  tmp_file=$(mktemp)
  if ! curl -fsS "$1" >"$tmp_file"; then
    rm -f "$tmp_file"
    return 1
  fi

  if ! grep -qi '<!doctype html' "$tmp_file"; then
    rm -f "$tmp_file"
    return 1
  fi

  rm -f "$tmp_file"
  return 0
}

echo "[smoke] API_BASE_URL=$API_BASE_URL"
if [ -n "$APP_BASE_URL" ]; then
  echo "[smoke] APP_BASE_URL=$APP_BASE_URL"
fi
if [ -n "$ADMIN_BASE_URL" ]; then
  echo "[smoke] ADMIN_BASE_URL=$ADMIN_BASE_URL"
fi

if [ "$SMOKE_SKIP_API" != 'true' ]; then
  printf '[smoke] health live\n'
  curl_with_retry 'health live' "$API_BASE_URL/health/live" curl -fsS

  printf '[smoke] health ready\n'
  curl_with_retry 'health ready' "$API_BASE_URL/health/ready" curl -fsS

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

if [ -n "$APP_BASE_URL" ]; then
  printf '[smoke] app preview url\n'
  curl_with_retry 'app preview url' "$APP_BASE_URL" html_curl
fi

if [ -n "$ADMIN_BASE_URL" ]; then
  printf '[smoke] admin preview url\n'
  curl_with_retry 'admin preview url' "$ADMIN_BASE_URL" html_curl
fi

echo 'smoke test passed.'
