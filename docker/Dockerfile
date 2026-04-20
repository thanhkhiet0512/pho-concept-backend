# =========================
# 1) Dependencies
# =========================
FROM public.ecr.aws/docker/library/node:22-alpine AS deps

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

# Force development so devDependencies are installed
ARG NODE_ENV=development
ENV NODE_ENV=development

COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup prisma ./prisma/

USER appuser

RUN npm ci


# =========================
# 2) Builder
# =========================
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

# Force development so nest build works
ARG NODE_ENV=development
ENV NODE_ENV=development

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:appgroup /app/package*.json ./
COPY --from=deps --chown=appuser:appgroup /app/prisma ./prisma

COPY --chown=appuser:appgroup . .

USER appuser

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev


# =========================
# 3) Runner (Production)
# =========================
FROM public.ecr.aws/docker/library/node:22-alpine AS runner

ENV NODE_ENV=production

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["sh", "-c", "npm run prisma:deploy && npm run start:prod"]
