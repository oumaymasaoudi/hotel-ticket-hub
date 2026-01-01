# 🔐 Commandes SSH Corrigées - Utiliser github-actions-key

## 📍 VM Frontend (51.21.196.104)

### Se connecter
```powershell
ssh -i github-actions-key ubuntu@51.21.196.104
```

### Voir le conteneur
```bash
docker ps | grep frontend
```

### Voir les logs
```bash
docker logs hotel-ticket-hub-frontend-staging --tail=50
```

### Tester le healthcheck
```bash
curl http://localhost/health
```

### Vérifier le port 80
```bash
sudo netstat -tlnp | grep :80
```

### Redémarrer le conteneur
```bash
cd /opt/hotel-ticket-hub-frontend-staging
docker compose restart
```

---

## 📍 VM Backend (13.49.44.219)

### Se connecter
```powershell
ssh -i github-actions-key ubuntu@13.49.44.219
```

### Voir le conteneur
```bash
docker ps | grep backend
```

### Voir les logs
```bash
docker logs hotel-ticket-hub-backend-staging --tail=50
```

### Tester l'API (Note: /api/health n'existe pas, utiliser un endpoint existant)
```bash
# Tester un endpoint qui existe
curl http://localhost:8081/api/auth/login

# Ou vérifier que le serveur répond
curl http://localhost:8081/api
```

### Vérifier le port 8081
```bash
sudo netstat -tlnp | grep :8081
```

### Redémarrer le conteneur
```bash
cd /opt/hotel-ticket-hub-backend-staging
docker compose restart
```

---

## 📍 VM Database (13.61.27.43)

### Se connecter
```powershell
ssh -i github-actions-key ubuntu@13.61.27.43
```

### Vérifier PostgreSQL
```bash
sudo netstat -tlnp | grep :5432
```

### Se connecter à PostgreSQL
```bash
sudo -u postgres psql
```

### Voir les bases de données
```bash
sudo -u postgres psql -c "\l"
```

### Vérifier le statut PostgreSQL
```bash
sudo systemctl status postgresql
```

---

## 📊 Résumé des Vérifications

### ✅ Frontend (51.21.196.104)
- Conteneur : ✅ En cours d'exécution
- Healthcheck : ✅ Répond "healthy"
- Port 80 : ✅ Écoute correctement

### ✅ Backend (13.49.44.219)
- Conteneur : ✅ En cours d'exécution
- Spring Boot : ✅ Démarré correctement
- Port 8081 : ✅ Écoute correctement
- ⚠️ Note : `/api/health` n'existe pas (404 normal)

### ✅ Database (13.61.27.43)
- PostgreSQL : ✅ Écoute sur port 5432
- Connexion : ✅ Fonctionne

---

## 🔧 Commandes Utiles (Sur Chaque VM)

### Voir tous les conteneurs
```bash
docker ps
```

### Voir les logs en temps réel
```bash
docker logs <nom-conteneur> -f
```

### Voir les ressources utilisées
```bash
docker stats
```

