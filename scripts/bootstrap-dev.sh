#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

echo '[1/6] install dependencies'
pnpm install --no-frozen-lockfile

echo '[2/6] prepare env files'
[ -f api-server/.env ] || cp api-server/.env.example api-server/.env
[ -f app-uni/.env ] || cp app-uni/.env.example app-uni/.env
[ -f admin-web/.env ] || cp admin-web/.env.example admin-web/.env

echo '[3/6] validate env files'
pnpm validate:env -- --require-env-files

echo '[4/6] start mysql'
if ! command -v docker >/dev/null 2>&1; then
  echo 'docker not found. Please install Docker Desktop (or provide your own MySQL and update api-server/.env DATABASE_URL).' >&2
  echo 'then run:' >&2
  echo '  pnpm --filter api-server prisma:push' >&2
  echo '  pnpm --filter api-server prisma:seed' >&2
  exit 1
fi

docker compose up -d mysql

echo '[5/6] wait mysql health'
ATTEMPTS=0
while [ "$ATTEMPTS" -lt 30 ]; do
  STATUS=$(docker inspect -f '{{.State.Health.Status}}' frontend-interview-bank-mysql 2>/dev/null || printf 'starting')
  if [ "$STATUS" = 'healthy' ]; then
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  sleep 2
done

if [ "$STATUS" != 'healthy' ]; then
  echo 'mysql is not healthy yet, please check docker compose logs mysql' >&2
  exit 1
fi

echo '[6/6] init schema and seed demo data'
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed

echo ''
echo 'bootstrap finished.'
echo 'next:'
echo '  pnpm dev:api'
echo '  pnpm dev:uni:h5'
echo '  pnpm dev:admin'
