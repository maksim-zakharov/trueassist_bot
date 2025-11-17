ARG FRONTEND_IMAGE
FROM ${FRONTEND_IMAGE} as frontend-builder

FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf