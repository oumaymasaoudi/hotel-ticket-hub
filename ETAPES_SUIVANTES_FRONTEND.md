# 🚀 Étapes suivantes - Configuration Frontend

## ✅ Étape 1 : Copier la clé SSH sur la VM frontend

Maintenant que les clés sont dans `hotel-ticket-hub`, vous pouvez exécuter :

```powershell
# Depuis hotel-ticket-hub
cd C:\Users\oumay\projet\hotel-ticket-hub

# Copier la clé SSH sur la VM frontend
.\copy-ssh-key.ps1 -HostIP "51.21.196.104" -AWSKey "$HOME\Downloads\oumayma-key.pem" -User "ubuntu"
```

---

## ✅ Étape 2 : Tester la connexion SSH

```powershell
# Tester la connexion
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'Connexion OK' && hostname"
```

Si ça fonctionne sans mot de passe, c'est bon ! ✅

---

## ✅ Étape 3 : Installer Docker sur la VM frontend

```powershell
# Se connecter à la VM frontend
ssh -i github-actions-key ubuntu@51.21.196.104
```

Une fois connecté, exécutez :

```bash
# Mettre à jour le système
sudo apt update

# Installer les dépendances
sudo apt install -y ca-certificates curl gnupg lsb-release

# Ajouter la clé GPG officielle de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Ajouter le repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter l'utilisateur ubuntu au groupe docker
sudo usermod -aG docker ubuntu

# Vérifier l'installation
docker --version
docker compose version

# Redémarrer la session SSH
exit
```

Reconnectez-vous pour que les changements de groupe prennent effet :

```powershell
ssh -i github-actions-key ubuntu@51.21.196.104
```

---

## ✅ Étape 4 : Créer le répertoire de déploiement

```bash
# Sur la VM frontend
sudo mkdir -p /opt/hotel-ticket-hub-frontend-staging
sudo chown -R ubuntu:ubuntu /opt/hotel-ticket-hub-frontend-staging
cd /opt/hotel-ticket-hub-frontend-staging
```

---

## ✅ Étape 5 : Configurer les Secrets GitHub

Dans GitHub → Settings → Secrets and variables → Actions, ajoutez :

1. **`FRONTEND_STAGING_HOST`**
   - Valeur : `51.21.196.104`

2. **`FRONTEND_STAGING_USER`**
   - Valeur : `ubuntu`

3. **`FRONTEND_STAGING_SSH_PRIVATE_KEY`**
   - Valeur : Contenu de `github-actions-key` (clé privée)
   - Pour obtenir : `Get-Content github-actions-key` dans PowerShell

4. **`GHCR_TOKEN`** (si pas déjà créé)
   - Valeur : Personal Access Token GitHub avec `read:packages`
   - Même token que pour le backend

---

## ✅ Étape 6 : Configurer les Security Groups AWS

Dans la console AWS EC2 :

1. Allez dans **EC2** → **Security Groups**
2. Trouvez le Security Group de la VM frontend (51.21.196.104)
3. **Edit inbound rules** → **Add rule** :
   - **Type** : `HTTP`
   - **Port** : `80`
   - **Source** : `0.0.0.0/0` (ou restreindre selon vos besoins)
   - **Description** : `Allow HTTP from anywhere`
4. **Save rules**

---

## ✅ Étape 7 : Vérifier la configuration

```bash
# Sur la VM frontend
docker ps
docker --version
docker compose version
ls -la /opt/hotel-ticket-hub-frontend-staging/
```

---

## 🚀 Déploiement automatique

Une fois tout configuré, chaque push vers `develop` déclenchera automatiquement :

1. **Build** : Construction de l'image Docker
2. **Push** : Envoi de l'image vers GitHub Container Registry
3. **Deploy** : Pull de l'image sur la VM et démarrage avec docker-compose

---

## 🧪 Tester le déploiement

### Test manuel (après le premier déploiement)

```bash
# Sur la VM frontend
cd /opt/hotel-ticket-hub-frontend-staging

# Se connecter à GHCR
echo "VOTRE_GHCR_TOKEN" | docker login ghcr.io -u VOTRE_USERNAME --password-stdin

# Pull l'image
export DOCKER_IMAGE=ghcr.io/oumaymasaoudi/hotel-tickets-backend/frontend:develop
docker pull $DOCKER_IMAGE

# Démarrer avec docker-compose
docker compose up -d

# Voir les logs
docker compose logs -f
```

### Test depuis votre navigateur

```text
http://51.21.196.104
```

---

## ✅ Checklist finale

- [ ] Clés SSH copiées dans `hotel-ticket-hub`
- [ ] Script `copy-ssh-key.ps1` dans `hotel-ticket-hub`
- [ ] Clé SSH copiée sur la VM frontend
- [ ] Docker installé sur la VM frontend
- [ ] Répertoire `/opt/hotel-ticket-hub-frontend-staging` créé
- [ ] Secrets GitHub configurés
- [ ] Security Groups AWS configurés (port 80)
- [ ] Workflow GitHub Actions configuré
- [ ] Test de connexion SSH réussi

Une fois tout configuré, le déploiement automatique fonctionnera ! 🎉

