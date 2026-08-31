# ==========================================
# STAGE 1: DEPENDENCIES & BUILD
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar módulos nativos (ej. argon2)
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generar Prisma Client y compilar aplicación NestJS
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ==========================================
# STAGE 2: PRODUCTION RUNTIME
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Crear usuario sin privilegios root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar archivos compilados y dependencias de producción
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["node", "dist/main.js"]
