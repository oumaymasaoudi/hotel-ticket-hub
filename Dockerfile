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

# Note: nginx:alpine runs as root by default to bind port 80 (<1024)
# This is standard practice for nginx containers. The nginx process
# itself drops privileges after binding the port. For production,
# consider using a reverse proxy (e.g., Traefik, Caddy) that handles
# port binding and forwards to nginx on a higher port.

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

