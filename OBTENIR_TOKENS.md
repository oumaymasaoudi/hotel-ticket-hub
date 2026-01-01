# 🔑 Comment Obtenir les Tokens et Clés

## 🔐 1. Clé SSH (FRONTEND_STAGING_SSH_PRIVATE_KEY)

### ✅ Vous l'avez déjà !

La clé SSH qui fonctionne localement est dans votre projet :
- **Fichier** : `github-actions-key` (dans `C:\Users\oumay\projet\hotel-ticket-hub`)
- **Vous venez de la copier** : `Get-Content github-actions-key | Set-Clipboard`

**Action** : Collez-la dans le secret GitHub `FRONTEND_STAGING_SSH_PRIVATE_KEY`

---

## 🎫 2. Token GHCR (GHCR_TOKEN)

### Si vous ne l'avez pas encore :

#### Étape 1 : Créer un Personal Access Token GitHub

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Remplissez :
   - **Note** : `GHCR Token for Docker Registry`
   - **Expiration** : Choisissez (ex: 90 jours ou No expiration)
   - **Scopes** : Cochez **`read:packages`** (minimum requis)
   - Optionnel : **`write:packages`** (si vous voulez push des images)
4. Cliquez sur **"Generate token"**
5. **⚠️ IMPORTANT** : Copiez le token immédiatement (vous ne pourrez plus le voir après)

#### Étape 2 : Ajouter comme secret GitHub

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
2. Cliquez sur **"New repository secret"**
3. Remplissez :
   - **Name** : `GHCR_TOKEN`
   - **Secret** : Collez le token que vous venez de créer
4. Cliquez sur **"Add secret"**

---

## 🔍 3. Vérifier les Secrets Existants

D'après votre image précédente, vous avez déjà :
- ✅ `FRONTEND_STAGING_HOST` : `51.21.196.104`
- ✅ `FRONTEND_STAGING_USER` : `ubuntu`
- ✅ `FRONTEND_STAGING_SSH_PRIVATE_KEY` : ⚠️ À mettre à jour avec la clé locale
- ✅ `GHCR_TOKEN` : Mis à jour il y a 1h (si c'est récent, il devrait fonctionner)
- ✅ `SONAR_TOKEN` : Configuré

---

## ✅ Action Immédiate

### Pour la Clé SSH (PRIORITÉ) :

```powershell
# La clé est déjà dans votre presse-papiers
# Allez sur GitHub et mettez à jour FRONTEND_STAGING_SSH_PRIVATE_KEY
```

1. GitHub → Settings → Secrets → Actions
2. Trouvez `FRONTEND_STAGING_SSH_PRIVATE_KEY`
3. Edit → Supprimez l'ancien contenu → Collez (Ctrl+V) → Update

### Pour GHCR_TOKEN :

**Si vous l'avez déjà** (mis à jour il y a 1h) : ✅ Pas besoin de le changer

**Si vous ne l'avez pas** : Suivez les étapes ci-dessus pour le créer

---

## 🎯 Résumé

| Secret | Où l'obtenir | Statut |
|--------|--------------|--------|
| `FRONTEND_STAGING_SSH_PRIVATE_KEY` | Fichier local `github-actions-key` | ⚠️ À mettre à jour |
| `GHCR_TOKEN` | GitHub → Settings → Tokens | ✅ Déjà configuré (il y a 1h) |
| `SONAR_TOKEN` | SonarQube Cloud | ✅ Déjà configuré |

---

**Action principale** : Mettre à jour `FRONTEND_STAGING_SSH_PRIVATE_KEY` avec la clé qui est dans votre presse-papiers.

