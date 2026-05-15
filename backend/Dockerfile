FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN set -eux \
  && npx prisma generate \
  && rm -f tsconfig.build.tsbuildinfo \
  && npm run build \
  && test -f dist/main.js \
  || (echo "nest build did not produce dist/main.js" >&2; ls -la dist 2>/dev/null || echo "dist missing"; exit 1)

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 4000
# 운영/CI에서 compose up만 할 때도 스키마가 적용되도록 마이그레이션 후 기동
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main.js"]
