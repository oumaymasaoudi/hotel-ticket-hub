#!/bin/bash

# Script pour forcer le redéploiement du frontend avec la nouvelle IP
# À exécuter sur la VM Frontend (13.50.221.51)

set -e

echo "🔧 Force redéploiement du frontend avec la nouvelle IP backend (13.63.15.86)"
echo ""

# Variables
APP_DIR="/opt/hotel-ticket-hub-frontend-staging"
CONTAINER_NAME="hotel-ticket-hub-frontend-staging"
IMAGE_NAME="ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:main"
GHCR_TOKEN="${GHCR_TOKEN:-}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Erreur: Le répertoire $APP_DIR n'existe pas"
    exit 1
fi

cd "$APP_DIR"

echo "1️⃣ Arrêt de l'ancien conteneur..."
docker compose down || true

echo ""
echo "2️⃣ Suppression de l'ancienne image locale (pour forcer le pull)..."
docker rmi "$IMAGE_NAME" || docker rmi "ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:latest" || true

echo ""
echo "3️⃣ Connexion à GitHub Container Registry..."
if [ -z "$GHCR_TOKEN" ]; then
    echo "⚠️  GHCR_TOKEN non défini. Utilisation de docker login interactif..."
    docker login ghcr.io
else
    echo "$GHCR_TOKEN" | docker login ghcr.io -u oumaymasaoudi --password-stdin
fi

echo ""
echo "4️⃣ Pull de la nouvelle image (force le téléchargement)..."
docker pull "$IMAGE_NAME" || docker pull "ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:latest"

echo ""
echo "5️⃣ Vérification de l'image..."
docker images | grep frontend

echo ""
echo "6️⃣ Démarrage avec la nouvelle image..."
export DOCKER_IMAGE="$IMAGE_NAME"
docker compose up -d

echo ""
echo "7️⃣ Attente du démarrage (30 secondes)..."
sleep 30

echo ""
echo "8️⃣ Vérification du conteneur..."
docker ps | grep "$CONTAINER_NAME" || echo "⚠️  Conteneur non trouvé"

echo ""
echo "9️⃣ Vérification des logs..."
docker compose logs --tail=20

echo ""
echo "🔟 Vérification de l'IP dans les fichiers compilés..."
docker exec "$CONTAINER_NAME" sh -c "grep -r '13.63.15.86' /usr/share/nginx/html/ 2>/dev/null | head -3" || echo "⚠️  Nouvelle IP non trouvée dans les fichiers compilés"

echo ""
echo "✅ Redéploiement terminé!"
echo ""
echo "📋 Vérifications finales:"
echo "   - Frontend: http://13.50.221.51"
echo "   - Health: http://13.50.221.51/health"
echo "   - Vérifiez la console du navigateur (F12) pour confirmer que les appels API pointent vers 13.63.15.86:8081"
