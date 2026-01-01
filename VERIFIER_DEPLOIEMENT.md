# ✅ Vérifier le Déploiement Frontend

## 🌐 1. Vérifications Web (Depuis votre navigateur)

### Frontend Application
Ouvrez dans votre navigateur :
- **URL** : http://51.21.196.104
- **Attendu** : L'application React doit s'afficher

### Health Check
Ouvrez dans votre navigateur :
- **URL** : http://51.21.196.104/health
- **Attendu** : `{"status":"ok"}` ou similaire

### API Backend (si accessible)
- **URL** : http://13.49.44.219:8081/api
- **Attendu** : Réponse JSON de l'API

---

## 🔍 2. Vérifications via SSH (Optionnel)

### Se connecter à la VM Frontend

```powershell
# Depuis PowerShell (si vous avez la clé AWS)
ssh -i "<CHEMIN_VERS_VOTRE_CLE_AWS>.pem" ubuntu@51.21.196.104
```

### Commandes à exécuter sur la VM

```bash
# Vérifier que le conteneur Docker est en cours d'exécution
docker ps | grep hotel-ticket-hub-frontend-staging

# Vérifier les logs du conteneur
docker logs hotel-ticket-hub-frontend-staging --tail=50

# Vérifier le healthcheck
curl http://localhost/health

# Vérifier que Nginx écoute sur le port 80
sudo netstat -tlnp | grep :80
```

---

## 📊 3. Vérifications GitHub Actions

### Vérifier le Pipeline
1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
2. Cliquez sur le dernier workflow (celui qui vient de passer)
3. Vérifiez que toutes les étapes sont vertes :
   - ✅ Lint & Type Check
   - ✅ Test & Coverage
   - ✅ Build
   - ✅ SonarQube Analysis
   - ✅ Docker Build & Push
   - ✅ Deploy to Staging

### Vérifier les Logs de Déploiement
Dans l'étape "Deploy to Staging", vérifiez :
- ✅ "Container is healthy!"
- ✅ "docker ps | grep hotel-ticket-hub-frontend-staging" retourne le conteneur

---

## 🧪 4. Tests Fonctionnels

### Test 1 : Page d'Accueil
- Ouvrez : http://51.21.196.104
- Vérifiez que la page se charge
- Vérifiez qu'il n'y a pas d'erreurs dans la console (F12)

### Test 2 : Health Check
```powershell
# Depuis PowerShell
curl http://51.21.196.104/health
```

**Attendu** : `{"status":"ok"}`

### Test 3 : Connexion API
- Ouvrez la console du navigateur (F12)
- Vérifiez que les appels API fonctionnent
- L'URL de base doit être : `http://13.49.44.219:8081/api`

---

## ⚠️ 5. Problèmes Courants

### Le site ne charge pas
1. Vérifiez que le conteneur est en cours d'exécution : `docker ps`
2. Vérifiez les logs : `docker logs hotel-ticket-hub-frontend-staging`
3. Vérifiez le Security Group AWS (port 80 ouvert)

### Erreur 502 Bad Gateway
- Le conteneur n'est probablement pas démarré
- Vérifiez les logs Docker

### L'API ne répond pas
- Vérifiez que le backend est accessible : http://13.49.44.219:8081/api
- Vérifiez la variable `VITE_API_BASE_URL` dans le Dockerfile

---

## ✅ Checklist de Vérification

- [ ] Le pipeline GitHub Actions est vert
- [ ] Le site est accessible : http://51.21.196.104
- [ ] Le health check répond : http://51.21.196.104/health
- [ ] L'application React s'affiche correctement
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Les appels API fonctionnent (si le backend est accessible)

---

## 🎉 Si Tout Fonctionne

Félicitations ! Votre pipeline CI/CD est opérationnel. Chaque push sur `develop` déploiera automatiquement votre application frontend sur la VM de staging.

