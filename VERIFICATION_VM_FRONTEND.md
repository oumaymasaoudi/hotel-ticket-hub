# ✅ Vérification VM Frontend - Checklist

## ✅ Docker installé et fonctionnel

Vous avez vérifié que Docker fonctionne avec `docker ps`. C'est bon ! ✅

## 📋 Checklist de vérification

### 1. Vérifier Docker et Docker Compose

```bash
# Vérifier les versions
docker --version
docker compose version

# Vérifier que Docker fonctionne
docker ps
```

### 2. Créer le répertoire de déploiement

```bash
# Créer le répertoire
sudo mkdir -p /opt/hotel-ticket-hub-frontend-staging
sudo chown -R ubuntu:ubuntu /opt/hotel-ticket-hub-frontend-staging
cd /opt/hotel-ticket-hub-frontend-staging

# Vérifier
pwd
ls -la
```

Vous devriez être dans `/opt/hotel-ticket-hub-frontend-staging` et le répertoire doit être vide.

### 3. Vérifier les permissions Docker

```bash
# Vérifier que vous êtes dans le groupe docker
groups

# Vous devriez voir "docker" dans la liste
# Si pas, reconnectez-vous :
exit
# Puis reconnectez-vous
```

### 4. Tester la connexion à GitHub Container Registry (optionnel)

```bash
# Tester la connexion (remplacez VOTRE_TOKEN par votre GHCR_TOKEN)
echo "VOTRE_GHCR_TOKEN" | docker login ghcr.io -u VOTRE_USERNAME --password-stdin

# Si ça fonctionne, vous verrez : "Login Succeeded"
```

---

## 🎯 État actuel

- ✅ Docker installé
- ✅ Docker fonctionne
- ⏳ Répertoire de déploiement à créer
- ⏳ Security Groups AWS à configurer (port 80)

---

## 🚀 Prochaines étapes

### 1. Créer le répertoire (si pas encore fait)

```bash
sudo mkdir -p /opt/hotel-ticket-hub-frontend-staging
sudo chown -R ubuntu:ubuntu /opt/hotel-ticket-hub-frontend-staging
```

### 2. Configurer les Security Groups AWS

Dans la console AWS EC2 :
- Security Groups → VM frontend (51.21.196.104)
- Inbound Rules → Add rule :
  - Type: HTTP
  - Port: 80
  - Source: 0.0.0.0/0
  - Save

### 3. Tester le déploiement

Une fois les Security Groups configurés, faites un commit et push vers `develop` pour déclencher le déploiement automatique.

---

## ✅ Vérification finale

Exécutez ces commandes pour vérifier que tout est prêt :

```bash
# 1. Docker fonctionne
docker ps

# 2. Répertoire existe
ls -la /opt/hotel-ticket-hub-frontend-staging/

# 3. Permissions correctes
whoami
groups | grep docker
```

Si tout est OK, vous êtes prêt pour le déploiement ! 🎉

