# 🚨 URGENT : Corriger l'URL API dans le Frontend

## ⚠️ Problème

Le frontend essaie de se connecter à `http://13.61.27.43:8081` (IP de la database) au lieu de `http://13.49.44.219:8081/api` (IP du backend).

## ✅ Solution Immédiate

### Étape 1 : Vérifier le Secret GitHub

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
2. Trouvez `VITE_API_BASE_URL`
3. **Valeur attendue** : `http://13.49.44.219:8081/api`
4. Si ce n'est pas la bonne valeur, cliquez sur "Edit" et mettez : `http://13.49.44.219:8081/api`
5. Cliquez sur "Update secret"

### Étape 2 : Rebuild l'Image Docker

Après avoir vérifié/corrigé le secret, déclenchez un rebuild :

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
git commit --allow-empty -m "fix: rebuild frontend with correct backend API URL"
git push origin develop
```

Le pipeline va :
1. Rebuild l'image avec la bonne URL API (`13.49.44.219:8081/api`)
2. Redéployer automatiquement sur la VM frontend
3. L'erreur `ERR_CONNECTION_REFUSED` disparaîtra

### Étape 3 : Vérifier après le Déploiement

Attendez 5-10 minutes que le pipeline passe, puis testez :
- http://51.21.196.104/login
- L'erreur devrait disparaître

---

## 🔍 Vérification

### Vérifier l'URL API dans l'Image Déployée

```bash
# Se connecter à la VM frontend
ssh -i github-actions-key ubuntu@51.21.196.104

# Vérifier les variables d'environnement du conteneur
docker exec hotel-ticket-hub-frontend-staging env | grep VITE

# Vérifier le contenu du fichier de build (si accessible)
docker exec hotel-ticket-hub-frontend-staging cat /usr/share/nginx/html/index.html | grep -i "13\."
```

---

## 📊 IPs Correctes

- **Frontend** : `51.21.196.104`
- **Backend** : `13.49.44.219:8081` ✅
- **Database** : `13.61.27.43:5432`

L'URL API doit être : `http://13.49.44.219:8081/api`

