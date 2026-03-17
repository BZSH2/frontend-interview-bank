#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
API_DIST_DIR="$ROOT_DIR/api-server/dist"
APP_DIST_DIR="$ROOT_DIR/app-uni/dist/build/h5"
ADMIN_DIST_DIR="$ROOT_DIR/admin-web/dist"
LOCALHOST_PATTERN='https?://(localhost|127\.0\.0\.1)(:[0-9]+)?/api'

require_file() {
  if [ ! -f "$1" ]; then
    echo "[runtime-artifacts] missing required file: $1" >&2
    exit 1
  fi
}

check_no_localhost_api() {
  target_dir=$1

  if grep -R -nE "$LOCALHOST_PATTERN" "$target_dir" >/tmp/runtime-artifacts-grep.$$ 2>/dev/null; then
    echo "[runtime-artifacts] found localhost/127.0.0.1 API reference in $target_dir" >&2
    cat /tmp/runtime-artifacts-grep.$$ >&2
    rm -f /tmp/runtime-artifacts-grep.$$
    exit 1
  fi

  rm -f /tmp/runtime-artifacts-grep.$$
}

require_file "$API_DIST_DIR/main.js"
require_file "$APP_DIST_DIR/index.html"
require_file "$ADMIN_DIST_DIR/index.html"

check_no_localhost_api "$APP_DIST_DIR"
check_no_localhost_api "$ADMIN_DIST_DIR"

echo '[runtime-artifacts] ok'
