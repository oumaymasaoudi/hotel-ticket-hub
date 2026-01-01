# 🔐 Copier la Clé Privée vers GitHub

## ✅ Ce que vous avez :
- **Clé privée** : `github-actions-key` (commence par `-----BEGIN OPENSSH PRIVATE KEY-----`)
- **Clé publique** : `github-actions-key.pub` (commence par `ssh-rsa...`)

## 📋 Méthode Simple : Ouvrir le fichier et copier

### Option 1 : PowerShell (Recommandé)

```powershell
# Créer un fichier texte avec la clé privée
Get-Content github-actions-key | Out-File -FilePath cle-privee.txt -Encoding utf8

# Ouvrir le fichier dans Notepad
notepad cle-privee.txt
```

**Dans Notepad :**
1. Sélectionnez **tout** (Ctrl+A)
2. Copiez (Ctrl+C)
3. Allez sur GitHub et collez

### Option 2 : Afficher dans le terminal

```powershell
# Afficher tout le contenu
Get-Content github-actions-key

# Puis sélectionnez manuellement tout le texte dans le terminal (Ctrl+A)
# Et copiez (Ctrl+C)
```

### Option 3 : Utiliser VS Code ou votre éditeur

```powershell
# Ouvrir dans VS Code
code github-actions-key

# Ou dans votre éditeur par défaut
Invoke-Item github-actions-key
```

Puis dans l'éditeur :
1. Sélectionnez tout (Ctrl+A)
2. Copiez (Ctrl+C)

## 🎯 Sur GitHub :

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
2. Trouvez `FRONTEND_STAGING_SSH_PRIVATE_KEY`
3. Cliquez sur **Edit** (ou **Update**)
4. **Supprimez** tout l'ancien contenu
5. **Collez** la clé privée complète (Ctrl+V)
6. Vérifiez que ça commence par `-----BEGIN OPENSSH PRIVATE KEY-----`
7. Vérifiez que ça se termine par `-----END OPENSSH PRIVATE KEY-----`
8. Cliquez sur **Update secret**

## ⚠️ Important :

- ✅ Utilisez la **clé privée** (`github-actions-key`) pour GitHub Secrets
- ❌ **PAS** la clé publique (`ssh-rsa...`)
- La clé privée doit être **complète** (toutes les lignes)

