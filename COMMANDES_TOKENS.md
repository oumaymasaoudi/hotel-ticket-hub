# 🔑 Commandes pour Obtenir et Configurer les Tokens

## 🎫 1. Token GHCR (GHCR_TOKEN)

### Option A : Vérifier si vous avez déjà un token

**Vous ne pouvez pas voir la valeur d'un secret existant**, mais vous pouvez vérifier s'il existe sur GitHub.

### Option B : Créer un nouveau token GHCR

#### Étape 1 : Créer le token sur GitHub

1. **Ouvrez votre navigateur** et allez sur :
   ```
   https://github.com/settings/tokens
   ```

2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**

3. Remplissez le formulaire :
   - **Note** : `GHCR Token for Docker Registry`
   - **Expiration** : Choisissez (ex: 90 days ou No expiration)
   - **Scopes** : Cochez **`read:packages`** (minimum)
   - Optionnel : **`write:packages`** (si vous voulez push)

4. Cliquez sur **"Generate token"** (en bas de la page)

5. **⚠️ IMPORTANT** : Copiez le token immédiatement (il commence par `ghp_...`)

#### Étape 2 : Mettre le token dans GitHub Secrets

1. **Ouvrez votre navigateur** et allez sur :
   ```
   https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
   ```

2. **Si `GHCR_TOKEN` existe déjà** :
   - Cliquez sur l'icône **Edit** (crayon) à droite
   - Supprimez l'ancien contenu
   - Collez le nouveau token
   - Cliquez sur **"Update secret"**

3. **Si `GHCR_TOKEN` n'existe pas** :
   - Cliquez sur **"New repository secret"**
   - **Name** : `GHCR_TOKEN`
   - **Secret** : Collez le token que vous venez de créer
   - Cliquez sur **"Add secret"**

---

## 🔐 2. Clé SSH (FRONTEND_STAGING_SSH_PRIVATE_KEY)

### Obtenir la valeur de la clé SSH locale

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Afficher la clé privée (pour vérification)
Get-Content github-actions-key

# OU copier directement dans le presse-papiers
Get-Content github-actions-key | Set-Clipboard
```

### Mettre la clé dans GitHub Secrets

1. **Ouvrez votre navigateur** et allez sur :
   ```
   https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
   ```

2. Trouvez `FRONTEND_STAGING_SSH_PRIVATE_KEY`

3. Cliquez sur l'icône **Edit** (crayon)

4. **Supprimez tout l'ancien contenu**

5. **Collez la nouvelle clé** :
   - Si vous avez fait `Set-Clipboard`, appuyez sur **Ctrl+V**
   - Sinon, copiez le résultat de `Get-Content github-actions-key`

6. **Vérifiez le format** :
   - Doit commencer par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----`
   - Doit se terminer par `-----END OPENSSH PRIVATE KEY-----` ou `-----END RSA PRIVATE KEY-----`
   - Pas d'espaces au début ou à la fin

7. Cliquez sur **"Update secret"**

---

## 📋 3. Vérifier tous les Secrets

### Liste des secrets nécessaires

| Secret | Comment l'obtenir | Où le mettre |
|--------|-------------------|--------------|
| `FRONTEND_STAGING_HOST` | Valeur : `51.21.196.104` | GitHub Secrets |
| `FRONTEND_STAGING_USER` | Valeur : `ubuntu` | GitHub Secrets |
| `FRONTEND_STAGING_SSH_PRIVATE_KEY` | `Get-Content github-actions-key` | GitHub Secrets |
| `GHCR_TOKEN` | Créer sur https://github.com/settings/tokens | GitHub Secrets |
| `SONAR_TOKEN` | Déjà configuré | GitHub Secrets |

### Commandes pour vérifier les valeurs locales

```powershell
# Depuis PowerShell
cd C:\Users\oumay\projet\hotel-ticket-hub

# 1. Vérifier que la clé SSH existe
Test-Path github-actions-key

# 2. Afficher les premières lignes de la clé (pour vérification)
Get-Content github-actions-key -Head 3

# 3. Vérifier le format de la clé
$key = Get-Content github-actions-key -Raw
if ($key -match "BEGIN.*PRIVATE KEY") {
    Write-Host "✅ Format correct"
} else {
    Write-Host "❌ Format incorrect"
}

# 4. Copier la clé dans le presse-papiers
Get-Content github-actions-key | Set-Clipboard
Write-Host "✅ Clé copiée dans le presse-papiers"
```

---

## 🎯 Checklist Rapide

### Pour GHCR_TOKEN :

- [ ] Aller sur https://github.com/settings/tokens
- [ ] Créer un nouveau token (classic) avec scope `read:packages`
- [ ] Copier le token (commence par `ghp_...`)
- [ ] Aller sur https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
- [ ] Mettre à jour ou créer `GHCR_TOKEN` avec le token

### Pour FRONTEND_STAGING_SSH_PRIVATE_KEY :

- [ ] Exécuter : `Get-Content github-actions-key | Set-Clipboard`
- [ ] Aller sur https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
- [ ] Trouver `FRONTEND_STAGING_SSH_PRIVATE_KEY`
- [ ] Edit → Supprimer ancien → Coller nouveau → Update

---

## 🔍 Vérification

Après avoir mis à jour les secrets, vous pouvez vérifier que le pipeline fonctionne :

1. Faites un petit changement et push
2. Ou allez sur GitHub Actions et cliquez sur "Re-run failed jobs"

---

**Résumé** : 
- **Clé SSH** : Utilisez `Get-Content github-actions-key | Set-Clipboard` puis collez dans GitHub
- **Token GHCR** : Créez-le sur https://github.com/settings/tokens puis ajoutez-le comme secret

