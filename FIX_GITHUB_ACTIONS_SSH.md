# 🔧 Correction : GitHub Actions SSH Authentication

## ⚠️ Problème

Le test SSH local fonctionne :
```powershell
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"
# ✅ OK
```

Mais GitHub Actions échoue :
```
ssh: handshake failed: ssh: unable to authenticate
```

## 🔍 Diagnostic

Cela signifie que **la clé dans le secret GitHub ne correspond pas à celle qui fonctionne localement**.

### Étape 1 : Vérifier la clé locale qui fonctionne

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Générer la clé publique depuis la clé privée qui fonctionne
ssh-keygen -y -f github-actions-key > working-key.pub

# Afficher la clé publique
Get-Content working-key.pub
```

**Copiez cette clé publique** - vous en aurez besoin.

### Étape 2 : Vérifier la clé sur la VM

```powershell
# Se connecter à la VM (ça fonctionne maintenant)
ssh -i github-actions-key ubuntu@51.21.196.104

# Une fois connecté, vérifier les clés autorisées
cat ~/.ssh/authorized_keys | grep github-actions
```

**Notez quelle clé publique est autorisée** sur la VM.

### Étape 3 : Mettre à jour le secret GitHub

**IMPORTANT** : Le secret GitHub doit contenir **exactement** la clé privée qui correspond à la clé publique autorisée sur la VM.

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Copier la clé privée dans le presse-papiers
Get-Content github-actions-key | Set-Clipboard
```

**Puis** :
1. Allez sur GitHub → Settings → Secrets and variables → Actions
2. Trouvez `FRONTEND_STAGING_SSH_PRIVATE_KEY`
3. Cliquez sur **Edit** (icône crayon)
4. **Supprimez tout le contenu existant**
5. Collez la nouvelle clé (Ctrl+V)
6. Cliquez sur **Update secret**

### Étape 4 : Vérifier le format de la clé

La clé privée dans le secret GitHub doit :
- Commencer par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----`
- Se terminer par `-----END OPENSSH PRIVATE KEY-----` ou `-----END RSA PRIVATE KEY-----`
- Contenir **TOUTES les lignes** (y compris les en-têtes)
- **Ne pas avoir d'espaces supplémentaires** au début ou à la fin
- **Ne pas avoir de retours à la ligne supplémentaires**

### Étape 5 : Test avec GitHub Actions

Après avoir mis à jour le secret, déclenchez un nouveau build :
- Faites un petit changement et push
- Ou allez sur GitHub Actions et cliquez sur "Re-run failed jobs"

---

## 🚨 Problème GitGuardian : Clé Privée dans le Repository

GitGuardian a détecté une clé privée dans le repository. Il faut la supprimer.

### Solution : Vérifier et supprimer

```powershell
# Vérifier si la clé est trackée
git ls-files | findstr github-actions-key

# Si github-actions-key (sans .pub) apparaît :
git rm --cached github-actions-key
git commit -m "security: remove private SSH key from repository"
git push origin develop
```

**Puis** : Supprimer de l'historique Git (voir `URGENT_REMOVE_PRIVATE_KEY.md`)

---

## ✅ Checklist

- [ ] Clé publique générée depuis la clé privée locale
- [ ] Clé publique vérifiée sur la VM
- [ ] Secret GitHub mis à jour avec la bonne clé privée
- [ ] Format de la clé vérifié (pas d'espaces, toutes les lignes)
- [ ] Clé privée supprimée du repository Git
- [ ] Nouveau build déclenché

---

## 🎯 Si ça ne fonctionne toujours pas

Générez une nouvelle paire de clés :

```powershell
# Supprimer l'ancienne
Remove-Item github-actions-key* -ErrorAction SilentlyContinue

# Générer une nouvelle paire
ssh-keygen -t ed25519 -f github-actions-key -N ""

# Copier la clé publique sur la VM
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()
ssh -i github-actions-key ubuntu@51.21.196.104 "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"

# Tester
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"

# Mettre à jour le secret GitHub
Get-Content github-actions-key | Set-Clipboard
# Puis allez sur GitHub et mettez à jour FRONTEND_STAGING_SSH_PRIVATE_KEY
```

