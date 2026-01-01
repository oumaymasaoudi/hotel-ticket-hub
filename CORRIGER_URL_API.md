# 🔧 Corriger l'URL API Backend

## ✅ IPs Confirmées

- **Frontend** : `51.21.196.104`
- **Backend** : `13.49.44.219` ✅
- **Database** : `13.61.27.43`

## ⚠️ Problème

L'image Docker déployée utilise la mauvaise URL API (`13.61.27.43` au lieu de `13.49.44.219`).

## 🔧 Solution

### Étape 1 : Vérifier le Secret GitHub

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
2. Trouvez `VITE_API_BASE_URL`
3. **Valeur attendue** : `http://13.49.44.219:8081/api`
4. Si ce n'est pas la bonne valeur, cliquez sur "Edit" et mettez : `http://13.49.44.219:8081/api`
5. Cliquez sur "Update secret"

### Étape 2 : Rebuild l'Image Docker

Après avoir corrigé le secret, faites un commit pour déclencher un rebuild :

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Faire un petit changement pour déclencher le pipeline
git commit --allow-empty -m "fix: rebuild with correct API URL"

# Pousser
git push origin develop
```

### Étape 3 : Vérifier le Déploiement

1. Attendez que le pipeline passe (5-10 minutes)
2. Vérifiez que le nouveau conteneur est déployé
3. Testez : http://51.21.196.104/signup

---

## 🎯 Alternative : Rebuild Manuel sur la VM

Si vous voulez corriger immédiatement sans attendre le pipeline :

```bash
# Se connecter à la VM frontend
ssh -i "<CLE_AWS>.pem" ubuntu@51.21.196.104

# Se connecter au registry
echo "<GHCR_TOKEN>" | docker login ghcr.io -u oumaymasaoudi --password-stdin

# Pull la dernière image (qui sera rebuild avec la bonne URL)
docker pull ghcr.io/oumaymasaoudi/hotel-ticket-hub/frontend:develop

# Redémarrer le conteneur
cd /opt/hotel-ticket-hub-frontend-staging
docker compose down
docker compose up -d
```

---

## ✅ Vérification

Après le rebuild, l'erreur devrait disparaître et l'API devrait fonctionner.

