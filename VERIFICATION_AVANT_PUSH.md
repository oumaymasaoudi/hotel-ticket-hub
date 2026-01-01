# ✅ Vérification Complète Avant Push

## 🔍 Checklist de Vérification

### 1. ✅ Code et Tests
- [x] TypeScript : `npm run type-check` ✅ (pas d'erreurs)
- [ ] Lint : `npm run lint` (à vérifier)
- [ ] Tests : `npm test` (à vérifier)
- [ ] Build : `npm run build` (à vérifier)

### 2. 🔐 Secrets GitHub (CRITIQUE)
Vérifiez que tous les secrets sont configurés dans GitHub → Settings → Secrets and variables → Actions :

- [ ] `FRONTEND_STAGING_HOST` : `51.21.196.104`
- [ ] `FRONTEND_STAGING_USER` : `ubuntu`
- [ ] `FRONTEND_STAGING_SSH_PRIVATE_KEY` : Contenu de `github-actions-key` ⚠️ **CRITIQUE**
- [ ] `GHCR_TOKEN` : Token GitHub avec `read:packages`
- [ ] `SONAR_TOKEN` : Token SonarQube

### 3. 🔑 Clé SSH sur la VM (CRITIQUE)
**Le problème principal est ici !**

Vérifiez que la clé publique correspond à celle autorisée sur la VM :

```powershell
# 1. Générer la clé publique depuis votre clé privée locale
cd C:\Users\oumay\projet\hotel-ticket-hub
ssh-keygen -y -f github-actions-key > temp-key.pub
Get-Content temp-key.pub

# 2. Se connecter à la VM et vérifier
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104
cat ~/.ssh/authorized_keys

# 3. Si les clés ne correspondent PAS, copiez la bonne :
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104 "mkdir -p ~/.ssh && grep -qxF '$publicKey' ~/.ssh/authorized_keys || echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"

# 4. Tester la connexion
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK'"
```

### 4. 📋 Fichiers de Configuration

#### docker-compose.yml
- [x] ✅ Image : `${DOCKER_IMAGE:-hotel-ticket-hub-frontend:latest}`
- [x] ✅ Port : `80:80`
- [x] ✅ Healthcheck configuré
- [x] ✅ Network configuré

#### Dockerfile
- [x] ✅ Build args : `VITE_API_BASE_URL`
- [x] ✅ Multi-stage build
- [x] ✅ Healthcheck configuré
- [x] ✅ Nginx configuré

#### nginx.conf
- [x] ✅ Port 80
- [x] ✅ SPA routing : `try_files $uri $uri/ /index.html`
- [x] ✅ Health endpoint : `/health`
- [x] ✅ Security headers

#### .github/workflows/frontend-ci.yml
- [x] ✅ Secrets utilisés correctement
- [x] ✅ GHCR_TOKEN sécurisé (via env var)
- [x] ✅ Conditions de déploiement : `develop` branch
- [x] ✅ Docker build avec build-args
- [x] ✅ Déploiement avec docker-compose

### 5. 🚨 Problèmes Connus à Résoudre

#### ⚠️ PROBLÈME CRITIQUE : Authentification SSH
**Le pipeline échoue toujours sur l'authentification SSH.**

**Solution :**
1. Vérifiez que `FRONTEND_STAGING_SSH_PRIVATE_KEY` dans GitHub contient **exactement** le contenu de `github-actions-key`
2. Vérifiez que la clé publique correspondante est dans `~/.ssh/authorized_keys` sur la VM
3. Testez manuellement : `ssh -i github-actions-key ubuntu@51.21.196.104`

### 6. 📝 Commandes de Vérification Locale

```powershell
# Depuis hotel-ticket-hub
cd C:\Users\oumay\projet\hotel-ticket-hub

# 1. Type check (déjà fait ✅)
npm run type-check

# 2. Lint
npm run lint

# 3. Tests
npm test

# 4. Build
npm run build

# 5. Vérifier que dist/ existe
Test-Path dist
```

### 7. 🔄 Workflow GitHub Actions - Points de Vérification

#### Job: lint
- ✅ Continue-on-error: true (ne bloque pas)
- ✅ Scripts npm existent

#### Job: test
- ✅ Coverage threshold: 50%
- ✅ Continue-on-error pour coverage (warning seulement)

#### Job: build
- ✅ Needs: [lint, test]
- ✅ Upload artifacts: dist

#### Job: docker-build
- ✅ Needs: [build]
- ✅ Condition: `develop` branch
- ✅ Build args: `VITE_API_BASE_URL`
- ✅ Push vers GHCR

#### Job: deploy-staging
- ✅ Needs: [docker-build]
- ✅ Condition: `develop` branch
- ✅ Environment: staging
- ⚠️ **PROBLÈME** : Authentification SSH (voir section 5)

### 8. ✅ Checklist Finale Avant Push

- [ ] Tous les tests passent localement
- [ ] Type-check passe (✅ déjà fait)
- [ ] Lint passe
- [ ] Build fonctionne
- [ ] **CRITIQUE** : Clé SSH testée et fonctionne
- [ ] **CRITIQUE** : Secret `FRONTEND_STAGING_SSH_PRIVATE_KEY` est correct dans GitHub
- [ ] Secret `GHCR_TOKEN` est configuré
- [ ] Tous les fichiers sont commités
- [ ] Pas de fichiers sensibles dans le commit (github-actions-key)

### 9. 🚀 Commandes de Push

```powershell
# Vérifier le statut
git status

# Ajouter les fichiers
git add .

# Commit
git commit -m "fix: secure GHCR token, reduce function nesting, fix linting issues"

# Push (sur develop)
git push origin develop
```

## ⚠️ ATTENTION

**NE PAS PUSHER si :**
- ❌ La clé SSH ne fonctionne pas en local
- ❌ Les secrets GitHub ne sont pas configurés
- ❌ Le build échoue localement
- ❌ Des fichiers sensibles sont dans le commit

## 🎯 Priorité des Actions

1. **URGENT** : Vérifier et corriger la clé SSH (voir section 3)
2. **URGENT** : Vérifier les secrets GitHub (voir section 2)
3. Tester localement (lint, test, build)
4. Push seulement si tout est OK

