FROM docker.m.daocloud.io/library/node:20-slim AS base

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.32.1 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY api-server/package.json ./api-server/package.json
COPY app-uni/package.json ./app-uni/package.json
COPY admin-web/package.json ./admin-web/package.json

RUN pnpm install --no-frozen-lockfile

FROM deps AS builder

COPY . .
RUN pnpm --filter api-server build

FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json /app/
COPY --from=builder /app/api-server /app/api-server

WORKDIR /app/api-server
EXPOSE 3000
CMD ["sh", "-lc", "./node_modules/.bin/prisma db push --skip-generate && node dist/main.js"]
