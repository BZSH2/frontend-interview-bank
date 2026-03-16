#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
APP_DIST="$ROOT_DIR/app-uni/dist/build/h5"
ADMIN_DIST="$ROOT_DIR/admin-web/dist"
TMP_MATCHES=$(mktemp)
trap 'rm -f "$TMP_MATCHES"' EXIT

assert_file() {
  if [ ! -f "$1" ]; then
    echo "missing artifact: $1" >&2
    exit 1
  fi
}

assert_file "$APP_DIST/index.html"
assert_file "$ADMIN_DIST/index.html"

if grep -RInE 'http://localhost:3000/api|http://127\.0\.0\.1:36000/api|http://127\.0\.0\.1:3000/api' \
  "$APP_DIST" "$ADMIN_DIST" >"$TMP_MATCHES" 2>/dev/null; then
  echo 'runtime artifacts still contain hard-coded localhost API URLs.' >&2
  echo 'please rebuild app-uni/admin-web with VITE_API_BASE_URL=/api before using runtime compose.' >&2
  echo '' >&2
  sed -n '1,20p' "$TMP_MATCHES" >&2
  exit 1
fi

echo 'runtime artifacts check passed.'
echo '- app-uni dist exists'
echo '- admin-web dist exists'
echo '- no hard-coded localhost API base URL found'
