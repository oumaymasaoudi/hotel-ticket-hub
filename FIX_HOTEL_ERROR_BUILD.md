# 🔧 Fix "Hotel is not defined" - Rebuild Required

## 🎯 **Problème**

L'erreur `ReferenceError: Hotel is not defined` persiste dans le build de production (`index-Bw9zH6Fu.js`).

**Cause :** Le build de production n'a pas été régénéré après les corrections du code source.

---

## ✅ **Solution : Rebuild l'Application**

Les corrections dans le code source sont correctes (`type Hotel`), mais le build Docker utilise encore l'ancien code compilé.

### **Option 1 : Rebuild via GitHub Actions (Recommandé)**

1. **Commit et push** les corrections :
   ```bash
   cd hotel-ticket-hub
   git add .
   git commit -m "fix: resolve Hotel is not defined error - use type Hotel import"
   git push origin develop
   ```

2. **Le pipeline GitHub Actions** va automatiquement :
   - Rebuild l'image Docker
   - Redéployer sur la VM staging

### **Option 2 : Rebuild Local puis Push**

Si vous voulez tester localement d'abord :

```bash
cd hotel-ticket-hub

# Nettoyer le cache et rebuild
rm -rf dist node_modules/.vite .vite

# Build local
npm run build

# Vérifier que le build fonctionne
npm run preview

# Si tout est OK, commit et push
git add .
git commit -m "fix: resolve Hotel is not defined error"
git push origin develop
```

### **Option 3 : Rebuild Docker Image Manuellement (sur la VM)**

Si vous voulez rebuild directement sur la VM staging :

> **Note** : Voir `DEPLOYMENT_GUIDE.md` pour un guide consolidé avec variables d'environnement.

```bash
# Configuration (à adapter selon votre environnement)
export DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-/opt/hotel-ticket-hub-frontend-staging}"
export VM_IP="${VM_IP:-51.21.196.104}"

# SSH sur la VM frontend
ssh -i <key> ubuntu@$VM_IP

# Aller dans le répertoire
cd "$DEPLOYMENT_DIR"

# Authentification GHCR (si nécessaire)
# echo "$GHCR_TOKEN" | docker login ghcr.io -u $GHCR_USER --password-stdin

# Pull la dernière image (ou rebuild si nécessaire)
docker compose pull

# Rebuild sans cache
docker compose build --no-cache

# Redémarrer
docker compose down
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

---

## 🔍 **Vérification**

Après le rebuild, vérifier :

1. **Console du navigateur** : Plus d'erreur "Hotel is not defined"
2. **Dashboard SuperAdmin** : Se charge correctement
3. **Fonctionnalités** : Toutes les fonctionnalités fonctionnent

---

## 📝 **Note Technique**

Le code source est correct :
- ✅ `import { type Hotel }` dans SuperAdminDashboard.tsx
- ✅ `import { type Hotel }` dans AdminDashboard.tsx
- ✅ Utilisation de `Hotel` uniquement comme type, jamais comme valeur

Le problème vient uniquement du build qui n'a pas été régénéré.

---

**Solution : Rebuild l'application via GitHub Actions ou manuellement !** ✅

