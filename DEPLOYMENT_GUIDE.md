# 📚 Guide de Déploiement - Documentation Consolidée

## 🎯 **Objectif**

Ce guide consolide toutes les informations de déploiement pour éviter la duplication et améliorer la maintenabilité.

---

## 📋 **Configuration d'Environnement**

### **Variables d'Environnement**

Définissez ces variables selon votre environnement :

```bash
# Configuration Frontend
export FRONTEND_VM_IP="${FRONTEND_VM_IP:-51.21.196.104}"
export FRONTEND_DEPLOYMENT_DIR="${FRONTEND_DEPLOYMENT_DIR:-/opt/hotel-ticket-hub-frontend-staging}"
export FRONTEND_REGISTRY="${FRONTEND_REGISTRY:-ghcr.io}"
export FRONTEND_IMAGE_NAME="${FRONTEND_IMAGE_NAME:-oumaymasaoudi/hotel-ticket-hub/frontend}"
export FRONTEND_IMAGE_TAG="${FRONTEND_IMAGE_TAG:-develop}"
export FRONTEND_FULL_IMAGE="${FRONTEND_REGISTRY}/${FRONTEND_IMAGE_NAME}:${FRONTEND_IMAGE_TAG}"

# Configuration Backend
export BACKEND_VM_IP="${BACKEND_VM_IP:-13.49.44.219}"
export BACKEND_DEPLOYMENT_DIR="${BACKEND_DEPLOYMENT_DIR:-/opt/hotel-ticket-hub-backend-staging}"

# Configuration GitHub
export GHCR_USER="${GHCR_USER:-oumaymasaoudi}"
export GHCR_TOKEN="${GHCR_TOKEN:-}"  # À définir depuis les secrets GitHub
```

---

## 🚀 **Déploiement Frontend**

### **1. Rebuild et Push (via GitHub Actions)**

```bash
cd hotel-ticket-hub
git add .
git commit -m "fix: resolve issues"
git push origin develop
```

### **2. Déploiement sur la VM**

```bash
# SSH sur la VM
ssh -i <key> ubuntu@$FRONTEND_VM_IP

# Script de déploiement
cd "$FRONTEND_DEPLOYMENT_DIR"

# Authentification GHCR
if [ -n "$GHCR_TOKEN" ]; then
  echo "$GHCR_TOKEN" | docker login "$FRONTEND_REGISTRY" -u "$GHCR_USER" --password-stdin
fi

# Déploiement
docker compose down
docker rmi "$FRONTEND_FULL_IMAGE" || true
docker compose pull
docker compose up -d

# Health check avec retry
MAX_RETRIES=10
RETRY_DELAY=2
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Retry $RETRY_COUNT/$MAX_RETRIES..."
  sleep $RETRY_DELAY
done
```

---

## 🔧 **Résolution de Problèmes**

### **Erreur "Hotel is not defined"**

1. Vérifier que le code source utilise `type Hotel`
2. Forcer un rebuild sans cache (voir workflow GitHub Actions)
3. Vider le cache du navigateur

### **Security Hotspots SonarQube**

Les exclusions sont configurées dans `sonar-project.properties` :
- `node_modules/**`
- `package*.json`
- `.github/workflows/**`

---

## 📝 **URLs de Test**

- **Frontend Staging** : `http://${FRONTEND_VM_IP:-51.21.196.104}`
- **Health Check** : `http://${FRONTEND_VM_IP:-51.21.196.104}/health`

---

**Ce guide consolide toutes les informations de déploiement !** 📚

