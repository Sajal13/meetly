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
# ============================================================

FROM dependencies AS source

COPY . .


# ============================================================
# API build
# ============================================================

FROM source AS api-builder

RUN pnpm turbo build --filter=@meetly/api...


# ============================================================
# Web build
# ============================================================

FROM source AS web-builder

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo build --filter=@meetly/web...


# ============================================================
# Admin build
# ============================================================

# FROM source AS admin-builder

# ENV NEXT_TELEMETRY_DISABLED=1

# RUN pnpm turbo build --filter=@meetly/admin...


# ============================================================
# API production image
# ============================================================

FROM node:24-alpine AS api

ENV NODE_ENV=production

WORKDIR /app

COPY --from=api-builder /app/package.json ./package.json
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]


# ============================================================
# Web production image
# ============================================================

FROM node:24-alpine AS web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=web-builder /app/apps/web/.next/standalone ./
COPY --from=web-builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]


# ============================================================
# Admin production image
# ============================================================

# FROM node:24-alpine AS admin

# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

# WORKDIR /app

# COPY --from=admin-builder /app/apps/admin/.next/standalone ./
# COPY --from=admin-builder /app/apps/admin/.next/static ./apps/admin/.next/static
# COPY --from=admin-builder /app/apps/admin/public ./apps/admin/public

# EXPOSE 3001

# CMD ["node", "apps/admin/server.js"]