# Istiqtab worker — pg-boss background jobs.
# Build context is the REPO ROOT (see docker-compose.yml: context: .).
FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ai/package.json packages/ai/package.json
COPY packages/incentives/package.json packages/incentives/package.json
COPY packages/partners/package.json packages/partners/package.json
COPY packages/wizard/package.json packages/wizard/package.json
COPY packages/notifications/package.json packages/notifications/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @istiqtab/worker...

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker
WORKDIR /app/apps/worker
CMD ["pnpm", "start"]
