FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml .
COPY tsconfig.base.json .
COPY api-server/package.json ./api-server/package.json
COPY app-uni/package.json ./app-uni/package.json
COPY admin-web/package.json ./admin-web/package.json

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm --filter api-server build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json /app/
COPY --from=builder /app/api-server /app/api-server

WORKDIR /app/api-server
EXPOSE 3000
CMD ["node", "dist/main.js"]
