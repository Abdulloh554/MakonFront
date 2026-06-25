FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/tsconfig.json ./
COPY frontend/next.config.ts ./
COPY frontend/public/ ./public/
COPY frontend/app/ ./app/
COPY frontend/components/ ./components/
COPY frontend/hooks/ ./hooks/
COPY frontend/lib/ ./lib/
COPY frontend/services/ ./services/
COPY frontend/store/ ./store/
COPY shared/ ./shared/

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["next", "start"]
