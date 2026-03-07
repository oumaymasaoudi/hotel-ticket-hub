# 🔧 Solution : Forcer le Rebuild du Frontend avec la Nouvelle IP

## Problème
L'image Docker actuelle sur la VM contient encore l'ancienne IP `13.49.44.219` compilée dans les fichiers JavaScript. Vite compile les variables d'environnement au moment du build, donc il faut reconstruire l'image.

## Solution 1 : Forcer un nouveau build via GitHub Actions (RECOMMANDÉ)

### Étape 1 : Vérifier que le workflow est correct
Le workflow utilise déjà `no-cache: true` pour forcer un rebuild complet.

### Étape 2 : Créer un commit vide pour déclencher le pipeline
```bash
cd hotel-ticket-hub
git commit --allow-empty -m "chore: force frontend rebuild with new backend IP"
git push origin main
```

### Étape 3 : Vérifier le pipeline
- Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
- Vérifiez que le job "Frontend - Docker Build & Push" utilise bien :
  - `VITE_API_BASE_URL=http://13.63.15.86:8081/api`
  - `no-cache: true`

## Solution 2 : Rebuild manuel sur la VM (SI LE PIPELINE NE FONCTIONNE PAS)

### Se connecter à la VM Frontend
```bash
ssh -i ~/.ssh/votre-cle.pem utilisateur@13.50.221.51
```

### Vérifier l'image actuelle
```bash
cd /opt/hotel-ticket-hub-frontend-staging
docker compose ps
docker images | grep frontend
```

### Forcer le pull de la nouvelle image
```bash
cd /opt/hotel-ticket-hub-frontend-staging

# Se connecter à GitHub Container Registry
echo "VOTRE_GHCR_TOKEN" | docker login ghcr.io -u oumaymasaoudi --password-stdin

# Pull de la nouvelle image (force le téléchargement)
docker pull ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main --no-cache

# Arrêter l'ancien conteneur
docker compose down

# Démarrer avec la nouvelle image
DOCKER_IMAGE=ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main docker compose up -d

# Vérifier les logs
docker compose logs --tail=50
```

## Solution 3 : Vérifier les fichiers compilés dans l'image

### Inspecter l'image Docker
```bash
# Sur la VM
docker run --rm -it ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main sh

# Dans le conteneur, chercher l'ancienne IP
grep -r "13.49.44.219" /usr/share/nginx/html/ || echo "IP non trouvée - OK"

# Chercher la nouvelle IP
grep -r "13.63.15.86" /usr/share/nginx/html/ || echo "Nouvelle IP non trouvée - PROBLÈME"
```

## Vérification finale

### Dans le navigateur
1. Ouvrez le frontend : https://13.50.221.51
2. Ouvrez la console (F12)
3. Vérifiez les appels réseau :
   - ✅ Devrait être : `http://13.63.15.86:8081/api/...`
   - ❌ Ne devrait PAS être : `http://13.49.44.219:8081/api/...`

### Vérifier les fichiers JS compilés
```bash
# Sur la VM
docker exec hotel-ticket-hub-frontend-staging sh -c "grep -r '13.63.15.86' /usr/share/nginx/html/ | head -5"
```

Si vous voyez `13.63.15.86`, c'est bon ! Si vous voyez `13.49.44.219`, il faut rebuild.

## Fichiers à vérifier

1. **Dockerfile** (ligne 6) : `ARG VITE_API_BASE_URL=http://13.63.15.86:8081/api`
2. **Workflow CI/CD** (ligne 239) : `VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL || 'http://13.63.15.86:8081/api' }}`
3. **docker-compose.yml** : Utilise `${DOCKER_IMAGE}` qui doit pointer vers la nouvelle image

## Note importante

L'IP est compilée dans les fichiers JavaScript au moment du build. Il faut donc :
1. ✅ Rebuild l'image Docker avec la nouvelle IP
2. ✅ Pull la nouvelle image sur la VM
3. ✅ Redémarrer le conteneur avec la nouvelle image

Une simple modification du docker-compose.yml ne suffit pas si l'image contient encore l'ancienne IP compilée.
