# 🔧 Correction : Erreur d'authentification SSH

## ⚠️ Problème

Le pipeline GitHub Actions échoue avec :
```
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain
```

Cela signifie que la clé SSH dans le secret GitHub ne correspond pas à celle autorisée sur la VM frontend.

## ✅ Solution : Vérifier et corriger la clé SSH

### Étape 1 : Vérifier la clé publique sur la VM frontend

```powershell
# Depuis PowerShell, connectez-vous à la VM frontend
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104

# Une fois connecté, vérifiez les clés autorisées
cat ~/.ssh/authorized_keys
```

### Étape 2 : Générer la clé publique depuis la clé privée locale

```powershell
# Depuis PowerShell (sur votre machine locale)
cd C:\Users\oumay\projet\hotel-ticket-hub

# Générer la clé publique depuis la clé privée
ssh-keygen -y -f github-actions-key > github-actions-key.pub.new

# Afficher la clé publique
Get-Content github-actions-key.pub.new
```

### Étape 3 : Comparer avec les clés sur la VM

Comparez la clé publique générée (étape 2) avec celles affichées sur la VM (étape 1).

**Si elles ne correspondent pas :**

### Étape 4 : Copier la bonne clé publique sur la VM

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Lire la clé publique
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()

# Copier sur la VM frontend
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104 "mkdir -p ~/.ssh && grep -qxF '$publicKey' ~/.ssh/authorized_keys || echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh && echo 'Cle ajoutee avec succes!'"
```

### Étape 5 : Vérifier que le secret GitHub contient la bonne clé

1. Allez sur GitHub → Settings → Secrets and variables → Actions
2. Vérifiez que `FRONTEND_STAGING_SSH_PRIVATE_KEY` contient **exactement** le contenu de `github-actions-key`
3. Pour vérifier :
   ```powershell
   # Depuis PowerShell
   cd C:\Users\oumay\projet\hotel-ticket-hub
   Get-Content github-actions-key | Set-Clipboard
   ```
4. Comparez avec le secret GitHub (vous ne pouvez pas le voir directement, mais vous pouvez le mettre à jour)

### Étape 6 : Tester la connexion manuellement

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Tester la connexion avec la clé
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'Connexion OK' && hostname"
```

Si ça fonctionne, le problème est résolu ! Sinon, continuez.

### Étape 7 : Vérifier les permissions de la clé

```powershell
# Sur la VM frontend (connecté avec la clé AWS)
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104

# Vérifier les permissions
ls -la ~/.ssh/
# authorized_keys doit être en 600
# .ssh doit être en 700

# Si ce n'est pas le cas, corriger :
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Étape 8 : Vérifier le format de la clé dans le secret GitHub

La clé privée dans le secret GitHub doit :
- Commencer par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----`
- Se terminer par `-----END OPENSSH PRIVATE KEY-----` ou `-----END RSA PRIVATE KEY-----`
- Contenir **toutes les lignes**, y compris les en-têtes et pieds de page
- Ne pas avoir d'espaces supplémentaires au début ou à la fin

### Étape 9 : Solution alternative - Générer une nouvelle paire de clés

Si le problème persiste, générez une nouvelle paire de clés :

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Supprimer l'ancienne clé (si elle existe)
Remove-Item github-actions-key* -ErrorAction SilentlyContinue

# Générer une nouvelle paire de clés
ssh-keygen -t ed25519 -f github-actions-key -N ""

# Copier la clé publique sur la VM frontend
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104 "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"

# Tester la connexion
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'Connexion OK'"

# Mettre à jour le secret GitHub avec la nouvelle clé privée
Get-Content github-actions-key | Set-Clipboard
# Puis allez sur GitHub et mettez à jour FRONTEND_STAGING_SSH_PRIVATE_KEY
```

## 🔍 Diagnostic avancé

Si le problème persiste, activez le mode debug SSH :

```powershell
# Depuis PowerShell
ssh -v -i github-actions-key ubuntu@51.21.196.104
```

Cela affichera des informations détaillées sur l'authentification.

## ✅ Checklist

- [ ] La clé publique est dans `~/.ssh/authorized_keys` sur la VM
- [ ] Les permissions sont correctes (600 pour authorized_keys, 700 pour .ssh)
- [ ] Le secret GitHub contient la clé privée complète (avec en-têtes)
- [ ] La connexion manuelle fonctionne : `ssh -i github-actions-key ubuntu@51.21.196.104`
- [ ] Le format de la clé est correct (OpenSSH ou RSA)

Une fois toutes ces étapes vérifiées, le pipeline devrait fonctionner ! 🚀

