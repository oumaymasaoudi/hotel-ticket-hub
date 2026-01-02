# 🔍 Vérifier l'Image et le Cache

## ⚠️ **Problème Persistant**

L'erreur persiste même après le pull. Il faut vérifier :

1. **Date de l'image Docker** (doit être récente)
2. **Hash du fichier JavaScript** (doit être différent)
3. **Cache du navigateur** (CRITIQUE !)

---

## ✅ **Commandes de Vérification sur la VM**

```bash
# 1. Vérifier la date de création de l'image
docker inspect ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop | grep Created

# La date doit être RÉCENTE (après votre push, il y a quelques minutes)

# 2. Vérifier le hash du fichier JavaScript dans le conteneur
docker exec hotel-ticket-hub-frontend-staging ls -la /usr/share/nginx/html/assets/

# Le nom du fichier doit être différent (nouveau hash)
# Exemple : index-XXXXX.js (le hash doit être différent de l'ancien)

# 3. Vérifier les logs du conteneur
docker compose logs --tail=50

# 4. Vérifier le statut du conteneur
docker compose ps

# 5. Vérifier que le conteneur est healthy
curl http://localhost/health
```

---

## 🚨 **Si l'Image n'est Pas Récente**

Le pipeline GitHub Actions n'a peut-être pas terminé. Vérifiez :

1. Aller sur : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
2. Vérifier que le workflow `docker-build` est terminé (✅ vert)
3. Si pas terminé, attendre encore quelques minutes
4. Si terminé, réessayer le pull :

```bash
docker compose pull
docker compose up -d
```

---

## 🔥 **Solution Radicale : Vider TOUS les Caches**

### **1. Sur la VM : Nettoyer Complètement**

```bash
# Arrêter tout
docker compose down -v

# Supprimer TOUTES les images (y compris les anciennes)
docker images | grep hotel-ticket-hub | awk '{print $3}' | xargs docker rmi -f || true
docker system prune -a -f --volumes

# Attendre 2-3 minutes que GitHub Actions termine le build

# Pull la nouvelle image
docker compose pull

# Redémarrer
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

### **2. Sur le Navigateur : Vider COMPLÈTEMENT le Cache**

#### **Méthode 1 : Navigation Privée (Plus Simple)**

1. **Fermer TOUS les onglets** du navigateur
2. Ouvrir une **nouvelle fenêtre de navigation privée** :
   - Chrome/Edge : `Ctrl + Shift + N`
   - Firefox : `Ctrl + Shift + P`
3. Aller sur : `http://51.21.196.104/dashboard/superadmin`
4. Se connecter

#### **Méthode 2 : Vider le Cache Complet**

1. **Fermer COMPLÈTEMENT le navigateur** (tous les onglets)
2. Ouvrir le navigateur
3. Appuyer sur `Ctrl + Shift + Delete`
4. Sélectionner **"Tout le temps"**
5. Cocher **"Images et fichiers en cache"**
6. Cocher **"Cookies et autres données de sites"**
7. Cliquer **"Effacer les données"**
8. **Fermer et rouvrir le navigateur**
9. Aller sur : `http://51.21.196.104/dashboard/superadmin`

#### **Méthode 3 : Désactiver le Cache (Temporaire)**

1. Ouvrir la console (F12)
2. Aller dans l'onglet **"Network"**
3. Cocher **"Disable cache"**
4. Garder la console ouverte
5. Recharger la page : `Ctrl + Shift + R`

---

## 🔍 **Vérification Finale**

Après avoir vidé le cache :

1. **Ouvrir la console** (F12)
2. **Vérifier** : Plus d'erreur "Hotel is not defined" ✅
3. **Vérifier le hash du fichier** :
   - Onglet "Network" dans la console
   - Chercher `index-*.js`
   - Le hash doit être différent de l'ancien

---

## 💡 **Pourquoi Ça Ne Fonctionne Pas ?**

Le problème vient probablement de :
1. **Cache du navigateur** : L'ancien JavaScript est encore en cache (90% des cas)
2. **Image Docker** : L'image n'a pas été rebuildée (vérifier GitHub Actions)
3. **Hash identique** : Le build n'a pas changé (peu probable après nos modifications)

**Solution** : Vider TOUS les caches (navigateur + Docker) et utiliser la navigation privée.

---

**Le cache du navigateur est souvent la cause ! Utilisez la navigation privée !** 🔥

