# 🔧 Commandes SSH pour VM Frontend

## 📍 **Vous êtes sur la VM Frontend**

> **Note** : Remplacez les variables ci-dessous par vos valeurs d'environnement si nécessaire.

### **Configuration (Variables d'Environnement)**

```bash
# Configuration - À adapter selon votre environnement
export DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-/opt/hotel-ticket-hub-frontend-staging}"
export REGISTRY="${REGISTRY:-ghcr.io}"
export IMAGE_NAME="${IMAGE_NAME:-oumaymasaoudi/hotel-ticket-hub/frontend}"
export IMAGE_TAG="${IMAGE_TAG:-develop}"
export FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
export GHCR_USER="${GHCR_USER:-oumaymasaoudi}"
export GHCR_TOKEN="${GHCR_TOKEN:-}"  # Définir depuis les secrets GitHub ou variables d'env
```

---

## ✅ **1. Aller dans le Bon Répertoire**

```bash
cd "$DEPLOYMENT_DIR"
```

---

## ✅ **2. Vérifier l'État Actuel**

```bash
# Vérifier les conteneurs
docker compose ps

# Vérifier les images
docker compose images

# Vérifier les logs
docker compose logs --tail=50
```

---

## ✅ **3. S'Authentifier à GHCR (Nécessaire)**

```bash
# Authentification à GHCR avant de pull l'image
# Option 1 : Utiliser un token depuis une variable d'environnement
if [ -n "$GHCR_TOKEN" ]; then
  echo "$GHCR_TOKEN" | docker login "$REGISTRY" -u "$GHCR_USER" --password-stdin
else
  # Option 2 : Authentification interactive
  echo "⚠️  GHCR_TOKEN non défini. Authentification interactive requise."
  docker login "$REGISTRY" -u "$GHCR_USER"
fi
```

> **Note** : Si les credentials sont déjà configurés dans `~/.docker/config.json`, cette étape peut être omise.

---

## ✅ **4. Forcer le Pull de la Nouvelle Image**

```bash
# Arrêter le conteneur
docker compose down

# Supprimer l'ancienne image (force le pull)
docker rmi "$FULL_IMAGE" || true

# Pull la nouvelle image depuis GHCR
docker compose pull

# Redémarrer
docker compose up -d
```

---

## ✅ **5. Vérifier le Déploiement avec Retry Logic**

```bash
# Vérifier que le conteneur tourne
docker compose ps

# Vérifier les logs
docker compose logs -f

# Tester le health check avec retry logic
MAX_RETRIES=10
RETRY_DELAY=2
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Health check attempt $RETRY_COUNT/$MAX_RETRIES failed. Retrying in ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Health check failed after $MAX_RETRIES attempts"
  docker compose logs
  exit 1
fi
```

---

## ✅ **6. Vérifier la Date de l'Image**

```bash
# Vérifier quand l'image a été créée
docker inspect "$FULL_IMAGE" | grep Created
```

La date doit être **récente** (après votre dernier push).

---

## 🔍 **Si l'Image n'Existe Pas Encore**

Si `docker compose pull` échoue, cela signifie que GitHub Actions n'a pas encore buildé la nouvelle image. Dans ce cas :

1. **Vérifier GitHub Actions** : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
2. **Attendre** que le workflow `docker-build` se termine
3. **Réessayer** `docker compose pull`

---

## 📝 **Script Complet (Copier-Coller)**

```bash
#!/bin/bash
# Configuration
export DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-/opt/hotel-ticket-hub-frontend-staging}"
export REGISTRY="${REGISTRY:-ghcr.io}"
export IMAGE_NAME="${IMAGE_NAME:-oumaymasaoudi/hotel-ticket-hub/frontend}"
export IMAGE_TAG="${IMAGE_TAG:-develop}"
export FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
export GHCR_USER="${GHCR_USER:-oumaymasaoudi}"

# Aller dans le répertoire
cd "$DEPLOYMENT_DIR"

# Authentification GHCR
if [ -n "$GHCR_TOKEN" ]; then
  echo "$GHCR_TOKEN" | docker login "$REGISTRY" -u "$GHCR_USER" --password-stdin
else
  docker login "$REGISTRY" -u "$GHCR_USER"
fi

# Arrêter et supprimer l'ancienne image
docker compose down
docker rmi "$FULL_IMAGE" || true

# Pull la nouvelle image
docker compose pull

# Redémarrer
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
  echo "⏳ Health check attempt $RETRY_COUNT/$MAX_RETRIES failed. Retrying in ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Health check failed after $MAX_RETRIES attempts"
  docker compose logs
  exit 1
fi

# Vérifier les logs
docker compose logs --tail=50
```

---

**Exécutez ces commandes maintenant !** 🚀

