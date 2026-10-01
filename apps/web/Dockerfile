FROM oven/bun:1.4.0 AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN bun install --frozen-lockfile

COPY apps/web apps/web
COPY apps/api apps/api
COPY packages/contracts packages/contracts

WORKDIR /app/apps/web

RUN bun run build


FROM nginx:1.30.5-alpine AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]