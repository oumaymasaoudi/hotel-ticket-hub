# 🚨 COMMANDES URGENTES - Rebuild Complet

## ⚠️ **Problème**

L'erreur "Hotel is not defined" persiste car le build Docker utilise encore l'ancien code.

---

## ✅ **Solution : Rebuild Complet Sans Cache**

### **Étape 1 : Modifier le Workflow (Déjà Fait ✅)**

Le workflow a déjà `no-cache: true` pour Docker. Il faut aussi désactiver le cache npm.

### **Étape 2 : Push les Modifications**

```bash
cd hotel-ticket-hub

# 1. Vérifier les modifications
git status

# 2. Ajouter tous les fichiers
git add .

# 3. Commit
git commit -m "fix: force complete rebuild without any cache - resolve Hotel is not defined

- Disable npm cache in build job
- Docker build already has no-cache: true
- This will force a complete rebuild from scratch"

# 4. Push (DÉCLENCHE LE REBUILD SANS CACHE)
git push origin develop
```

### **Étape 3 : Attendre le Pipeline (5-10 minutes)**

1. Aller sur : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
2. Attendre que le workflow `docker-build` se termine
3. Vérifier que le build est réussi (✅ vert)

### **Étape 4 : Rebuild sur la VM (SANS CACHE)**

```bash
# SSH sur la VM frontend
ssh -i <votre-cle>.pem ubuntu@51.21.196.104

# Aller dans le répertoire
cd /opt/hotel-ticket-hub-frontend-staging

# Authentification GHCR (si nécessaire)
export GHCR_TOKEN="<votre-token>"
echo "$GHCR_TOKEN" | docker login ghcr.io -u oumaymasaoudi --password-stdin

# ARRÊTER ET SUPPRIMER TOUT
docker compose down -v
docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop || true
docker system prune -f

# PULL LA NOUVELLE IMAGE (sans cache)
docker compose pull

# Si l'image n'existe pas encore, attendre que GitHub Actions la build
# Sinon, redémarrer
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

### **Étape 5 : Vider le Cache du Navigateur (CRITIQUE !)**

**IMPORTANT** : Le navigateur cache l'ancien JavaScript. Il faut vider complètement le cache :

#### **Option A : Vider le Cache Complet**

1. **Chrome/Edge** :
   - Appuyer sur `Ctrl + Shift + Delete`
   - Sélectionner "Tout le temps"
   - Cocher "Images et fichiers en cache"
   - Cliquer "Effacer les données"

2. **Firefox** :
   - Appuyer sur `Ctrl + Shift + Delete`
   - Sélectionner "Tout"
   - Cocher "Cache"
   - Cliquer "Effacer maintenant"

#### **Option B : Navigation Privée (Plus Simple)**

1. Ouvrir une fenêtre de navigation privée :
   - Chrome/Edge : `Ctrl + Shift + N`
   - Firefox : `Ctrl + Shift + P`

2. Aller sur : `http://51.21.196.104/dashboard/superadmin`

3. Se connecter avec vos identifiants

#### **Option C : Forcer le Rechargement**

1. Ouvrir la console (F12)
2. Clic droit sur le bouton de rechargement
3. Sélectionner "Vider le cache et effectuer un rechargement forcé"

Ou simplement : `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)

---

## 🔍 **Vérification**

Après avoir vidé le cache et rechargé :

1. **Ouvrir la console** (F12)
2. **Vérifier** : Plus d'erreur "Hotel is not defined"
3. **Tester** : Se connecter avec un compte SuperAdmin
4. **Vérifier** : Le dashboard se charge correctement

---

## 🚨 **Si Ça Ne Fonctionne Pas**

### **Option A : Rebuild Local puis Push**

```bash
# Sur votre machine locale
cd hotel-ticket-hub

# Nettoyer COMPLÈTEMENT
rm -rf dist node_modules/.vite .vite .vite-cache

# Rebuild local
npm run build

# Vérifier que le build fonctionne
npm run preview

# Si OK, commit et push
git add .
git commit -m "fix: force rebuild - Hotel error resolved"
git push origin develop
```

### **Option B : Rebuild Docker sur la VM**

```bash
# SSH sur la VM
ssh -i <key> ubuntu@51.21.196.104
cd /opt/hotel-ticket-hub-frontend-staging

# Cloner le repo (si nécessaire)
# git clone <repo-url> /tmp/hotel-ticket-hub
# cd /tmp/hotel-ticket-hub

# Build Docker local (sans cache)
docker build --no-cache -t ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop .

# Tag et push (si vous avez les credentials)
# docker push ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop

# Ou utiliser l'image locale
docker compose down
docker compose up -d
```

---

## ✅ **Checklist**

- [ ] Workflow modifié (cache npm désactivé)
- [ ] Push effectué
- [ ] Pipeline GitHub Actions réussi
- [ ] Image Docker pullée sur la VM (sans cache)
- [ ] Conteneur redémarré
- [ ] **Cache du navigateur vidé (CRITIQUE)**
- [ ] Test en navigation privée
- [ ] Plus d'erreur dans la console
- [ ] Connexion fonctionne

---

**Le problème vient du cache. Videz le cache du navigateur !** 🔥

