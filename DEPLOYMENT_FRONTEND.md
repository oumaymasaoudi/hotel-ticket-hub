# 🚀 Déploiement Frontend - Guide Complet

## 📋 Vue d'ensemble

Déploiement du frontend React/Vite sur la VM frontend (51.21.196.104) avec Docker et Nginx.

---

## 🐳 Option 1 : Déploiement avec Docker + Nginx (Recommandé)

### Étape 1 : Créer le Dockerfile

Créez `Dockerfile` dans `hotel-ticket-hub/` :

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Étape 2 : Créer la configuration Nginx

Créez `nginx.conf` dans `hotel-ticket-hub/` :

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Étape 3 : Créer docker-compose.yml

Créez `docker-compose.yml` dans `hotel-ticket-hub/` :

```yaml
services:
  frontend:
    image: ${DOCKER_IMAGE:-hotel-ticket-hub-frontend:latest}
    container_name: hotel-ticket-hub-frontend-staging
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-80}:80"
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://13.49.44.219:8081/api}
    networks:
      - frontend-network

networks:
  frontend-network:
    driver: bridge
```

### Étape 4 : Créer .dockerignore

Créez `.dockerignore` dans `hotel-ticket-hub/` :

```
node_modules
dist
.git
.github
.idea
*.md
.env
.env.local
coverage
.vscode
.DS_Store
```

### Étape 5 : Modifier le workflow GitHub Actions

Ajoutez le déploiement dans `.github/workflows/frontend-ci.yml` :

```yaml
  # ============================================
  # DOCKER BUILD & PUSH (for develop branch)
  # ============================================
  docker-build:
    name: Frontend - Docker Build & Push
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/frontend
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VITE_API_BASE_URL=http://13.49.44.219:8081/api

  # ============================================
  # DEPLOY TO STAGING (for develop branch)
  # ============================================
  deploy-staging:
    name: Frontend - Deploy to Staging
    runs-on: ubuntu-latest
    needs: [docker-build]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment: staging
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Copy docker-compose to staging
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.FRONTEND_STAGING_HOST }}
          username: ${{ secrets.FRONTEND_STAGING_USER }}
          key: ${{ secrets.FRONTEND_STAGING_SSH_PRIVATE_KEY }}
          source: "docker-compose.yml"
          target: "/opt/hotel-ticket-hub-frontend-staging/"
          strip_components: 0

      - name: Deploy to staging VM
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.FRONTEND_STAGING_HOST }}
          username: ${{ secrets.FRONTEND_STAGING_USER }}
          key: ${{ secrets.FRONTEND_STAGING_SSH_PRIVATE_KEY }}
          script: |
            set -e
            cd /opt/hotel-ticket-hub-frontend-staging
            
            # Log in to GitHub Container Registry
            echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Pull latest image
            export DOCKER_IMAGE=ghcr.io/${{ github.repository }}/frontend:develop
            docker pull $DOCKER_IMAGE || docker pull ghcr.io/${{ github.repository }}/frontend:latest
            
            # Stop and remove old container
            docker compose down || true
            
            # Start new container
            export DOCKER_IMAGE=$DOCKER_IMAGE
            export VITE_API_BASE_URL=http://13.49.44.219:8081/api
            docker compose up -d
            
            # Wait for startup
            sleep 5
            
            # Show logs
            docker compose logs --tail=50
            
            # Verify container is running
            docker ps | grep hotel-ticket-hub-frontend-staging
```

---

## 🖥️ Option 2 : Déploiement direct avec Nginx (Sans Docker)

### Étape 1 : Configurer la VM frontend

```bash
# Se connecter à la VM frontend
ssh -i github-actions-key ubuntu@51.21.196.104

# Installer Nginx
sudo apt update
sudo apt install -y nginx

# Créer le répertoire de déploiement
sudo mkdir -p /var/www/hotel-ticket-hub-frontend
sudo chown -R ubuntu:ubuntu /var/www/hotel-ticket-hub-frontend
```

### Étape 2 : Configurer Nginx

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/hotel-ticket-hub-frontend
```

Collez :

```nginx
server {
    listen 80;
    server_name 51.21.196.104;

    root /var/www/hotel-ticket-hub-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/hotel-ticket-hub-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 3 : Modifier le workflow pour déployer les fichiers

Ajoutez dans `.github/workflows/frontend-ci.yml` :

```yaml
  deploy-staging:
    name: Frontend - Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment: staging
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist

      - name: Deploy to staging VM
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.FRONTEND_STAGING_HOST }}
          username: ${{ secrets.FRONTEND_STAGING_USER }}
          key: ${{ secrets.FRONTEND_STAGING_SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/var/www/hotel-ticket-hub-frontend/"
          strip_components: 1

      - name: Restart Nginx
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.FRONTEND_STAGING_HOST }}
          username: ${{ secrets.FRONTEND_STAGING_USER }}
          key: ${{ secrets.FRONTEND_STAGING_SSH_PRIVATE_KEY }}
          script: |
            sudo systemctl reload nginx
```

---

## 🔧 Configuration des Secrets GitHub

Ajoutez ces secrets dans GitHub → Settings → Secrets and variables → Actions :

- `FRONTEND_STAGING_HOST` : `51.21.196.104`
- `FRONTEND_STAGING_USER` : `ubuntu`
- `FRONTEND_STAGING_SSH_PRIVATE_KEY` : Contenu de `github-actions-key` (clé privée)
- `GHCR_TOKEN` : Token GitHub pour accéder au registry (même que pour le backend)

---

## ✅ Checklist de déploiement

- [ ] Dockerfile créé
- [ ] nginx.conf créé
- [ ] docker-compose.yml créé
- [ ] .dockerignore créé
- [ ] Workflow GitHub Actions modifié
- [ ] Secrets GitHub configurés
- [ ] Docker installé sur la VM frontend
- [ ] Fichier .env créé sur la VM (si nécessaire)
- [ ] Security Groups AWS configurés (port 80 ouvert)

---

## 🧪 Tester le déploiement

```bash
# Sur la VM frontend
docker ps
curl http://localhost/health
```

Ou depuis votre navigateur :
```
http://51.21.196.104
```

---

## 📝 Notes importantes

1. **Variable d'environnement** : `VITE_API_BASE_URL` doit être définie au moment du build, pas au runtime
2. **Nginx** : Sert les fichiers statiques et gère le routing SPA
3. **Cache** : Les assets statiques sont mis en cache pour améliorer les performances
4. **Health check** : Endpoint `/health` pour vérifier que le service fonctionne

---

## 🐛 Dépannage

### Le frontend ne charge pas

```bash
# Vérifier les logs Docker
docker compose logs -f

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Erreur 404 sur les routes

Vérifiez que `nginx.conf` contient `try_files $uri $uri/ /index.html;`

### L'API ne se connecte pas

Vérifiez que `VITE_API_BASE_URL` est correcte dans le build et que le backend est accessible.

