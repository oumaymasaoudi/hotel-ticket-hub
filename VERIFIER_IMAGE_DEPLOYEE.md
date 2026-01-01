# 🔍 Vérifier l'URL API dans l'Image Déployée

## 📋 Commandes à Exécuter sur la VM Frontend

```bash
# Se connecter à la VM frontend
ssh -i "<CLE_AWS>.pem" ubuntu@51.21.196.104

# Vérifier les variables d'environnement du conteneur
docker exec hotel-ticket-hub-frontend-staging env | grep VITE

# Vérifier le contenu du fichier de build (si accessible)
docker exec hotel-ticket-hub-frontend-staging cat /usr/share/nginx/html/index.html | grep -i "api\|13\."

# Vérifier les logs du build
docker logs hotel-ticket-hub-frontend-staging 2>&1 | grep -i "vite\|api\|build"
```

## 🔧 Solution Rapide : Rebuild avec la Bonne URL

Si l'URL est incorrecte, il faut :

1. **Vérifier le secret GitHub** `VITE_API_BASE_URL`
2. **Faire un nouveau commit** pour déclencher un rebuild
3. **Ou modifier directement le Dockerfile** avec la bonne URL

## ⚠️ Question Importante

**Quelle est la VRAIE IP du backend ?**
- `13.49.44.219` (dans Dockerfile) ?
- `13.61.27.43` (dans l'erreur) ?

Une fois que vous me dites la bonne IP, je corrigerai tout.

