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

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Change ownership of nginx directories to nginx user (non-root)
# The nginx:alpine image already has a 'nginx' user (UID 101)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /etc/nginx/conf.d

# Switch to non-root user (nginx user already exists in nginx:alpine)
USER nginx

# Expose port 8080 (non-privileged port)
# Note: In production, use a reverse proxy (Traefik, Caddy, etc.) 
# that binds to port 80 and forwards to this container on port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx as non-root user
CMD ["nginx", "-g", "daemon off;"]

