# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json

# COPY packages/api-client/package.json packages/api-client/package.json
# COPY packages/types/package.json packages/types/package.json
# COPY packages/validation/package.json packages/validation/package.json
# COPY packages/config/package.json packages/config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN pnpm install --frozen-lockfile


# ============================================================
# Source
# ------------------------------------------------------------
# .env / .env.* are excluded by .dockerignore, so no local
# secrets can end up in any layer here.
# ============================================================

FROM dependencies AS source

COPY . .


# ============================================================
# API build
# ------------------------------------------------------------
# No build args: the API needs no environment at build time.
# Runtime variables are injected by docker-compose.yml.
# ============================================================

FROM source AS api-builder

RUN pnpm turbo build --filter=@meetly/api...


# ============================================================
# Web build
# ------------------------------------------------------------
# NEXT_PUBLIC_* values are inlined into the client bundle by
# `next build`, so they must exist at BUILD time. They are public
# by definition. Never pass secrets as build args.
# ============================================================

FROM source AS web-builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo build --filter=@meetly/web...


# ============================================================
# Admin build
# ============================================================

# FROM source AS admin-builder

# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# ENV NEXT_TELEMETRY_DISABLED=1

# RUN pnpm turbo build --filter=@meetly/admin...


# ============================================================
# API production image (also runs the worker)
# ------------------------------------------------------------
# pnpm node_modules are symlink-based: dependencies live in
# apps/api/node_modules (links into the root .pnpm store) and
# workspace packages are linked from /app/packages, so all of
# them are copied. Later optimisation: `pnpm deploy` for a
# pruned production tree.
# ============================================================

FROM node:24-alpine AS api

ENV NODE_ENV=production

WORKDIR /app

COPY --from=api-builder --chown=node:node /app/package.json ./package.json
COPY --from=api-builder --chown=node:node /app/node_modules ./node_modules
COPY --from=api-builder --chown=node:node /app/packages ./packages
COPY --from=api-builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=api-builder --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=api-builder --chown=node:node /app/apps/api/dist ./apps/api/dist

USER node

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]


# ============================================================
# Web production image
# ============================================================

FROM node:24-alpine AS web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=web-builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=web-builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-builder --chown=node:node /app/apps/web/public ./apps/web/public

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]


# ============================================================
# Admin production image
# ============================================================

# FROM node:24-alpine AS admin

# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV PORT=3001
# ENV HOSTNAME=0.0.0.0

# WORKDIR /app

# COPY --from=admin-builder --chown=node:node /app/apps/admin/.next/standalone ./
# COPY --from=admin-builder --chown=node:node /app/apps/admin/.next/static ./apps/admin/.next/static
# COPY --from=admin-builder --chown=node:node /app/apps/admin/public ./apps/admin/public

# USER node

# EXPOSE 3001

# CMD ["node", "apps/admin/server.js"]