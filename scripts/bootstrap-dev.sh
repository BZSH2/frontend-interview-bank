#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

echo '[1/5] install dependencies'
pnpm install --no-frozen-lockfile

echo '[2/5] prepare env files'
[ -f api-server/.env ] || cp api-server/.env.example api-server/.env
[ -f app-uni/.env ] || cp app-uni/.env.example app-uni/.env
[ -f admin-web/.env ] || cp admin-web/.env.example admin-web/.env

echo '[3/5] start mysql'
docker compose up -d mysql

echo '[4/5] wait mysql health'
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

echo '[5/5] init schema and seed demo data'
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed

echo ''
echo 'bootstrap finished.'
echo 'next:'
echo '  pnpm dev:api'
echo '  pnpm dev:uni:h5'
echo '  pnpm dev:admin'
