FROM node:18-alpine AS builder

WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .

RUN npm run build:ci

# Аргументы сборки (передаются через --build-arg)
ARG NODE_ENV
ARG DATABASE_URL
ARG SHADOW_DATABASE_URL
ARG PM2_PUBLIC_KEY
ARG PM2_SECRET_KEY

ENV NODE_ENV=$NODE_ENV
ENV DATABASE_URL=$DATABASE_URL
ENV SHADOW_DATABASE_URL=$SHADOW_DATABASE_URL
ENV PM2_PUBLIC_KEY=$PM2_PUBLIC_KEY
ENV PM2_SECRET_KEY=$PM2_SECRET_KEY

# Создаем .env файл из аргументов сборки
RUN echo "DATABASE_URL=$DATABASE_URL" >> .env && \
    echo "SHADOW_DATABASE_URL=$SHADOW_DATABASE_URL" >> .env && \
    echo "PM2_PUBLIC_KEY=$PM2_PUBLIC_KEY" >> .env && \
    echo "PM2_SECRET_KEY=$PM2_SECRET_KEY" >>

FROM node:18-alpine
WORKDIR /app

# Копируем зависимости, Pr-клиент и билд
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/dist ./dist
# Копируем схему Prisma
COPY --from=builder /app/prisma ./prisma

# Аргументы сборки (передаются через --build-arg)
ARG NODE_ENV
ARG DATABASE_URL
ARG SHADOW_DATABASE_URL
ARG PM2_PUBLIC_KEY
ARG PM2_SECRET_KEY

ENV NODE_ENV=$NODE_ENV
ENV DATABASE_URL=$DATABASE_URL
ENV SHADOW_DATABASE_URL=$SHADOW_DATABASE_URL
ENV PM2_PUBLIC_KEY=$PM2_PUBLIC_KEY
ENV PM2_SECRET_KEY=$PM2_SECRET_KEY

# Создаем .env файл из аргументов сборки
RUN echo "DATABASE_URL=$DATABASE_URL" >> .env && \
    echo "SHADOW_DATABASE_URL=$SHADOW_DATABASE_URL" >> .env && \
    echo "PM2_PUBLIC_KEY=$PM2_PUBLIC_KEY" >> .env && \
    echo "PM2_SECRET_KEY=$PM2_SECRET_KEY" >> .env && \
    echo "NODE_ENV=$NODE_ENV" >> .env

# Устанавливаем зависимости и генерируем Prisma Client
RUN npm ci --production
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/main.js"]