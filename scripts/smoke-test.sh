#!/bin/sh
set -eu

API_BASE_URL=${API_BASE_URL:-http://127.0.0.1:3000/api}
SMOKE_SKIP_API=${SMOKE_SKIP_API:-false}
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ "$SMOKE_SKIP_API" = 'true' ]; then
  echo '[smoke] skip api checks (SMOKE_SKIP_API=true)'
else
  printf '[smoke] health live\n'
  curl -fsS "$API_BASE_URL/health/live" >/dev/null

  printf '[smoke] health ready\n'
  curl -fsS "$API_BASE_URL/health/ready" >/dev/null

  printf '[smoke] admin overview\n'
  curl -fsS "$API_BASE_URL/admin/overview" >/dev/null

  printf '[smoke] question list\n'
  curl -fsS "$API_BASE_URL/questions?page=1&pageSize=2" >/dev/null
fi

printf '[smoke] build artifacts\n'
test -f "$ROOT_DIR/admin-web/dist/index.html"
test -f "$ROOT_DIR/app-uni/dist/build/h5/index.html"

echo 'smoke test passed.'
