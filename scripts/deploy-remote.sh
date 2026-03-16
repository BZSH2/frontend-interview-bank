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
API_PORT=${API_PORT:-3000}
PNPM_INSTALL_FLAGS=${PNPM_INSTALL_FLAGS:---frozen-lockfile}

SYSTEMCTL_BIN=${SYSTEMCTL_BIN:-systemctl}
SUDO_BIN=${SUDO_BIN:-sudo}

if [ "$(id -u)" -ne 0 ]; then
  if command -v "$SUDO_BIN" >/dev/null 2>&1; then
    SYSTEMCTL_BIN="$SUDO_BIN systemctl"
  fi
fi

if [ ! -d "$CURRENT_DIR" ]; then
  echo "deploy directory not found: $CURRENT_DIR" >&2
  exit 1
fi

cd "$CURRENT_DIR"

echo '[deploy] install dependencies'
pnpm install $PNPM_INSTALL_FLAGS

echo '[deploy] ensure env files exist'
[ -f api-server/.env ] || cp api-server/.env.example api-server/.env
[ -f app-uni/.env ] || cp app-uni/.env.example app-uni/.env
[ -f admin-web/.env ] || cp admin-web/.env.example admin-web/.env

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

echo '[deploy] restart services'
$SYSTEMCTL_BIN restart "$API_SERVICE" "$APP_SERVICE" "$ADMIN_SERVICE"
$SYSTEMCTL_BIN --no-pager --full status "$API_SERVICE" "$APP_SERVICE" "$ADMIN_SERVICE" || true

if [ "$RUN_SMOKE_TEST" = 'true' ]; then
  echo '[deploy] run smoke test'
  sleep 3
  API_BASE_URL="http://127.0.0.1:${API_PORT}/api" pnpm smoke:test
fi

echo '[deploy] completed successfully'
