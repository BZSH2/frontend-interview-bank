#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

API_PORT=${API_PORT:-3000}
APP_PORT=${APP_PORT:-4173}
ADMIN_PORT=${ADMIN_PORT:-4174}

echo 'starting local preview servers...'
echo "api health    -> http://127.0.0.1:${API_PORT}/api/health"
echo "app preview   -> http://127.0.0.1:${APP_PORT}"
echo "admin preview -> http://127.0.0.1:${ADMIN_PORT}"

echo ''
echo 'make sure api-server is already running in another terminal:'
echo '  pnpm dev:api'
echo ''

python3 -m http.server "$APP_PORT" -d "$ROOT_DIR/app-uni/dist/build/h5" &
APP_PID=$!
python3 -m http.server "$ADMIN_PORT" -d "$ROOT_DIR/admin-web/dist" &
ADMIN_PID=$!

cleanup() {
  kill "$APP_PID" "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

wait "$APP_PID" "$ADMIN_PID"
