# 🔧 Commandes SSH pour VM Frontend

## 📍 **Vous êtes sur la VM Frontend (51.21.196.104)**

Exécutez ces commandes dans l'ordre :

---

## ✅ **1. Aller dans le Bon Répertoire**

```bash
cd /opt/hotel-ticket-hub-frontend-staging
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

## ✅ **3. Forcer le Pull de la Nouvelle Image**

```bash
# Arrêter le conteneur
docker compose down

# Supprimer l'ancienne image (force le pull)
docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop || true

# Pull la nouvelle image depuis GHCR
docker compose pull

# Redémarrer
docker compose up -d
```

---

## ✅ **4. Vérifier le Déploiement**

```bash
# Vérifier que le conteneur tourne
docker compose ps

# Vérifier les logs
docker compose logs -f

# Tester le health check
curl http://localhost/health
```

---

## ✅ **5. Vérifier la Date de l'Image**

```bash
# Vérifier quand l'image a été créée
docker inspect ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop | grep Created
```

La date doit être **récente** (après votre dernier push).

---

## 🔍 **Si l'Image n'Existe Pas Encore**

Si `docker compose pull` échoue, cela signifie que GitHub Actions n'a pas encore buildé la nouvelle image. Dans ce cas :

1. **Vérifier GitHub Actions** : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
2. **Attendre** que le workflow `docker-build` se termine
3. **Réessayer** `docker compose pull`

---

## 📝 **Commandes Complètes (Copier-Coller)**

```bash
cd /opt/hotel-ticket-hub-frontend-staging
docker compose down
docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop || true
docker compose pull
docker compose up -d
docker compose logs -f
```

---

**Exécutez ces commandes maintenant !** 🚀

