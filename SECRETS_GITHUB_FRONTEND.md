# 🔐 Secrets GitHub - Frontend

## ✅ Secrets actuellement configurés

- ✅ `FRONTEND_STAGING_HOST` : `51.21.196.104`
- ✅ `FRONTEND_STAGING_USER` : `ubuntu`
- ✅ `SONAR_TOKEN` : Token SonarQube
- ⚠️ `AWS_SSH_PRIVATE_KEY` : (probablement pour autre usage)

## ❌ Secrets manquants (à ajouter)

### 1. `FRONTEND_STAGING_SSH_PRIVATE_KEY`

**Description** : Clé privée SSH pour se connecter à la VM frontend

**Valeur** : Contenu du fichier `github-actions-key` (clé privée)

**Comment l'obtenir** :
```powershell
# Depuis hotel-ticket-hub
cd C:\Users\oumay\projet\hotel-ticket-hub
Get-Content github-actions-key
```

**Ou copier directement** :
```powershell
Get-Content github-actions-key | Set-Clipboard
```

**Format** : Le contenu commence par :
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

### 2. `GHCR_TOKEN`

**Description** : Personal Access Token GitHub pour accéder au GitHub Container Registry

**Comment le créer** :
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Nom : `Docker Registry Access`
4. Scopes :
   - ✅ `read:packages` (pour pull les images)
   - ✅ `write:packages` (optionnel, si vous voulez push depuis la VM)
5. **Generate token**
6. **Copiez le token** (vous ne pourrez plus le voir après)

**Valeur** : Le token que vous venez de créer

---

## 📝 Instructions pour ajouter les secrets

1. Allez dans votre repository GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Pour chaque secret manquant :
   - **Name** : Le nom du secret (ex: `FRONTEND_STAGING_SSH_PRIVATE_KEY`)
   - **Secret** : Collez la valeur
   - **Add secret**

---

## ✅ Checklist finale

- [ ] `FRONTEND_STAGING_HOST` : ✅ Configuré
- [ ] `FRONTEND_STAGING_USER` : ✅ Configuré
- [ ] `FRONTEND_STAGING_SSH_PRIVATE_KEY` : ❌ **À ajouter**
- [ ] `GHCR_TOKEN` : ❌ **À ajouter**
- [ ] `SONAR_TOKEN` : ✅ Configuré

---

## 🎯 Résumé

**Secrets manquants** : 2
- `FRONTEND_STAGING_SSH_PRIVATE_KEY` : Clé privée SSH
- `GHCR_TOKEN` : Token GitHub pour Docker Registry

Une fois ces 2 secrets ajoutés, le déploiement automatique fonctionnera ! 🚀

