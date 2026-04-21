#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

COMPOSE_FILE="${DEPLOY_PATH}/deploy/docker/docker-compose.nest-admin-style.runtime.yml"
RUNTIME_ENV_FILE="${DEPLOY_PATH}/deploy/docker/.env.runtime"
API_ENV_FILE="${DEPLOY_PATH}/api-server/.env"
API_HOST_PORT="${API_HOST_PORT:-36000}"
APP_HOST_PORT="${APP_HOST_PORT:-36080}"
ADMIN_HOST_PORT="${ADMIN_HOST_PORT:-36081}"
APP_DOMAIN="${APP_DOMAIN:-uni.bzsh.fun}"

get_env_value() {
  local key="$1"
  grep -E "^${key}=" "$RUNTIME_ENV_FILE" | head -n 1 | cut -d'=' -f2-
}

pull_if_present() {
  local image="$1"
  if [ -n "$image" ]; then
    echo "Pulling image: $image"
    docker pull "$image"
  fi
}

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -f "$RUNTIME_ENV_FILE" ]; then
  echo "Runtime env file not found: $RUNTIME_ENV_FILE" >&2
  exit 1
fi

if [ ! -f "$API_ENV_FILE" ]; then
  echo "API env file not found: $API_ENV_FILE" >&2
  exit 1
fi

cd "$DEPLOY_PATH"

API_RUNTIME_IMAGE="$(get_env_value API_RUNTIME_IMAGE || true)"
APP_RUNTIME_IMAGE="$(get_env_value APP_RUNTIME_IMAGE || true)"
ADMIN_RUNTIME_IMAGE="$(get_env_value ADMIN_RUNTIME_IMAGE || true)"

pull_if_present "$API_RUNTIME_IMAGE"
pull_if_present "$APP_RUNTIME_IMAGE"
pull_if_present "$ADMIN_RUNTIME_IMAGE"

docker compose \
  --env-file "$RUNTIME_ENV_FILE" \
  -f "$COMPOSE_FILE" \
  up -d --remove-orphans

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${API_HOST_PORT}/api/health/ready" >/dev/null \
    && curl -fsSI "http://127.0.0.1:${APP_HOST_PORT}" >/dev/null \
    && curl -fsSI "http://127.0.0.1:${ADMIN_HOST_PORT}" >/dev/null; then
    echo "Deploy succeeded: frontend-interview-bank is serving on ${APP_DOMAIN}."
    exit 0
  fi

  sleep 3
done

echo 'Health check failed, dumping container state...' >&2
docker compose \
  --env-file "$RUNTIME_ENV_FILE" \
  -f "$COMPOSE_FILE" \
  ps >&2 || true
docker compose \
  --env-file "$RUNTIME_ENV_FILE" \
  -f "$COMPOSE_FILE" \
  logs --no-color --tail=200 >&2 || true
exit 1
