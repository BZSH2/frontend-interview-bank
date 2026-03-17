FROM node:20-bookworm-slim AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY app-uni/package.json ./app-uni/package.json
COPY api-server/package.json ./api-server/package.json
COPY admin-web/package.json ./admin-web/package.json

RUN HUSKY=0 pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter app-uni build:h5

FROM nginx:1.27-alpine
COPY deploy/nginx/frontend-interview-bank-app.container.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/app-uni/dist/build/h5 /usr/share/nginx/html
EXPOSE 80
