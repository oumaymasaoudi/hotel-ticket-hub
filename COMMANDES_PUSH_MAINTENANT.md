# 🚀 Commandes Push - Rebuild Forcé

## ✅ **Fichiers Modifiés**

- `src/pages/AdminDashboard.tsx` (commentaire ajouté)
- `src/pages/SuperAdminDashboard.tsx` (commentaire ajouté)
- `REBUILD_FORCE_COMPLET.md` (nouveau fichier)

---

## 📋 **Commandes à Exécuter**

```powershell
# 1. Aller dans le répertoire
cd hotel-ticket-hub

# 2. Ajouter tous les fichiers modifiés
git add .

# 3. Commit avec message descriptif
git commit -m "fix: force complete rebuild - add comments to change build hash

- Add comments in SuperAdminDashboard and AdminDashboard
- This forces a new build hash
- Resolves Hotel is not defined error
- Force rebuild without cache"

# 4. Push vers develop (DÉCLENCHE LE REBUILD)
git push origin develop
```

---

## ⏱️ **Après le Push**

1. **Attendre 5-10 minutes** que GitHub Actions termine
2. **Vérifier** : `https://github.com/oumaymasaoudi/hotel-ticket-hub/actions`
3. **Sur la VM** : Pull la nouvelle image et redémarrer
4. **Navigateur** : Vider le cache (CRITIQUE !)

---

**Exécutez ces commandes maintenant !** 🚀

