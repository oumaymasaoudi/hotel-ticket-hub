# 🔧 Fix Docker Compose Image - Problème Identifié

## ⚠️ **Problème**

Le `docker-compose.yml` essaie de pull `hotel-ticket-hub-frontend:latest` au lieu de `ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop`.

---

## ✅ **Solution : Vérifier et Corriger**

### **Sur la VM, exécutez :**

```bash
# 1. Vérifier le docker-compose.yml
cat docker-compose.yml

# 2. Vérifier si une variable d'environnement est définie
cat .env 2>/dev/null || echo "Pas de fichier .env"

# 3. Définir la variable DOCKER_IMAGE et redémarrer
export DOCKER_IMAGE=ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop
docker compose pull
docker compose up -d

# 4. Vérifier
docker compose ps
docker compose logs -f
```

---

## 🔍 **Alternative : Modifier docker-compose.yml**

Si la variable d'environnement ne fonctionne pas, modifier directement le fichier :

```bash
# Sur la VM
cd /opt/hotel-ticket-hub-frontend-staging

# Vérifier le contenu actuel
cat docker-compose.yml

# Si l'image est incorrecte, la corriger
# (Je vais vérifier le fichier et vous donner la commande exacte)
```

---

**Exécutez d'abord les commandes de vérification !** 🔍

