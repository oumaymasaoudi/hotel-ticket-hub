# 🔧 Corriger le Problème API Backend

## ⚠️ Problème Identifié

L'erreur dans la console montre :
```
POST http://13.61.27.43:8081/auth/register net::ERR_CONNECTION_REFUSED
```

**Le frontend essaie de se connecter à `13.61.27.43:8081` mais cette IP/port n'est pas accessible.**

## 🔍 Vérifications Nécessaires

### 1. Quelle est la VRAIE IP du Backend ?

D'après vos fichiers :
- Dockerfile utilise : `http://13.49.44.219:8081/api`
- L'erreur montre : `http://13.61.27.43:8081`

**Question : Quelle est la bonne IP du backend ?**
- `13.49.44.219` (dans Dockerfile) ?
- `13.61.27.43` (dans l'erreur) ?

### 2. Vérifier que le Backend est Accessible

Depuis la VM frontend, testez :

```bash
# Se connecter à la VM frontend
ssh -i "<CLE_AWS>.pem" ubuntu@51.21.196.104

# Tester la connexion au backend
curl http://13.49.44.219:8081/api/health
# OU
curl http://13.61.27.43:8081/api/health
```

## ✅ Solutions

### Solution 1 : Corriger l'URL API dans le Secret GitHub

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
2. Trouvez `VITE_API_BASE_URL`
3. Mettez la **bonne URL** :
   - Si backend est sur `13.49.44.219` : `http://13.49.44.219:8081/api`
   - Si backend est sur `13.61.27.43` : `http://13.61.27.43:8081/api`
4. Cliquez sur "Update secret"

### Solution 2 : Rebuild l'Image Docker

Après avoir corrigé le secret, le prochain push reconstruira l'image avec la bonne URL.

### Solution 3 : Vérifier le Security Group AWS

Le Security Group du backend doit autoriser :
- Port `8081` depuis `0.0.0.0/0` (ou au moins depuis `51.21.196.104`)

## 🎯 Action Immédiate

**Dites-moi quelle est la bonne IP du backend et je corrigerai la configuration.**

