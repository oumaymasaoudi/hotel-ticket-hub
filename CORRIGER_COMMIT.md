# 🔧 Corriger le Commit avec le Secret

## ⚠️ Problème
GitHub a détecté le token GitHub dans les fichiers de documentation. Le commit doit être corrigé.

## ✅ Solution : Réécrire le Commit

### Étape 1 : Annuler le dernier commit (garder les changements)

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
git reset --soft HEAD~1
```

Cela annule le commit mais garde tous les fichiers modifiés.

### Étape 2 : Vérifier que les fichiers sont corrigés

Les fichiers suivants ont été corrigés (token remplacé par placeholder) :
- ✅ `ACTION_IMMEDIATE.md`
- ✅ `ETAPES_IMMEDIATES.md`
- ✅ `CONFIGURER_SECRETS_GITHUB.md`

### Étape 3 : Ajouter key-to-copy.txt au .gitignore (si nécessaire)

```powershell
# Vérifier si key-to-copy.txt est dans .gitignore
# Si non, l'ajouter :
echo "key-to-copy.txt" >> .gitignore
echo "cle-privee.txt" >> .gitignore
```

### Étape 4 : Retirer key-to-copy.txt du staging (si présent)

```powershell
git reset HEAD key-to-copy.txt
```

### Étape 5 : Faire un nouveau commit

```powershell
git add .
git commit -m "docs: ajout de guides de configuration (sans secrets)"
git push origin develop
```

---

## 🎯 Résultat Attendu

Le push devrait maintenant fonctionner sans erreur de détection de secret.

