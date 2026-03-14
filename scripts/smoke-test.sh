#!/bin/sh
set -eu

API_BASE_URL=${API_BASE_URL:-http://127.0.0.1:3000/api}
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

printf '[smoke] health
'
curl -fsS "$API_BASE_URL/health" >/dev/null

printf '[smoke] admin overview
'
curl -fsS "$API_BASE_URL/admin/overview" >/dev/null

printf '[smoke] question list
'
curl -fsS "$API_BASE_URL/questions?page=1&pageSize=2" >/dev/null

printf '[smoke] build artifacts
'
test -f "$ROOT_DIR/admin-web/dist/index.html"
test -f "$ROOT_DIR/app-uni/dist/build/h5/index.html"

echo 'smoke test passed.'
