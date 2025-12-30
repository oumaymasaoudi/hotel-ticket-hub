# 🚀 Configuration Frontend Staging - Guide Complet

## 📋 Vue d'ensemble

Configuration de la VM frontend (51.21.196.104) pour déployer le frontend React avec Docker.

---

## ✅ Étape 1 : Installer Docker sur la VM frontend

```bash
# Se connecter à la VM frontend
ssh -i github-actions-key ubuntu@51.21.196.104

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

# Redémarrer la session SSH pour que les changements de groupe prennent effet
exit
```

Reconnectez-vous :

```bash
ssh -i github-actions-key ubuntu@51.21.196.104
```

---

## ✅ Étape 2 : Créer le répertoire de déploiement

```bash
# Créer le répertoire
sudo mkdir -p /opt/hotel-ticket-hub-frontend-staging
sudo chown -R ubuntu:ubuntu /opt/hotel-ticket-hub-frontend-staging
cd /opt/hotel-ticket-hub-frontend-staging
```

---

## ✅ Étape 3 : Configurer l'accès à GitHub Container Registry

### 3.1 Créer un Personal Access Token GitHub

1. Allez sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Cliquez sur **Generate new token (classic)**
3. Donnez un nom : `Docker Registry Access`
4. Sélectionnez les scopes :
   - ✅ `read:packages` (pour pull les images)
   - ✅ `write:packages` (optionnel)
5. Cliquez sur **Generate token**
6. **Copiez le token** (vous ne pourrez plus le voir après)

### 3.2 Ajouter le token comme secret GitHub

1. Allez dans votre repository → **Settings** → **Secrets and variables** → **Actions**
2. Si `GHCR_TOKEN` n'existe pas déjà, créez-le :
   - Nom : `GHCR_TOKEN`
   - Valeur : collez le token que vous venez de créer
   - Cliquez sur **Add secret**

### 3.3 Se connecter à GHCR sur la VM (optionnel, pour test manuel)

```bash
# Sur la VM frontend
echo "VOTRE_PAT_TOKEN" | docker login ghcr.io -u VOTRE_USERNAME --password-stdin
```

---

## ✅ Étape 4 : Configurer les Secrets GitHub pour le déploiement

Dans votre repository GitHub → **Settings** → **Secrets and variables** → **Actions**, ajoutez :

### Secrets requis :

1. **`FRONTEND_STAGING_HOST`**
   - Valeur : `51.21.196.104`

2. **`FRONTEND_STAGING_USER`**
   - Valeur : `ubuntu`

3. **`FRONTEND_STAGING_SSH_PRIVATE_KEY`**
   - Valeur : Contenu de `github-actions-key` (clé privée)
   - Pour obtenir : `Get-Content github-actions-key` dans PowerShell

4. **`GHCR_TOKEN`** (si pas déjà créé)
   - Valeur : Personal Access Token GitHub avec `read:packages`

---

## ✅ Étape 5 : Copier la clé SSH sur la VM frontend

Si vous n'avez pas encore copié la clé SSH sur la VM frontend :

```powershell
# Depuis votre machine Windows
cd C:\Users\oumay\projet\hotel-ticket-hub

# Utiliser le script (si vous avez une clé AWS pour la VM frontend)
.\copy-ssh-key.ps1 -HostIP "51.21.196.104" -AWSKey "$HOME\Downloads\oumayma-key.pem" -User "ubuntu"

# Ou manuellement
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104 "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"
```

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
# Vérifier que Docker fonctionne
docker ps

# Vérifier que le répertoire existe
ls -la /opt/hotel-ticket-hub-frontend-staging/

# Tester la connexion SSH depuis votre machine
# (depuis PowerShell)
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'Connexion OK' && hostname"
```

---

## 🚀 Déploiement automatique

Une fois configuré, chaque push vers `develop` déclenchera automatiquement :

1. **Build** : Construction de l'image Docker
2. **Push** : Envoi de l'image vers GitHub Container Registry
3. **Deploy** : Pull de l'image sur la VM et démarrage avec docker-compose

---

## 📝 Commandes utiles

### Sur la VM frontend

```bash
# Voir les conteneurs
docker ps

# Voir les logs
cd /opt/hotel-ticket-hub-frontend-staging
docker compose logs -f

# Redémarrer
docker compose restart

# Arrêter
docker compose down

# Voir les images
docker images

# Nettoyer les images inutilisées
docker image prune -a
```

### Tester depuis votre machine

```bash
# Tester l'endpoint health
curl http://51.21.196.104/health

# Tester l'application
# Ouvrir dans un navigateur : http://51.21.196.104
```

---

## 🔧 Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
docker compose logs

# Vérifier la configuration
docker compose config
```

### Erreur d'authentification GHCR

- Vérifier que `GHCR_TOKEN` est bien configuré dans GitHub
- Vérifier que le token a les permissions `read:packages`
- Tester la connexion manuelle : `docker login ghcr.io`

### Le port n'est pas accessible

- Vérifier les Security Groups AWS (port 80)
- Vérifier que le conteneur écoute : `docker ps`
- Tester localement : `curl http://localhost/health`

### L'API ne se connecte pas

- Vérifier que `VITE_API_BASE_URL` est correcte dans le Dockerfile
- Vérifier que le backend est accessible depuis la VM frontend
- Vérifier les CORS sur le backend

---

## ✅ Checklist finale

- [ ] Docker installé sur la VM frontend
- [ ] Répertoire `/opt/hotel-ticket-hub-frontend-staging` créé
- [ ] Secret `GHCR_TOKEN` configuré dans GitHub
- [ ] Secrets `FRONTEND_STAGING_HOST`, `FRONTEND_STAGING_USER`, `FRONTEND_STAGING_SSH_PRIVATE_KEY` configurés
- [ ] Clé SSH copiée sur la VM frontend
- [ ] Security Groups AWS configurés (port 80 ouvert)
- [ ] Connexion SSH testée depuis votre machine
- [ ] Workflow GitHub Actions modifié avec les jobs Docker

Une fois tout configuré, le déploiement automatique fonctionnera ! 🎉

