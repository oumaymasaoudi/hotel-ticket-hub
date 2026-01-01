# 🔧 Solution Rapide - Problème SSH

## ⚠️ Le problème

Le pipeline échoue toujours avec :
```bash
ssh: handshake failed: ssh: unable to authenticate
```

Cela signifie que la clé SSH dans le secret GitHub ne correspond pas à celle autorisée sur la VM.

## ✅ Solution en 3 étapes (5 minutes)

### Étape 1 : Vérifier la clé publique sur votre machine

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Générer la clé publique depuis votre clé privée
ssh-keygen -y -f github-actions-key > temp-key.pub

# Afficher la clé publique
Get-Content temp-key.pub
```

**Copiez cette clé publique** (vous en aurez besoin à l'étape 2).

### Étape 2 : Vérifier et corriger sur la VM frontend

```powershell
# Se connecter à la VM avec votre clé AWS
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104

# Une fois connecté, vérifier les clés autorisées
cat ~/.ssh/authorized_keys

# Si votre clé publique (de l'étape 1) n'est PAS dans la liste, l'ajouter :
# (Remplacez <VOTRE_CLE_PUBLIQUE> par celle de l'étape 1)
echo "<VOTRE_CLE_PUBLIQUE>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Vérifier qu'elle est bien ajoutée
cat ~/.ssh/authorized_keys | grep -A 1 "github-actions"
```

### Étape 3 : Tester la connexion

```powershell
# Depuis PowerShell (sur votre machine)
cd C:\Users\oumay\projet\hotel-ticket-hub

# Tester avec votre clé
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK' && hostname"
```

**Si ça fonctionne** → Le problème est résolu ! Vous pouvez pusher.

**Si ça échoue** → Vérifiez que :
1. La clé publique est bien dans `authorized_keys` sur la VM
2. Les permissions sont correctes (600 pour authorized_keys, 700 pour .ssh)
3. Le secret GitHub contient la bonne clé privée

## 🔍 Vérification du secret GitHub

1. Allez sur GitHub → Settings → Secrets and variables → Actions
2. Vérifiez `FRONTEND_STAGING_SSH_PRIVATE_KEY`
3. Pour mettre à jour :
   ```powershell
   # Depuis PowerShell
   cd C:\Users\oumay\projet\hotel-ticket-hub
   Get-Content github-actions-key | Set-Clipboard
   ```
4. Collez dans le secret GitHub

## ⚠️ Format de la clé

La clé privée dans le secret GitHub doit :
- Commencer par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----`
- Se terminer par `-----END OPENSSH PRIVATE KEY-----` ou `-----END RSA PRIVATE KEY-----`
- Contenir **TOUTES les lignes** (y compris les en-têtes)
- Ne pas avoir d'espaces supplémentaires

## 🎯 Si rien ne fonctionne

Générez une nouvelle paire de clés :

```powershell
# Supprimer l'ancienne
Remove-Item github-actions-key* -ErrorAction SilentlyContinue

# Générer une nouvelle paire
ssh-keygen -t ed25519 -f github-actions-key -N ""

# Copier la clé publique sur la VM
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104 "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"

# Tester
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"

# Mettre à jour le secret GitHub
Get-Content github-actions-key | Set-Clipboard
# Puis allez sur GitHub et mettez à jour FRONTEND_STAGING_SSH_PRIVATE_KEY
```

---

## 📝 Note sur SonarQube

Les 8 Security Hotspots sont des **warnings**, pas des erreurs bloquantes. Le pipeline continuera même si SonarQube échoue. Vous pouvez les corriger plus tard.

**Le problème urgent est l'authentification SSH.**

