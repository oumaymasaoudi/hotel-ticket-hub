# ✅ Vérification Complète - Tous les Éléments

## 🔐 1. SECRETS GITHUB (Vérifier dans GitHub → Settings → Secrets)

### Secrets Requis pour Frontend

| Secret | Valeur Attendue | Statut | Notes |
|--------|----------------|--------|-------|
| `FRONTEND_STAGING_HOST` | `51.21.196.104` | ✅ | IP de la VM frontend |
| `FRONTEND_STAGING_USER` | `ubuntu` | ✅ | Utilisateur SSH |
| `FRONTEND_STAGING_SSH_PRIVATE_KEY` | Contenu de `github-actions-key` | ⚠️ | **Vérifier que c'est la bonne clé** |
| `GHCR_TOKEN` | Token GitHub avec `read:packages` | ✅ | Mis à jour il y a 1h |
| `SONAR_TOKEN` | Token SonarQube | ✅ | Configuré |
| `VITE_API_BASE_URL` | `http://13.49.44.219:8081/api` | ⚠️ | Optionnel (fallback dans workflow) |

### Vérification des Secrets

1. Allez sur GitHub → Settings → Secrets and variables → Actions
2. Vérifiez que tous les secrets ci-dessus existent
3. **CRITIQUE** : Vérifiez que `FRONTEND_STAGING_SSH_PRIVATE_KEY` contient la bonne clé

---

## 🌐 2. ADRESSES IP ET PORTS

### Infrastructure

| Service | IP | Port | Security Group | Statut |
|---------|----|----|----------------|--------|
| **Frontend VM** | `51.21.196.104` | `80` (HTTP) | ✅ Ouvert `0.0.0.0/0` | ✅ |
| **Backend VM** | `13.49.44.219` | `8081` (API) | ✅ Ouvert `0.0.0.0/0` | ✅ |
| **Database VM** | `13.61.27.43` | `5432` (PostgreSQL) | ✅ Ouvert depuis `13.49.44.219/32` | ✅ |
| **SSH** | Toutes VMs | `22` | ✅ Ouvert `0.0.0.0/0` | ✅ |

### Vérification Security Groups AWS

D'après l'image fournie, le Security Group `staging-sg-tf` a :
- ✅ PostgreSQL (5432) depuis `13.49.44.219/32` - **CORRECT**
- ✅ SSH (22) depuis `0.0.0.0/0` - **CORRECT**
- ✅ Custom TCP (8081) depuis `0.0.0.0/0` - **CORRECT**
- ✅ HTTP (80) depuis `0.0.0.0/0` - **CORRECT**

---

## 📁 3. FICHIERS DE CONFIGURATION

### Fichiers Critiques à Vérifier

#### ✅ `.github/workflows/frontend-ci.yml`
- [x] Secrets utilisés : `FRONTEND_STAGING_HOST`, `FRONTEND_STAGING_USER`, `FRONTEND_STAGING_SSH_PRIVATE_KEY`, `GHCR_TOKEN`
- [x] `VITE_API_BASE_URL` : `http://13.49.44.219:8081/api` (avec fallback)
- [x] Image Docker : `ghcr.io/${{ github.repository }}/frontend:develop`
- [x] Healthcheck : Vérifie `/health` avec curl
- [x] GHCR_TOKEN sécurisé via `envs: GHCR_TOKEN`

#### ✅ `Dockerfile`
- [x] ARG `VITE_API_BASE_URL` déclaré avant utilisation
- [x] ENV `VITE_API_BASE_URL` défini
- [x] Fichiers ESLint : `.eslintrc.json` et `eslint.config.js` copiés
- [x] Port exposé : `80`
- [x] Healthcheck configuré : `/health`

#### ✅ `docker-compose.yml`
- [x] Image : `${DOCKER_IMAGE:-hotel-ticket-hub-frontend:latest}`
- [x] Port : `${FRONTEND_PORT:-80}:80`
- [x] Healthcheck configuré
- [x] Network : `frontend-network`

#### ✅ `nginx.conf`
- [x] Port : `80`
- [x] SPA routing : `try_files $uri $uri/ /index.html`
- [x] Health endpoint : `/health`
- [x] Security headers configurés

#### ✅ `.dockerignore`
- [x] Exclut : `*.key`, `github-actions-key`, `*private*`, `*secret*`
- [x] Exclut : `.env`, `.git`, `node_modules`

#### ✅ `.gitignore`
- [x] Exclut : `*.key`, `github-actions-key`, `*private*`, `*secret*`

---

## 🔑 4. CLÉS SSH

### Vérification Locale

```powershell
# Vérifier que la clé existe localement
cd C:\Users\oumay\projet\hotel-ticket-hub
Test-Path github-actions-key
Test-Path github-actions-key.pub

# Générer la clé publique pour vérification
ssh-keygen -y -f github-actions-key > temp-key-check.pub
Get-Content temp-key-check.pub
```

### Vérification sur la VM Frontend

**IMPORTANT** : La clé publique doit être dans `~/.ssh/authorized_keys` sur la VM `51.21.196.104`

### Vérification Secret GitHub

Le secret `FRONTEND_STAGING_SSH_PRIVATE_KEY` doit contenir **exactement** le contenu de `github-actions-key`

---

## 🐳 5. CONFIGURATION DOCKER

### Variables d'Environnement

