# 🚀 Commandes pour Forcer Rebuild Sans Cache

## ✅ **Modification Appliquée**

J'ai désactivé le cache dans le workflow GitHub Actions pour forcer un rebuild complet.

---

## 📋 **Commandes à Exécuter**

```bash
cd hotel-ticket-hub

# 1. Vérifier les modifications
git status

# 2. Ajouter le workflow modifié
git add .github/workflows/frontend-ci.yml

# 3. Commit
git commit -m "fix: force rebuild without cache to fix Hotel error

- Disable GitHub Actions cache to force complete rebuild
- This will ensure the new code with type Hotel import is compiled"

# 4. Push (DÉCLENCHE LE REBUILD SANS CACHE)
git push origin develop
```

---

## ⏱️ **Après le Push**

1. **Attendre 5-10 minutes** que GitHub Actions termine le build sans cache
2. **Sur la VM**, pull la nouvelle image :
   ```bash
   ssh -i github-actions-key ubuntu@51.21.196.104
   cd /opt/hotel-ticket-hub-frontend-staging
   docker compose down
   docker rmi ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop || true
   docker compose pull
   docker compose up -d
   ```

3. **Vider le cache du navigateur** (Ctrl+Shift+Delete)
4. **Tester** : `http://51.21.196.104/login`

---

## 🔍 **Pourquoi ça va fonctionner**

- ✅ Le cache est désactivé → rebuild complet
- ✅ Le nouveau code avec `type Hotel` sera compilé
- ✅ L'image Docker contiendra le bon JavaScript
- ✅ L'erreur "Hotel is not defined" disparaîtra

---

**Exécutez ces commandes maintenant pour forcer le rebuild sans cache !** 🔥

