# 🐳 Commandes pour Vérifier les Conteneurs Docker

## 📋 IPs des VMs

- **Frontend** : `51.21.196.104`
- **Backend** : `13.49.44.219`
- **Database** : `13.61.27.43`

---

## 🔍 VM Frontend (51.21.196.104)

### Se connecter
```bash
ssh -i "<CHEMIN_VERS_CLE_AWS>.pem" ubuntu@51.21.196.104
```

### Commandes de vérification

```bash
# 1. Voir tous les conteneurs (en cours d'exécution)
docker ps

# 2. Voir le conteneur frontend spécifiquement
docker ps | grep hotel-ticket-hub-frontend-staging

# 3. Voir tous les conteneurs (y compris arrêtés)
docker ps -a

# 4. Voir les logs du conteneur
docker logs hotel-ticket-hub-frontend-staging

# 5. Voir les dernières 50 lignes des logs
docker logs hotel-ticket-hub-frontend-staging --tail=50

# 6. Suivre les logs en temps réel
docker logs hotel-ticket-hub-frontend-staging -f

# 7. Vérifier l'état de santé du conteneur
docker inspect hotel-ticket-hub-frontend-staging | grep -i health

# 8. Vérifier les ressources utilisées
docker stats hotel-ticket-hub-frontend-staging

# 9. Vérifier que le port 80 est bien exposé
sudo netstat -tlnp | grep :80

# 10. Tester le healthcheck localement
curl http://localhost/health

# 11. Voir les informations du conteneur
docker inspect hotel-ticket-hub-frontend-staging

# 12. Voir les images Docker disponibles
docker images | grep hotel-ticket-hub

# 13. Voir la configuration docker-compose
cd /opt/hotel-ticket-hub-frontend-staging
cat docker-compose.yml
```

---

## 🔍 VM Backend (13.49.44.219)

### Se connecter
```bash
ssh -i "<CHEMIN_VERS_CLE_AWS>.pem" ubuntu@13.49.44.219
```

### Commandes de vérification

```bash
# 1. Voir tous les conteneurs (en cours d'exécution)
docker ps

# 2. Voir le conteneur backend spécifiquement
docker ps | grep hotel-ticket-hub-backend-staging

# 3. Voir tous les conteneurs (y compris arrêtés)
docker ps -a

# 4. Voir les logs du conteneur
docker logs hotel-ticket-hub-backend-staging

# 5. Voir les dernières 50 lignes des logs
docker logs hotel-ticket-hub-backend-staging --tail=50

# 6. Suivre les logs en temps réel
docker logs hotel-ticket-hub-backend-staging -f

# 7. Vérifier l'état de santé du conteneur
docker inspect hotel-ticket-hub-backend-staging | grep -i health

# 8. Vérifier les ressources utilisées
docker stats hotel-ticket-hub-backend-staging

# 9. Vérifier que le port 8081 est bien exposé
sudo netstat -tlnp | grep :8081

# 10. Tester l'API localement
curl http://localhost:8081/api/health

# 11. Voir les informations du conteneur
docker inspect hotel-ticket-hub-backend-staging

# 12. Voir les images Docker disponibles
docker images | grep hotel-ticket-hub

# 13. Voir la configuration docker-compose
cd /opt/hotel-ticket-hub-backend-staging
cat docker-compose.yml

# 14. Voir les variables d'environnement du conteneur
docker exec hotel-ticket-hub-backend-staging env | grep -E "SPRING|CORS|DATABASE"
```

---

## 🔍 VM Database (13.61.27.43)

### Se connecter
```bash
ssh -i "<CHEMIN_VERS_CLE_AWS>.pem" ubuntu@13.61.27.43
```

### Commandes de vérification

```bash
# 1. Voir tous les conteneurs (en cours d'exécution)
docker ps

# 2. Voir tous les conteneurs (y compris arrêtés)
docker ps -a

# 3. Vérifier que PostgreSQL écoute sur le port 5432
sudo netstat -tlnp | grep :5432

# 4. Vérifier le statut de PostgreSQL (si installé via apt)
sudo systemctl status postgresql

# 5. Vérifier la version de PostgreSQL
psql --version

# 6. Se connecter à PostgreSQL
sudo -u postgres psql

# 7. Dans psql, vérifier les bases de données
\l

# 8. Vérifier les connexions actives
SELECT * FROM pg_stat_activity;

# 9. Quitter psql
\q

# 10. Vérifier les logs PostgreSQL (si système)
sudo journalctl -u postgresql -n 50

# 11. Tester la connexion depuis la VM backend
# (Depuis la VM backend, pas depuis la VM database)
curl -v telnet://13.61.27.43:5432
```

---

## 🚀 Commandes Utiles pour Toutes les VMs

### Redémarrer un conteneur
```bash
# Frontend
cd /opt/hotel-ticket-hub-frontend-staging
docker compose restart

# Backend
cd /opt/hotel-ticket-hub-backend-staging
docker compose restart
```

### Arrêter un conteneur
```bash
# Frontend
cd /opt/hotel-ticket-hub-frontend-staging
docker compose down

# Backend
cd /opt/hotel-ticket-hub-backend-staging
docker compose down
```

### Démarrer un conteneur
```bash
# Frontend
cd /opt/hotel-ticket-hub-frontend-staging
docker compose up -d

# Backend
cd /opt/hotel-ticket-hub-backend-staging
docker compose up -d
```

### Voir les logs en temps réel
```bash
# Frontend
cd /opt/hotel-ticket-hub-frontend-staging
docker compose logs -f

# Backend
cd /opt/hotel-ticket-hub-backend-staging
docker compose logs -f
```

### Pull la dernière image
```bash
# Frontend
cd /opt/hotel-ticket-hub-frontend-staging
docker compose pull
docker compose up -d

# Backend
cd /opt/hotel-ticket-hub-backend-staging
docker compose pull
docker compose up -d
```

---

## ✅ Checklist de Vérification Rapide

### Frontend (51.21.196.104)
```bash
ssh -i "<CLE>.pem" ubuntu@51.21.196.104
docker ps | grep frontend
curl http://localhost/health
```

### Backend (13.49.44.219)
```bash
ssh -i "<CLE>.pem" ubuntu@13.49.44.219
docker ps | grep backend
curl http://localhost:8081/api/health
```

### Database (13.61.27.43)
```bash
ssh -i "<CLE>.pem" ubuntu@13.61.27.43
sudo netstat -tlnp | grep :5432
sudo -u postgres psql -c "\l"
```

---

## 🔧 Dépannage

### Si un conteneur ne démarre pas
```bash
# Voir les logs d'erreur
docker logs <nom-conteneur>

# Voir les événements Docker
docker events

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Si un conteneur est "unhealthy"
```bash
# Voir les détails du healthcheck
docker inspect <nom-conteneur> | grep -A 10 Health

# Tester manuellement le healthcheck
curl http://localhost/health  # Frontend
curl http://localhost:8081/api/health  # Backend
```

### Nettoyer les conteneurs/images inutilisés
```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune -a

# Nettoyer tout (attention !)
docker system prune -a
```

