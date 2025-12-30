# 🚀 Frontend - Guide de Déploiement Complet

## 📋 Vue d'ensemble

Ce projet frontend est **séparé** du backend et déployé indépendamment sur la VM frontend (51.21.196.104).

**Stack technique :**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Docker + Nginx (production)

---

## 🏗️ Architecture

```
┌─────────────────┐
│  GitHub Actions │
│                 │
│  1. Lint/Test   │
│  2. Build       │
│  3. Docker Build│
│  4. Push GHCR   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub         │
│  Container      │
│  Registry       │
│  (ghcr.io)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend VM    │
│  51.21.196.104  │
│                 │
│  Docker + Nginx │
│  Port 80        │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  13.49.44.219   │
│  Port 8081      │
└─────────────────┘
```

---

## 📁 Structure du projet

```
hotel-ticket-hub/
├── src/                    # Code source React
│   ├── components/         # Composants React
│   ├── pages/             # Pages de l'application
│   ├── services/          # Services API
│   ├── hooks/             # Hooks React personnalisés
│   └── config.ts          # Configuration API
├── public/                # Fichiers statiques
├── dist/                  # Build de production (généré)
├── Dockerfile             # Image Docker
├── docker-compose.yml     # Configuration Docker Compose
├── nginx.conf             # Configuration Nginx
├── .github/workflows/     # CI/CD GitHub Actions
└── package.json           # Dépendances npm
```

---

## 🔧 Configuration

### Variables d'environnement

Le frontend utilise `VITE_API_BASE_URL` pour se connecter au backend.

**Important** : Cette variable doit être définie **au moment du build**, pas au runtime.

**Valeurs par défaut :**
- Développement local : `http://localhost:8080/api`
- Staging : `http://13.49.44.219:8081/api`

**Dans le Dockerfile :**
```dockerfile
ARG VITE_API_BASE_URL=http://13.49.44.219:8081/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
```

---

## 🚀 Déploiement

### Option 1 : Déploiement automatique (Recommandé)

Le déploiement se fait automatiquement via GitHub Actions à chaque push vers `develop`.

**Workflow :**
1. Lint & Type Check
2. Tests & Coverage
3. Build
4. SonarQube Analysis
5. Docker Build & Push (sur `develop`)
6. Deploy to Staging (sur `develop`)

### Option 2 : Déploiement manuel

```bash
# Build l'image Docker
docker build -t hotel-ticket-hub-frontend:local --build-arg VITE_API_BASE_URL=http://13.49.44.219:8081/api .

# Run l'image
docker run -d -p 80:80 hotel-ticket-hub-frontend:local
```

---

## 📝 Configuration GitHub Secrets

Dans GitHub → Settings → Secrets and variables → Actions :

| Secret | Valeur | Description |
|--------|--------|-------------|
| `FRONTEND_STAGING_HOST` | `51.21.196.104` | IP de la VM frontend |
| `FRONTEND_STAGING_USER` | `ubuntu` | Utilisateur SSH |
| `FRONTEND_STAGING_SSH_PRIVATE_KEY` | Contenu de `github-actions-key` | Clé privée SSH |
| `GHCR_TOKEN` | Token GitHub | Pour accéder au registry Docker |

---

## 🖥️ Configuration de la VM Frontend

### 1. Installer Docker

```bash
ssh -i github-actions-key ubuntu@51.21.196.104

# Installer Docker (voir SETUP_FRONTEND_STAGING.md)
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu
```

### 2. Créer le répertoire

```bash
sudo mkdir -p /opt/hotel-ticket-hub-frontend-staging
sudo chown -R ubuntu:ubuntu /opt/hotel-ticket-hub-frontend-staging
```

### 3. Configurer les Security Groups AWS

- Port 80 (HTTP) : Ouvrir depuis `0.0.0.0/0` (ou restreindre)

---

## 🧪 Tests locaux

### Développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

### Build local

```bash
# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

### Tests

```bash
# Lancer les tests
npm test

# Tests avec coverage
npm run test:coverage

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🐳 Docker

### Build local

```bash
# Build l'image
docker build -t hotel-ticket-hub-frontend:local --build-arg VITE_API_BASE_URL=http://localhost:8080/api .

# Run l'image
docker run -d -p 80:80 hotel-ticket-hub-frontend:local

# Tester
curl http://localhost/health
```

### Avec docker-compose

```bash
# Créer un fichier .env.local
cat > .env.local << EOF
DOCKER_IMAGE=hotel-ticket-hub-frontend:local
FRONTEND_PORT=80
EOF

# Démarrer
docker compose --env-file .env.local up -d

# Voir les logs
docker compose logs -f
```

---

## 📊 CI/CD Pipeline

### Jobs du workflow

1. **Lint & Type Check** : ESLint + TypeScript
2. **Test & Coverage** : Jest + Coverage
3. **Build** : Build Vite
4. **SonarQube** : Analyse de code
5. **Docker Build & Push** : Build et push vers GHCR (sur `develop`)
6. **Deploy to Staging** : Déploiement sur la VM (sur `develop`)

### Déclencheurs

- **Push sur `main` ou `develop`** : Lint, Test, Build, SonarQube
- **Push sur `develop`** : + Docker Build & Deploy
- **Pull Request** : Lint, Test, Build, SonarQube (pas de déploiement)

---

## 🔗 Connexion au Backend

Le frontend se connecte au backend via l'URL configurée dans `VITE_API_BASE_URL`.

**Fichier de configuration :** `src/config.ts`

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

**Endpoints utilisés :**
- `/api/auth/login`
- `/api/auth/register`
- `/api/tickets/*`
- `/api/users/*`
- etc.

---

## 🐛 Dépannage

### Le frontend ne se charge pas

```bash
# Vérifier les logs Docker
docker compose logs -f

# Vérifier que le conteneur tourne
docker ps
```

### Erreur 404 sur les routes

Vérifiez que `nginx.conf` contient :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### L'API ne se connecte pas

1. Vérifier que `VITE_API_BASE_URL` est correcte dans le build
2. Vérifier que le backend est accessible depuis la VM frontend
3. Vérifier les CORS sur le backend

### Erreur de build Docker

```bash
# Build avec logs détaillés
docker build --progress=plain --no-cache -t test .

# Vérifier les fichiers nécessaires
ls -la Dockerfile nginx.conf docker-compose.yml
```

---

## 📚 Documentation

- **`DEPLOYMENT_FRONTEND.md`** : Guide de déploiement détaillé
- **`SETUP_FRONTEND_STAGING.md`** : Configuration de la VM étape par étape
- **`COPY_SSH_KEY_FRONTEND.md`** : Configuration SSH

---

## ✅ Checklist de déploiement

- [ ] Docker installé sur la VM frontend
- [ ] Répertoire `/opt/hotel-ticket-hub-frontend-staging` créé
- [ ] Secrets GitHub configurés
- [ ] Clé SSH copiée sur la VM frontend
- [ ] Security Groups AWS configurés (port 80)
- [ ] Workflow GitHub Actions configuré
- [ ] Dockerfile et nginx.conf créés
- [ ] docker-compose.yml créé
- [ ] Tests locaux passent
- [ ] Build local fonctionne

---

## 🎯 URLs

- **Frontend Staging** : http://51.21.196.104
- **Backend Staging** : http://13.49.44.219:8081/api
- **Health Check** : http://51.21.196.104/health

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs Docker : `docker compose logs -f`
2. Vérifier les logs GitHub Actions
3. Consulter les guides de dépannage dans les fichiers `.md`

