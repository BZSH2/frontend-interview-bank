FROM docker.m.daocloud.io/library/node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG VITE_ADMIN_TOKEN=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ADMIN_TOKEN=${VITE_ADMIN_TOKEN}

COPY package.json pnpm-workspace.yaml .
COPY tsconfig.base.json .
COPY admin-web/package.json ./admin-web/package.json
COPY app-uni/package.json ./app-uni/package.json
COPY api-server/package.json ./api-server/package.json

RUN npm config set registry https://registry.npmmirror.com \
  && npm install -g pnpm@10.32.1
RUN pnpm config set registry https://registry.npmmirror.com \
  && pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm --filter admin-web build

FROM docker.m.daocloud.io/library/nginx:1.27-alpine
COPY deploy/nginx/admin-web.container.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/admin-web/dist /usr/share/nginx/html
EXPOSE 80
