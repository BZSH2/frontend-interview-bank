FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml .
COPY tsconfig.base.json .
COPY app-uni/package.json ./app-uni/package.json
COPY api-server/package.json ./api-server/package.json
COPY admin-web/package.json ./admin-web/package.json

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm --filter app-uni build:h5

FROM nginx:1.27-alpine
COPY --from=builder /app/app-uni/dist/build/h5 /usr/share/nginx/html
EXPOSE 80
