# 🔐 Commandes SSH pour Chaque VM

## 📍 VM Frontend (51.21.196.104)

### Se connecter
```powershell
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104
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
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@13.49.44.219
```

### Voir le conteneur
```bash
docker ps | grep backend
```

### Voir les logs
```bash
docker logs hotel-ticket-hub-backend-staging --tail=50
```

### Tester l'API
```bash
curl http://localhost:8081/api/health
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
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@13.61.27.43
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

## 🔧 Commandes Utiles (Sur Chaque VM)

### Voir tous les conteneurs
```bash
docker ps
```

### Voir tous les conteneurs (y compris arrêtés)
```bash
docker ps -a
```

### Voir les logs en temps réel
```bash
docker logs <nom-conteneur> -f
```

### Voir les ressources utilisées
```bash
docker stats
```

### Voir les images Docker
```bash
docker images
```

