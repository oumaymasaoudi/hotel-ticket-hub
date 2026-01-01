# 🔧 Corriger le Commit - Commandes Exactes

## 📋 Situation Actuelle
- Commit `506ef85` : contient le secret (à supprimer)
- Commit `4c66246` : corrections (mais toujours dans l'historique du commit précédent)
- Commit `9782ae1` : dernier commit sur origin/develop (propre)

## ✅ Solution : Supprimer les 2 commits et recommencer

### Étape 1 : Revenir au commit propre (garder les fichiers corrigés)

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
git reset --soft HEAD~2
```

Cela revient au commit `9782ae1` mais garde tous vos fichiers modifiés.

### Étape 2 : Vérifier que les fichiers sont corrigés

```powershell
# Vérifier qu'il n'y a plus de token
git diff HEAD | findstr "ghp_"
```

Si rien n'apparaît, c'est bon ✅

### Étape 3 : Vérifier les fichiers à commiter

```powershell
git status
```

Vous devriez voir tous les fichiers de documentation modifiés.

### Étape 4 : Faire un nouveau commit propre

```powershell
git add .
git commit -m "docs: ajout de guides de configuration (sans secrets)"
```

### Étape 5 : Pousser (avec force car on réécrit l'historique)

```powershell
git push origin develop --force
```

⚠️ **Note** : `--force` est nécessaire car on réécrit l'historique. C'est sûr ici car personne d'autre n'a poussé après `9782ae1`.

---

## 🎯 Commandes en Une Seule Fois

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
git reset --soft HEAD~2
git add .
git commit -m "docs: ajout de guides de configuration (sans secrets)"
git push origin develop --force
```

---

## ✅ Résultat Attendu

- Les 2 commits problématiques sont supprimés
- Un nouveau commit propre est créé
- Le push fonctionne sans erreur de secret
- Le pipeline GitHub Actions se déclenche

