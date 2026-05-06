FROM node:20-bookworm-slim AS base

RUN apt-get update \
 && apt-get install -y --no-install-recommends tzdata ca-certificates \
 && ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
 && dpkg-reconfigure -f noninteractive tzdata \
 && rm -rf /var/lib/apt/lists/*
ENV TZ=America/Sao_Paulo

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ARG SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --no-create-home nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
