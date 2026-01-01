# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Build argument for API URL (must be declared early, before any COPY that might use it)
ARG VITE_API_BASE_URL=http://13.49.44.219:8081/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (explicitly exclude sensitive files via .dockerignore)
# .dockerignore already excludes: .env, .git, node_modules, etc.
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY tailwind.config.ts postcss.config.js ./
# Copy ESLint config files (both formats may exist)
COPY .eslintrc.json eslint.config.js components.json ./

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf

# Copy custom entrypoint script and create nginx directories with permissions
# Must be done as root before switching to nginx user
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /var/run/nginx && \
    chown -R nginx:nginx /etc/nginx/nginx.conf && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /etc/nginx/conf.d && \
    chmod -R 755 /var/run/nginx && \
    grep -q "pid /var/run/nginx/nginx.pid" /etc/nginx/nginx.conf || \
    (echo "ERROR: nginx.conf pid path not set correctly" >&2 && exit 1)

# Switch to non-root user (nginx user already exists in nginx:alpine)
USER nginx

# Expose port 8080 (non-privileged port)
# Note: In production, use a reverse proxy (Traefik, Caddy, etc.) 
# that binds to port 80 and forwards to this container on port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Use custom entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]

