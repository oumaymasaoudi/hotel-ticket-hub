# 🎯 Solution Finale - Problème SSH GitHub Actions

## 🔍 Diagnostic

**Situation** :
- ✅ SSH local fonctionne : `ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"` → OK
- ❌ GitHub Actions échoue : `ssh: unable to authenticate`

**Cause** : La clé dans le secret GitHub `FRONTEND_STAGING_SSH_PRIVATE_KEY` ne correspond **pas** à la clé qui fonctionne localement.

## ✅ Solution en 3 étapes

### Étape 1 : Vérifier quelle clé fonctionne localement

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# La clé qui fonctionne est : github-actions-key
# Vérifier son empreinte
ssh-keygen -l -f github-actions-key.pub
```

### Étape 2 : Mettre à jour le secret GitHub avec la BONNE clé

```powershell
# Copier la clé privée qui fonctionne localement
Get-Content github-actions-key | Set-Clipboard
```

**Puis sur GitHub** :
1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
2. Trouvez `FRONTEND_STAGING_SSH_PRIVATE_KEY`
3. Cliquez sur **Edit** (icône crayon)
4. **Supprimez TOUT le contenu**
5. Collez la nouvelle clé (Ctrl+V)
6. **Vérifiez** :
   - Commence par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----`
   - Se termine par `-----END OPENSSH PRIVATE KEY-----` ou `-----END RSA PRIVATE KEY-----`
   - Pas d'espaces au début ou à la fin
7. Cliquez sur **Update secret**

### Étape 3 : Vérifier que la clé publique correspondante est sur la VM

```powershell
# Générer la clé publique depuis la clé privée
ssh-keygen -y -f github-actions-key > temp-check.pub
Get-Content temp-check.pub
```

**Puis vérifier sur la VM** :
```powershell
# Se connecter à la VM
ssh -i github-actions-key ubuntu@51.21.196.104

# Vérifier que la clé publique est autorisée
cat ~/.ssh/authorized_keys | grep -A 1 "github-actions"
```

**Si la clé n'est pas dans authorized_keys** :
```bash
# Sur la VM, ajouter la clé publique
echo "<VOTRE_CLE_PUBLIQUE>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

## 🚨 Problème GitGuardian : Clé Privée dans l'Historique Git

GitGuardian a détecté une clé privée dans l'historique Git. Même si elle n'est plus trackée, elle est toujours dans l'historique.

### Solution : Supprimer de l'historique

**Option 1 : Utiliser git-filter-repo (Recommandé)**

```powershell
# Installer git-filter-repo
pip install git-filter-repo

# Supprimer la clé de tout l'historique
git filter-repo --path github-actions-key --invert-paths

# Forcer le push (ATTENTION : cela réécrit l'historique)
git push origin --force --all
git push origin --force --tags
```

**Option 2 : Utiliser BFG Repo-Cleaner**

```powershell
# Télécharger BFG : https://rtyley.github.io/bfg-repo-cleaner/
# Supprimer la clé
java -jar bfg.jar --delete-files github-actions-key

# Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Forcer le push
git push origin --force --all
```

**Option 3 : Si la clé vient d'être ajoutée (dernier commit)**

```powershell
# Supprimer du dernier commit
git rm --cached github-actions-key
git commit --amend -m "security: remove private SSH key"
git push origin --force develop
```

---

## ✅ Checklist Finale

- [ ] Secret GitHub `FRONTEND_STAGING_SSH_PRIVATE_KEY` mis à jour avec la clé qui fonctionne localement
- [ ] Format de la clé vérifié (pas d'espaces, toutes les lignes)
- [ ] Clé publique correspondante vérifiée sur la VM
- [ ] Clé privée supprimée de l'historique Git (pour GitGuardian)
- [ ] Nouveau build déclenché sur GitHub Actions

---

## 🎯 Après Correction

Une fois le secret GitHub mis à jour :
1. Faites un petit changement et push
2. Ou allez sur GitHub Actions → Re-run failed jobs
3. Le pipeline devrait maintenant fonctionner

---

**Le problème principal est que le secret GitHub contient une clé différente de celle qui fonctionne localement.**

