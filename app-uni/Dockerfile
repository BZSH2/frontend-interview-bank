FROM docker.m.daocloud.io/library/node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json pnpm-workspace.yaml .
COPY tsconfig.base.json .
COPY app-uni/package.json ./app-uni/package.json
COPY api-server/package.json ./api-server/package.json
COPY api-server/prisma ./api-server/prisma
COPY admin-web/package.json ./admin-web/package.json

RUN npm config set registry https://registry.npmmirror.com \
  && npm install -g pnpm@10.32.1
RUN pnpm config set registry https://registry.npmmirror.com \
  && HUSKY=0 pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm --filter app-uni build:h5

FROM docker.m.daocloud.io/library/nginx:1.27-alpine
COPY deploy/nginx/app-uni.container.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/app-uni/dist/build/h5 /usr/share/nginx/html
EXPOSE 80
