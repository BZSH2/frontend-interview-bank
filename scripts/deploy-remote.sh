#!/bin/sh
set -eu

DEPLOY_ROOT=${DEPLOY_ROOT:-/var/www/frontend-interview-bank}
CURRENT_DIR=${CURRENT_DIR:-$DEPLOY_ROOT/current}
API_SERVICE=${API_SERVICE:-frontend-interview-bank-api}
APP_SERVICE=${APP_SERVICE:-frontend-interview-bank-app}
ADMIN_SERVICE=${ADMIN_SERVICE:-frontend-interview-bank-admin}
INSTALL_SYSTEMD_UNITS=${INSTALL_SYSTEMD_UNITS:-false}
RUN_DB_SEED=${RUN_DB_SEED:-false}
RUN_SMOKE_TEST=${RUN_SMOKE_TEST:-true}
ALLOW_ENV_EXAMPLE_FALLBACK=${ALLOW_ENV_EXAMPLE_FALLBACK:-false}
API_PORT=${API_PORT:-3000}
PNPM_INSTALL_FLAGS=${PNPM_INSTALL_FLAGS:---frozen-lockfile}

SYSTEMCTL_BIN=${SYSTEMCTL_BIN:-systemctl}
SUDO_BIN=${SUDO_BIN:-sudo}

if [ "$(id -u)" -ne 0 ]; then
  if command -v "$SUDO_BIN" >/dev/null 2>&1; then
    SYSTEMCTL_BIN="$SUDO_BIN systemctl"
  fi
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "required command not found: $1" >&2
    exit 1
  fi
}

require_env_file() {
  if [ -f "$1" ]; then
    return 0
  fi

  echo "missing required env file: $1" >&2
  echo 'hint: copy the matching .env.example and fill production-safe values before deploy.' >&2
  exit 1
}

if [ ! -d "$CURRENT_DIR" ]; then
  echo "deploy directory not found: $CURRENT_DIR" >&2
  exit 1
fi

cd "$CURRENT_DIR"

require_command node
require_command pnpm

if [ "$RUN_SMOKE_TEST" = 'true' ]; then
  require_command curl
fi

if [ "$ALLOW_ENV_EXAMPLE_FALLBACK" = 'true' ]; then
  echo '[deploy] ALLOW_ENV_EXAMPLE_FALLBACK=true, copying missing env files from examples'
  [ -f api-server/.env ] || cp api-server/.env.example api-server/.env
  [ -f app-uni/.env ] || cp app-uni/.env.example app-uni/.env
  [ -f admin-web/.env ] || cp admin-web/.env.example admin-web/.env
else
  echo '[deploy] verify required env files'
  require_env_file api-server/.env
  require_env_file app-uni/.env
  require_env_file admin-web/.env
fi

echo '[deploy] validate env configuration'
pnpm validate:env -- --require-env-files

echo '[deploy] install dependencies'
pnpm install $PNPM_INSTALL_FLAGS

echo '[deploy] sync database schema'
pnpm --filter api-server prisma:push

if [ "$RUN_DB_SEED" = 'true' ]; then
  echo '[deploy] seed demo data'
  pnpm --filter api-server prisma:seed
fi

echo '[deploy] build monorepo'
pnpm build:all

if [ "$INSTALL_SYSTEMD_UNITS" = 'true' ]; then
  echo '[deploy] install systemd unit files'
  if [ "$(id -u)" -eq 0 ]; then
    install -m 0644 deploy/systemd/frontend-interview-bank-api.service.example \
      "/etc/systemd/system/${API_SERVICE}.service"
    install -m 0644 deploy/systemd/frontend-interview-bank-app.service.example \
      "/etc/systemd/system/${APP_SERVICE}.service"
    install -m 0644 deploy/systemd/frontend-interview-bank-admin.service.example \
      "/etc/systemd/system/${ADMIN_SERVICE}.service"
  else
    "$SUDO_BIN" install -m 0644 deploy/systemd/frontend-interview-bank-api.service.example \
      "/etc/systemd/system/${API_SERVICE}.service"
    "$SUDO_BIN" install -m 0644 deploy/systemd/frontend-interview-bank-app.service.example \
      "/etc/systemd/system/${APP_SERVICE}.service"
    "$SUDO_BIN" install -m 0644 deploy/systemd/frontend-interview-bank-admin.service.example \
      "/etc/systemd/system/${ADMIN_SERVICE}.service"
  fi

  $SYSTEMCTL_BIN daemon-reload
  $SYSTEMCTL_BIN enable "$API_SERVICE" "$APP_SERVICE" "$ADMIN_SERVICE"
fi

require_command systemctl

echo '[deploy] restart services'
$SYSTEMCTL_BIN restart "$API_SERVICE" "$APP_SERVICE" "$ADMIN_SERVICE"
$SYSTEMCTL_BIN --no-pager --full status "$API_SERVICE" "$APP_SERVICE" "$ADMIN_SERVICE" || true

if [ "$RUN_SMOKE_TEST" = 'true' ]; then
  echo '[deploy] run smoke test'
  sleep 3
  API_BASE_URL="http://127.0.0.1:${API_PORT}/api" pnpm smoke:test
fi

echo '[deploy] completed successfully'
