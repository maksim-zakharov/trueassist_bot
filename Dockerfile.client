FROM node:18-alpine AS builder
WORKDIR /app
COPY client/package*.json .
RUN npm install
COPY client/ .
RUN npm run build

FROM alpine:latest AS production
COPY --from=builder /app/dist /app/dist