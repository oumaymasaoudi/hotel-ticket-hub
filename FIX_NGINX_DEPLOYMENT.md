# 🔧 Correction du Problème de Déploiement Nginx

## 🐛 **Problème Identifié**

Le conteneur nginx ne démarre pas avec l'erreur :
```
nginx: [emerg] open() "/run/nginx.pid" failed (13: Permission denied)
```

**Cause :** Nginx essaie d'écrire dans `/run/nginx.pid` qui nécessite des privilèges root, mais le conteneur s'exécute en tant qu'utilisateur `nginx` (non-root).

---

## ✅ **Solution Implémentée**

### **1. Configuration Nginx Personnalisée**

Création de `nginx-main.conf` qui utilise `/var/run/nginx/nginx.pid` au lieu de `/run/nginx.pid` :

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx/nginx.pid;  # ✅ Chemin accessible par nginx user
```

### **2. Script d'Entrée Personnalisé**

Création de `docker-entrypoint.sh` qui :
- Vérifie que le répertoire `/var/run/nginx` existe
- Vérifie que la configuration nginx est correcte
- Teste la configuration avant de démarrer
- Démarre nginx avec notre configuration personnalisée

```bash
#!/bin/sh
# Custom entrypoint script for nginx non-root user

set -e

# Ensure pid directory exists and has correct permissions
if [ ! -d /var/run/nginx ]; then
    mkdir -p /var/run/nginx
    chown nginx:nginx /var/run/nginx
    chmod 755 /var/run/nginx
fi

# Verify nginx.conf has correct pid path
if ! grep -q "pid /var/run/nginx/nginx.pid" /etc/nginx/nginx.conf; then
    echo "ERROR: nginx.conf must have 'pid /var/run/nginx/nginx.pid;'"
    exit 1
fi

# Test nginx configuration
nginx -t -c /etc/nginx/nginx.conf

# Start nginx with our custom config
exec nginx -c /etc/nginx/nginx.conf -g "daemon off;"
```

### **3. Modifications Dockerfile**

- ✅ Copie de `nginx-main.conf` vers `/etc/nginx/nginx.conf`
- ✅ Copie de `docker-entrypoint.sh` et attribution des permissions d'exécution
- ✅ Création de `/var/run/nginx` avec permissions pour l'utilisateur nginx
- ✅ Utilisation de `ENTRYPOINT` pour notre script personnalisé au lieu du script par défaut

---

## 📋 **Fichiers Modifiés/Créés**

1. ✅ `nginx-main.conf` - Configuration nginx principale avec pid dans `/var/run/nginx/nginx.pid`
2. ✅ `docker-entrypoint.sh` - Script d'entrée personnalisé
3. ✅ `Dockerfile` - Utilisation du script d'entrée personnalisé

---

## 🚀 **Résultat Attendu**

Après ces modifications :
- ✅ Nginx peut démarrer en tant qu'utilisateur non-root
- ✅ Le fichier PID est créé dans `/var/run/nginx/nginx.pid` (accessible par nginx)
- ✅ Le conteneur démarre correctement
- ✅ Le health check devrait passer

---

## ⚠️ **Note Importante**

Le health check dans le workflow GitHub Actions utilise `http://localhost/health`. Comme le port est mappé `80:8080` dans `docker-compose.yml`, cela devrait fonctionner depuis l'hôte. Si le health check échoue, vérifiez que :
- Le conteneur écoute bien sur le port 8080
- Le mapping de port dans docker-compose est correct
- Le health check endpoint `/health` est accessible

---

## 🔍 **Vérification**

Pour vérifier que le conteneur démarre correctement :

```bash
# Vérifier les logs
docker compose logs

# Vérifier que nginx écoute sur le port 8080
docker exec hotel-ticket-hub-frontend-staging netstat -tlnp | grep 8080

# Tester le health check
curl http://localhost/health
```

---

**Le problème devrait maintenant être résolu !** ✅

