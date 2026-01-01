# 🔍 Vérifier le Déploiement et Cache - Problème Persistant

## ⚠️ **Problème**

Le pipeline a passé mais l'erreur `Hotel is not defined` persiste à chaque connexion.

---

## ✅ **Solutions à Essayer**

### **1. Vérifier que l'Image a été Déployée**

SSH sur la VM et vérifier :

```bash
ssh -i <votre-cle>.pem ubuntu@51.21.196.104

cd /opt/hotel-ticket-hub-frontend-staging

# Vérifier l'image actuelle
docker compose images

# Vérifier les logs
docker compose logs --tail=50

# Vérifier la date de l'image
docker inspect ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop | grep Created
```

### **2. Forcer le Pull de la Nouvelle Image**

```bash
# Sur la VM
cd /opt/hotel-ticket-hub-frontend-staging

# Arrêter
docker compose down

# Supprimer l'ancienne image (force le pull)
docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop || true

# Pull la nouvelle image
docker compose pull

# Redémarrer
docker compose up -d

# Vérifier
docker compose logs -f
```

### **3. Vider le Cache du Navigateur**

**Important :** Le navigateur peut avoir mis en cache l'ancien JavaScript.

1. **Chrome/Edge** :
   - Appuyez sur `Ctrl+Shift+Delete`
   - Sélectionnez "Images et fichiers en cache"
   - Cliquez sur "Effacer les données"

2. **Ou en mode Incognito** :
   - Ouvrez une fenêtre de navigation privée
   - Testez : `http://51.21.196.104/login`

3. **Ou forcer le rechargement** :
   - Appuyez sur `Ctrl+Shift+R` (ou `Cmd+Shift+R` sur Mac)
   - Cela force le rechargement sans cache

### **4. Vérifier le Hash du Build**

Vérifier que le nouveau build est bien déployé :

```bash
# Sur la VM
docker exec hotel-ticket-hub-frontend-staging ls -la /usr/share/nginx/html/assets/

# Vérifier la date de modification des fichiers
docker exec hotel-ticket-hub-frontend-staging stat /usr/share/nginx/html/index.html
```

### **5. Rebuild Complet Sans Cache**

Si rien ne fonctionne, forcer un rebuild complet :

```bash
# Sur la VM
cd /opt/hotel-ticket-hub-frontend-staging

# Arrêter et supprimer tout
docker compose down -v
docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop || true

# Pull la dernière image
docker compose pull

# Si l'image n'existe pas, attendre que GitHub Actions la build
# Sinon, redémarrer
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

---

## 🔍 **Vérification du Code Source**

Vérifier que le code source est bien correct :

```bash
# Sur votre machine locale
cd hotel-ticket-hub

# Vérifier les imports
grep -n "type Hotel" src/pages/SuperAdminDashboard.tsx
grep -n "type Hotel" src/pages/AdminDashboard.tsx

# Devrait afficher :
# 12:import { apiService, TicketResponse, type Hotel, ...
```

---

## 📝 **Checklist de Vérification**

- [ ] L'image Docker a été mise à jour (vérifier la date)
- [ ] Le conteneur a été redémarré
- [ ] Le cache du navigateur a été vidé
- [ ] Test en mode incognito
- [ ] Les logs Docker ne montrent pas d'erreur
- [ ] Le code source utilise bien `type Hotel`

---

## 🚨 **Si Rien ne Fonctionne**

1. **Vérifier les logs GitHub Actions** :
   - Aller sur : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
   - Vérifier que le build a bien créé une nouvelle image
   - Vérifier que le déploiement a réussi

2. **Vérifier le workflow** :
   - Vérifier que `docker-build` a réussi
   - Vérifier que `deploy-staging` a réussi
   - Vérifier les logs de déploiement

3. **Rebuild manuel** :
   - Si l'image n'a pas été correctement buildée, rebuild manuellement sur la VM

---

**Commencez par vider le cache du navigateur et tester en mode incognito !** 🔍

