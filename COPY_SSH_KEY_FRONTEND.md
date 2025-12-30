# 🔐 Copier la clé SSH sur la VM frontend

## 📍 Le script est dans hotel-ticket-hub-backend

Le script `copy-ssh-key.ps1` se trouve dans le répertoire `hotel-ticket-hub-backend`, pas dans `hotel-ticket-hub`.

## ✅ Solution : Exécuter depuis le bon répertoire

```powershell
# Aller dans le répertoire backend où se trouve le script
cd C:\Users\oumay\projet\hotel-ticket-hub-backend

# Exécuter le script pour la VM frontend
.\copy-ssh-key.ps1 -HostIP "51.21.196.104" -AWSKey "$HOME\Downloads\oumayma-key.pem" -User "ubuntu"
```

## 🔄 Alternative : Copier le script dans hotel-ticket-hub

Si vous préférez avoir le script dans les deux répertoires :

```powershell
# Copier le script
Copy-Item C:\Users\oumay\projet\hotel-ticket-hub-backend\copy-ssh-key.ps1 C:\Users\oumay\projet\hotel-ticket-hub\
Copy-Item C:\Users\oumay\projet\hotel-ticket-hub-backend\github-actions-key* C:\Users\oumay\projet\hotel-ticket-hub\

# Puis exécuter depuis hotel-ticket-hub
cd C:\Users\oumay\projet\hotel-ticket-hub
.\copy-ssh-key.ps1 -HostIP "51.21.196.104" -AWSKey "$HOME\Downloads\oumayma-key.pem" -User "ubuntu"
```

## 📝 Commande manuelle (sans script)

Si vous préférez faire manuellement :

```powershell
# Aller dans le répertoire backend
cd C:\Users\oumay\projet\hotel-ticket-hub-backend

# Lire la clé publique
$publicKey = Get-Content github-actions-key.pub -Raw
$publicKey = $publicKey.Trim()

# Copier sur la VM frontend
ssh -i "$HOME\Downloads\oumayma-key.pem" ubuntu@51.21.196.104 "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh && echo 'Cle ajoutee avec succes!'"
```

## ✅ Tester la connexion

Après avoir copié la clé :

```powershell
# Depuis hotel-ticket-hub-backend
cd C:\Users\oumay\projet\hotel-ticket-hub-backend
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'Connexion OK' && hostname"
```

Si ça fonctionne sans mot de passe, c'est bon ! ✅

