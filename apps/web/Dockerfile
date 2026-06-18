# Istiqtab web — multi-stage build for the pnpm monorepo.
# Build context is the REPO ROOT (see docker-compose.yml: context: .).
FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ai/package.json packages/ai/package.json
COPY packages/incentives/package.json packages/incentives/package.json
COPY packages/partners/package.json packages/partners/package.json
COPY packages/wizard/package.json packages/wizard/package.json
COPY packages/notifications/package.json packages/notifications/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT_STANDALONE=1

# Build-time placeholder env vars — satisfy env.ts Zod validation at build time.
# The real secrets are injected at RUNTIME via docker-compose.yml environment section.
# These values are inert (they don't connect to any real service during build).
ENV DATABASE_URL=postgresql://build:placeholder@localhost:5432/istiqtab
ENV NEXTAUTH_SECRET=build-placeholder-minimum-32-chars-xxxxxxxx
ENV NEXTAUTH_URL=http://localhost:3000
ENV GOOGLE_CLIENT_ID=build-placeholder
ENV GOOGLE_CLIENT_SECRET=build-placeholder
ENV LINKEDIN_CLIENT_ID=build-placeholder
ENV LINKEDIN_CLIENT_SECRET=build-placeholder
ENV ANTHROPIC_API_KEY=sk-ant-build-placeholder-not-a-real-key
ENV RESEND_API_KEY=re_build-placeholder
ENV RESEND_FROM_EMAIL=Istiqtab <build-placeholder@example.com>
ENV R2_ACCOUNT_ID=build-placeholder
ENV R2_ACCESS_KEY_ID=build-placeholder
ENV R2_SECRET_ACCESS_KEY=build-placeholder
ENV R2_PRIVATE_BUCKET=istiqtab-private
ENV R2_PUBLIC_BUCKET=istiqtab-public
ENV R2_PUBLIC_URL=https://build-placeholder.r2.dev

RUN pnpm --filter web build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone output bundles the server + minimal node_modules.
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
