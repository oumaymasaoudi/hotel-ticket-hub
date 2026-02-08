# 🔍 Vérification de l'IP Backend dans le Frontend

## Problème
Le frontend utilise encore l'ancienne IP `13.49.44.219` au lieu de `13.63.15.86`.

## Solution immédiate : Vérifier et forcer le redéploiement

### Option 1 : Vérifier via GitHub Actions

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
2. Ouvrez le dernier workflow qui a réussi
3. Vérifiez le job "Frontend - Docker Build & Push"
4. Dans les logs, cherchez : `VITE_API_BASE_URL=http://13.63.15.86:8081/api`
5. Vérifiez le job "Frontend - Deploy to Staging" - est-ce qu'il a réussi ?

### Option 2 : Vérifier sur la VM Frontend

```bash
# Se connecter à la VM
ssh -i ~/.ssh/votre-cle.pem utilisateur@13.50.221.51

# Aller dans le répertoire
cd /opt/hotel-ticket-hub-frontend-staging

# Vérifier l'image actuelle
docker images | grep frontend

# Vérifier le conteneur
docker ps | grep frontend

# Vérifier l'IP dans les fichiers compilés
docker exec hotel-ticket-hub-frontend-staging sh -c "grep -r '13.63.15.86' /usr/share/nginx/html/ | head -3"
```

**Si vous voyez `13.63.15.86`** → L'image est correcte, mais peut-être que le conteneur n'a pas été redémarré.

**Si vous voyez `13.49.44.219`** → L'image est ancienne, il faut rebuild.

### Option 3 : Forcer le redéploiement manuel

```bash
# Sur la VM Frontend
cd /opt/hotel-ticket-hub-frontend-staging

# Se connecter à GitHub Container Registry
echo "VOTRE_GHCR_TOKEN" | docker login ghcr.io -u oumaymasaoudi --password-stdin

# Supprimer l'ancienne image
docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main || true

# Pull de la nouvelle image (force le téléchargement)
docker pull ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main

# Arrêter l'ancien conteneur
docker compose down

# Redémarrer avec la nouvelle image
DOCKER_IMAGE=ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main docker compose up -d

# Vérifier
docker compose logs --tail=50
```

### Option 4 : Utiliser le script automatique

```bash
# Copier le script sur la VM
scp scripts/force-redeploy-frontend.sh utilisateur@13.50.221.51:/tmp/

# Se connecter à la VM
ssh utilisateur@13.50.221.51

# Rendre exécutable
chmod +x /tmp/force-redeploy-frontend.sh

# Exécuter (avec le token GHCR)
GHCR_TOKEN="votre_token" /tmp/force-redeploy-frontend.sh
```

## Vérification finale dans le navigateur

1. Ouvrez : https://13.50.221.51
2. Ouvrez la console (F12) → Network
3. Regardez les appels API :
   - ✅ Devrait être : `http://13.63.15.86:8081/api/...`
   - ❌ Ne devrait PAS être : `http://13.49.44.219:8081/api/...`

## Si le problème persiste

1. Vérifiez que le pipeline GitHub Actions a bien terminé
2. Vérifiez que l'image Docker a bien été pushée vers GitHub Container Registry
3. Vérifiez que le déploiement sur la VM a bien réussi
4. Vérifiez que le conteneur utilise bien la nouvelle image

## Fichiers à vérifier

- `Dockerfile` ligne 6 : `ARG VITE_API_BASE_URL=http://13.63.15.86:8081/api` ✅
- `.github/workflows/frontend-ci.yml` ligne 239 : `VITE_API_BASE_URL=...13.63.15.86...` ✅
- `docker-compose.yml` : Utilise `${DOCKER_IMAGE}` ✅

Le problème est probablement que l'image sur la VM n'a pas été mise à jour.
