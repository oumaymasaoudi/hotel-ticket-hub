# 🚨 Actions Urgentes - Avant Push

## ⚠️ PROBLÈME CRITIQUE #1 : Clé Privée dans le Repository

**Le fichier `github-actions-key` (clé privée) est dans le repository !**

### Action IMMÉDIATE :

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub

# 1. Supprimer du tracking Git
git rm --cached github-actions-key

# 2. Commit
git commit -m "security: remove private SSH key from repository"

# 3. Push
git push origin develop
```

**Puis suivez `URGENT_REMOVE_PRIVATE_KEY.md` pour supprimer de l'historique et générer une nouvelle clé.**

---

## ✅ Problème #2 : Erreur Docker Build - CORRIGÉ

**Erreur** : `.eslintrc.cjs` not found

**Correction** : Dockerfile mis à jour pour copier `.eslintrc.json` et `eslint.config.js`

---

## 📝 Problèmes de Documentation (CodeRabbit)

CodeRabbit signale que plusieurs fichiers contiennent des IPs et chemins hardcodés. Ces fichiers sont pour votre usage personnel, mais si vous voulez les garder dans le repo :

### Option A : Supprimer les fichiers de documentation sensibles

```powershell
# Supprimer les fichiers avec IPs hardcodées
git rm FIX_SSH_AUTHENTICATION.md FIX_SSH_NOW.md VERIFICATION_AVANT_PUSH.md RESUME_VERIFICATION.md
git commit -m "docs: remove files with hardcoded infrastructure details"
```

### Option B : Les garder mais les ajouter à .gitignore

```powershell
# Ajouter à .gitignore
echo "*SSH*.md" >> .gitignore
echo "*VERIFICATION*.md" >> .gitignore
echo "*RESUME*.md" >> .gitignore
```

---

## ✅ Checklist Avant Push

- [ ] **URGENT** : Supprimer `github-actions-key` du repo (voir ci-dessus)
- [ ] **URGENT** : Générer une nouvelle paire de clés SSH
- [ ] **URGENT** : Mettre à jour les secrets GitHub avec la nouvelle clé
- [ ] **URGENT** : Mettre à jour les VMs avec la nouvelle clé publique
- [x] Dockerfile corrigé (erreur `.eslintrc.cjs`)
- [ ] Décider quoi faire avec les fichiers de documentation sensibles

---

## 🎯 Ordre des Actions

1. **MAINTENANT** : Supprimer la clé privée du repo
2. **MAINTENANT** : Générer une nouvelle clé
3. **MAINTENANT** : Mettre à jour secrets GitHub et VMs
4. **Ensuite** : Push les corrections Dockerfile
5. **Ensuite** : Gérer les fichiers de documentation

---

**NE PAS PUSHER avant d'avoir supprimé la clé privée !**