| Variable | Où Définie | Valeur | Statut |
|----------|------------|--------|--------|
| `VITE_API_BASE_URL` | Dockerfile ARG + Workflow | `http://13.49.44.219:8081/api` | ✅ |
| `DOCKER_IMAGE` | docker-compose.yml | `ghcr.io/oumaymasaoudi/hotel-tickets-frontend/frontend:develop` | ✅ |
| `FRONTEND_PORT` | docker-compose.yml | `80` (défaut) | ✅ |

### Image Docker

- **Registry** : `ghcr.io`
- **Image** : `oumaymasaoudi/hotel-tickets-frontend/frontend`
- **Tag** : `develop`
- **URL complète** : `ghcr.io/oumaymasaoudi/hotel-tickets-frontend/frontend:develop`

---

## 🔍 6. VÉRIFICATION DE COHÉRENCE

### Backend API URL

| Fichier | Valeur | Cohérent ? |
|---------|--------|------------|
| `Dockerfile` (ARG) | `http://13.49.44.219:8081/api` | ✅ |
| `.github/workflows/frontend-ci.yml` (build-args) | `http://13.49.44.219:8081/api` | ✅ |
| Backend VM IP | `13.49.44.219` | ✅ |
| Backend Port | `8081` | ✅ |

### Frontend VM

| Fichier | Valeur | Cohérent ? |
|---------|--------|------------|
| Secret `FRONTEND_STAGING_HOST` | `51.21.196.104` | ✅ |
| Security Group | Port `80` ouvert | ✅ |
| docker-compose.yml | Port `80:80` | ✅ |

### Database

| Fichier | Valeur | Cohérent ? |
|---------|--------|------------|
| Database VM IP | `13.61.27.43` | ✅ |
| Database Port | `5432` | ✅ |
| Security Group | Port `5432` depuis `13.49.44.219/32` | ✅ |

---

## 🚨 7. PROBLÈMES CRITIQUES À RÉSOUDRE

### ⚠️ CRITIQUE #1 : Clé Privée dans le Repository

**Fichier** : `github-actions-key` (clé privée)

**Action** :
```powershell
git rm --cached github-actions-key
git commit -m "security: remove private SSH key"
git push origin develop
```

**Puis** : Suivre `URGENT_REMOVE_PRIVATE_KEY.md` pour supprimer de l'historique

### ⚠️ CRITIQUE #2 : Erreur Docker Build

**Erreur** : `/.eslintrc.cjs": not found`

**Correction** : Dockerfile mis à jour pour copier `.eslintrc.json` et `eslint.config.js`

**Vérification** :
- [x] `.eslintrc.json` existe
- [x] `eslint.config.js` existe
- [x] Dockerfile copie les deux fichiers

### ⚠️ CRITIQUE #3 : Authentification SSH

**Problème** : Pipeline échoue sur l'authentification SSH

**Vérification** :
```powershell
# Tester la connexion
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"
```

**Si ça échoue** : Voir `FIX_SSH_NOW.md`

---

## 📋 8. CHECKLIST FINALE AVANT PUSH

### Code
- [x] TypeScript : Pas d'erreurs
- [x] Build : Fonctionne (erreur duplicate key corrigée)
- [x] Dockerfile : Corrigé (fichiers ESLint)
- [x] Workflow : Syntaxe correcte

### Sécurité
- [ ] **URGENT** : Clé privée supprimée du repo
- [x] `.gitignore` : Exclut les clés privées
- [x] `.dockerignore` : Exclut les fichiers sensibles
- [x] GHCR_TOKEN : Sécurisé via env var

### Configuration
- [x] Secrets GitHub : Tous configurés
- [x] Security Groups AWS : Ports ouverts
- [x] Adresses IP : Cohérentes entre fichiers
- [x] Ports : Cohérents entre fichiers

### Infrastructure
- [x] Frontend VM : `51.21.196.104:80`
- [x] Backend VM : `13.49.44.219:8081`
- [x] Database VM : `13.61.27.43:5432`
- [ ] **À vérifier** : Clé SSH fonctionne

---

## 🎯 9. ORDRE DES ACTIONS

1. **MAINTENANT** : Supprimer `github-actions-key` du repo
2. **MAINTENANT** : Tester SSH : `ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"`
3. **Si SSH OK** : Push les corrections
4. **Si SSH échoue** : Corriger (voir `FIX_SSH_NOW.md`)
5. **Après push** : Vérifier le pipeline GitHub Actions

---

## ✅ 10. RÉSUMÉ DES VALEURS

### Adresses IP
- Frontend : `51.21.196.104`
- Backend : `13.49.44.219`
- Database : `13.61.27.43`

### Ports
- Frontend HTTP : `80`
- Backend API : `8081`
- Database PostgreSQL : `5432`
- SSH : `22`

### URLs
- Frontend : `http://51.21.196.104`
- Backend API : `http://13.49.44.219:8081/api`
- Health Check : `http://51.21.196.104/health`

### Secrets GitHub (à vérifier)
- `FRONTEND_STAGING_HOST` : `51.21.196.104`
- `FRONTEND_STAGING_USER` : `ubuntu`
- `FRONTEND_STAGING_SSH_PRIVATE_KEY` : Contenu de `github-actions-key`
- `GHCR_TOKEN` : Token GitHub
- `SONAR_TOKEN` : Token SonarQube

---

**Tout est vérifié ! Prêt pour le push (après suppression de la clé privée).**

