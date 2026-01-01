# 🔒 Correction de sécurité : Supprimer la clé privée de Git

## ⚠️ Problème critique

La clé privée `github-actions-key` a été commitée dans le repository. **C'est un problème de sécurité majeur** car n'importe qui ayant accès au repository peut utiliser cette clé.

## ✅ Solution : Supprimer la clé de l'historique Git

### Option 1 : Utiliser git-filter-repo (Recommandé)

```powershell
# Installer git-filter-repo (si pas déjà installé)
pip install git-filter-repo

# Supprimer la clé de tout l'historique Git
git filter-repo --path github-actions-key --invert-paths

# Forcer le push (ATTENTION : cela réécrit l'historique)
git push origin --force --all
git push origin --force --tags
```

### Option 2 : Utiliser BFG Repo-Cleaner

```powershell
# Télécharger BFG (https://rtyley.github.io/bfg-repo-cleaner/)
# Supprimer la clé
java -jar bfg.jar --delete-files github-actions-key

# Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Forcer le push
git push origin --force --all
```

### Option 3 : Supprimer manuellement (si la clé vient d'être ajoutée)

```powershell
# Si la clé vient d'être commitée dans le dernier commit
git rm --cached github-actions-key
git commit --amend -m "Remove private key"
git push origin --force
```

## 🔄 Actions à faire après

1. **Générer une nouvelle paire de clés SSH** :
   ```powershell
   ssh-keygen -t ed25519 -f github-actions-key -N ""
   ```

2. **Copier la nouvelle clé publique sur les VMs** :
   ```powershell
   # Backend VM
   .\copy-ssh-key.ps1 -HostIP "13.49.44.219" -AWSKey "$HOME\Downloads\oumayma-key.pem" -User "ubuntu"
   
   # Frontend VM
   .\copy-ssh-key.ps1 -HostIP "51.21.196.104" -AWSKey "$HOME\Downloads\oumayma-key.pem" -User "ubuntu"
   ```

3. **Mettre à jour le secret GitHub** :
   - Allez sur GitHub → Settings → Secrets and variables → Actions
   - Mettez à jour `FRONTEND_STAGING_SSH_PRIVATE_KEY` avec le contenu de la nouvelle clé privée
   - Mettez à jour `BACKEND_STAGING_SSH_PRIVATE_KEY` (si existe) avec le contenu de la nouvelle clé privée

4. **Vérifier que `.gitignore` contient bien** :
   ```
   *.key
   github-actions-key
   *private*
   ```

## ⚠️ Important

- **Ne jamais commiter de clés privées** dans Git
- **Toujours utiliser les secrets GitHub** pour les clés SSH
- **Vérifier `.gitignore`** avant chaque commit contenant des fichiers sensibles

## 📝 Note

Le fichier `.gitignore` a été mis à jour pour exclure automatiquement les clés privées à l'avenir.

