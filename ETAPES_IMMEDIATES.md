# 🎯 Étapes Immédiates - Configuration GitHub Secrets

## 📋 Étape 1 : Ouvrir la clé privée pour la copier

Exécutez cette commande dans PowerShell :

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
notepad github-actions-key
```

**Dans Notepad :**
1. Sélectionnez **tout** (Ctrl+A)
2. Copiez (Ctrl+C)
3. **Gardez Notepad ouvert** (vous en aurez besoin à l'étape 3)

---

## 📋 Étape 2 : Aller sur GitHub

1. Ouvrez votre navigateur
2. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
3. Vous verrez la liste des secrets existants

---

## 📋 Étape 3 : Configurer les Secrets (dans l'ordre)

### Secret 1 : `FRONTEND_STAGING_SSH_PRIVATE_KEY`

1. Cliquez sur **"New repository secret"** (ou **Edit** si le secret existe déjà)
2. **Name :** `FRONTEND_STAGING_SSH_PRIVATE_KEY`
3. **Secret :** Collez la clé privée que vous avez copiée dans Notepad (Ctrl+V)
   - Doit commencer par `-----BEGIN OPENSSH PRIVATE KEY-----`
   - Doit se terminer par `-----END OPENSSH PRIVATE KEY-----`
4. Cliquez sur **"Add secret"** (ou **"Update secret"**)

### Secret 2 : `GHCR_TOKEN`

1. Cliquez sur **"New repository secret"**
2. **Name :** `GHCR_TOKEN`
3. **Secret :** `<VOTRE_TOKEN_GHCR>` (remplacez par votre token GitHub avec permissions `read:packages`)
4. Cliquez sur **"Add secret"**

### Secret 3 : `FRONTEND_STAGING_HOST`

1. Cliquez sur **"New repository secret"**
2. **Name :** `FRONTEND_STAGING_HOST`
3. **Secret :** `51.21.196.104`
4. Cliquez sur **"Add secret"**

### Secret 4 : `FRONTEND_STAGING_USER`

1. Cliquez sur **"New repository secret"**
2. **Name :** `FRONTEND_STAGING_USER`
3. **Secret :** `ubuntu`
4. Cliquez sur **"Add secret"**

### Secret 5 : `VITE_API_BASE_URL` (optionnel mais recommandé)

1. Cliquez sur **"New repository secret"**
2. **Name :** `VITE_API_BASE_URL`
3. **Secret :** `http://13.61.27.43:8081`
4. Cliquez sur **"Add secret"**

---

## ✅ Étape 4 : Vérifier

Vous devez avoir ces 5 secrets configurés :
- ✅ `FRONTEND_STAGING_SSH_PRIVATE_KEY`
- ✅ `GHCR_TOKEN`
- ✅ `FRONTEND_STAGING_HOST`
- ✅ `FRONTEND_STAGING_USER`
- ✅ `VITE_API_BASE_URL`

---

## 🚀 Étape 5 : Tester

1. Faites un commit et push sur la branche `develop`
2. Le pipeline GitHub Actions devrait se déclencher
3. Vérifiez que le déploiement fonctionne

---

## ⚠️ Si vous avez des erreurs

- **Erreur SSH** : Vérifiez que la clé privée est complète (toutes les lignes)
- **Erreur GHCR** : Vérifiez que le token `ghp_...` est correct
- **Erreur de connexion** : Vérifiez que l'IP `51.21.196.104` est correcte

