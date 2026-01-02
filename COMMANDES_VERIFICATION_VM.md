# 🔍 Commandes de Vérification sur la VM

## ✅ **Commandes à Exécuter Maintenant**

Exécutez ces commandes **sur la VM** pour vérifier que la nouvelle image est bien déployée :

```bash
# 1. Vérifier la date de création de l'image
docker inspect ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop | grep Created

# La date doit être RÉCENTE (il y a quelques minutes, après votre push)

# 2. Vérifier le hash du fichier JavaScript dans le conteneur
docker exec hotel-ticket-hub-frontend-staging ls -la /usr/share/nginx/html/assets/ | grep index

# Le nom du fichier doit être différent (nouveau hash)
# Exemple : index-XXXXX.js (le hash doit être différent de l'ancien Bw9zH6Fu)

# 3. Vérifier les logs du conteneur
docker compose logs --tail=20

# 4. Vérifier le statut du conteneur
docker compose ps

# 5. Vérifier que le health check fonctionne
curl http://localhost/health
```

---

## 🚨 **Si l'Image n'est PAS Récente**

Le pipeline GitHub Actions n'a peut-être pas terminé. Vérifiez :

1. Aller sur : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
2. Vérifier que le workflow `docker-build` est terminé (✅ vert)
3. Si pas terminé, attendre encore quelques minutes
4. Si terminé mais l'image n'est pas récente, forcer un nouveau pull :

```bash
# Forcer le pull sans cache
docker compose pull --no-cache
docker compose up -d
```

---

## 🔥 **SOLUTION PRINCIPALE : Cache du Navigateur**

**90% du temps, le problème vient du cache du navigateur !**

### **Méthode 1 : Navigation Privée (RECOMMANDÉ)**

1. **Fermer TOUS les onglets** du navigateur
2. Ouvrir une **nouvelle fenêtre de navigation privée** :
   - Chrome/Edge : `Ctrl + Shift + N`
   - Firefox : `Ctrl + Shift + P`
3. Aller sur : `http://51.21.196.104/dashboard/superadmin`
4. Se connecter
5. **Vérifier la console** (F12) : Plus d'erreur "Hotel is not defined" ✅

### **Méthode 2 : Vider le Cache Complet**

1. **Fermer COMPLÈTEMENT le navigateur** (tous les onglets)
2. Ouvrir le navigateur
3. Appuyer sur `Ctrl + Shift + Delete`
4. Sélectionner **"Tout le temps"**
5. Cocher **"Images et fichiers en cache"**
6. Cocher **"Cookies et autres données de sites"**
7. Cliquer **"Effacer les données"**
8. **Fermer et rouvrir le navigateur**
9. Aller sur : `http://51.21.196.104/dashboard/superadmin`

### **Méthode 3 : Désactiver le Cache (Temporaire)**

1. Ouvrir la console (F12)
2. Aller dans l'onglet **"Network"**
3. Cocher **"Disable cache"** (en haut)
4. **Garder la console ouverte**
5. Recharger la page : `Ctrl + Shift + R`

---

## 🔍 **Vérification dans la Console**

Après avoir vidé le cache :

1. Ouvrir la console (F12)
2. Aller dans l'onglet **"Network"**
3. Recharger la page (`Ctrl + Shift + R`)
4. Chercher le fichier `index-*.js`
5. **Vérifier le hash** : Il doit être différent de `index-Bw9zH6Fu.js`
6. **Vérifier la console** : Plus d'erreur "Hotel is not defined" ✅

---

**Le cache du navigateur est la cause principale ! Utilisez la navigation privée !** 🔥

