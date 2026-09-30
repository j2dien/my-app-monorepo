FROM oven/bun:1.4.0 AS install

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN bun install --frozen-lockfile


FROM oven/bun:1.4.0 AS build

WORKDIR /app

COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=install /app/packages/contracts/node_modules ./packages/contracts/node_modules

COPY package.json bun.lock ./
COPY apps/api apps/api
COPY packages/contracts packages/contracts

WORKDIR /app/apps/api

RUN bun build \
  --target=bun \
  --production \
  --outdir=dist \
  ./src/index.ts


FROM oven/bun:1.4.0-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist

EXPOSE 3000

USER bun

CMD ["bun", "dist/index.js"]