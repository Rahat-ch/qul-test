# Build context is the REPO ROOT, not `app/`.
#
# The Next.js app lives in `app/`, but the QUL Resources it renders live in
# `data/` at the repo root and are pulled in as static `import`s (see the header
# comment in app/src/lib/spread.ts). The build therefore needs both directories,
# so Coolify must be pointed at this file with the repo root as its context.
#
# `app/next.config.ts` sets `outputFileTracingRoot` to the repo root, so the
# standalone output mirrors the repo layout: the server is emitted at
# `.next/standalone/app/server.js`, not at `.next/standalone/server.js`.

FROM node:24-alpine AS base
# corepack is pinned to the `packageManager` version in app/package.json so the
# image installs with the same pnpm that produced app/pnpm-lock.yaml.
ENV PNPM_VERSION=10.28.2
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo


# --- dependencies -----------------------------------------------------------
# Manifests only, so a source-only change does not re-run the install.
FROM base AS deps
COPY app/package.json app/pnpm-lock.yaml app/pnpm-workspace.yaml ./app/
WORKDIR /repo/app
RUN pnpm install --frozen-lockfile


# --- build ------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /repo/app/node_modules ./app/node_modules
# `data/` must be present: the JSON is inlined into the server bundle here, which
# is why the runner stage below needs no copy of it.
COPY data ./data
COPY app ./app
WORKDIR /repo/app
RUN pnpm build


# --- runtime ----------------------------------------------------------------
# Only the traced standalone output; no pnpm, no source, no data/.
FROM node:24-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /repo

# The standalone tree is rooted at the repo (outputFileTracingRoot), so this one
# copy lays down `app/server.js`, `app/.next/`, `app/package.json` and the traced
# `app/node_modules`.
COPY --from=builder --chown=node:node /repo/app/.next/standalone ./
# Standalone deliberately omits these two; without them the browser gets no CSS,
# no JS chunks and no Indopak font.
COPY --from=builder --chown=node:node /repo/app/.next/static ./app/.next/static
COPY --from=builder --chown=node:node /repo/app/public ./app/public

USER node
EXPOSE 3000
CMD ["node", "app/server.js"]
