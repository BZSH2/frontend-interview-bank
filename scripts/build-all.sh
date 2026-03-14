#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

pnpm check
pnpm --filter api-server build
pnpm --filter app-uni build:h5
pnpm --filter admin-web build

echo 'all checks and builds passed.'
