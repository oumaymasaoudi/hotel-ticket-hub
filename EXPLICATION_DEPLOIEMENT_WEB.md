# 🌐 Explication : Déploiement sur VM AWS et Accès Web

## 🤔 Votre Question

> "Le déploiement est sur les VMs AWS, pourquoi on a un lien sur le web ?"

## ✅ Réponse Simple

**Les VMs AWS ont des adresses IP publiques accessibles depuis Internet !**

---

## 🏗️ Architecture Complète

### 1. Les VMs AWS sont des Serveurs

```
┌─────────────────────────────────────────┐
│         INTERNET (Le Web)               │
└─────────────────────────────────────────┘
                    │
                    │ HTTP Request
                    │ http://51.21.196.104
                    ▼
┌─────────────────────────────────────────┐
│      AWS Cloud (eu-north-1)            │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │  VM Frontend (EC2 Instance)       │ │
│  │  IP Publique: 51.21.196.104       │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  Docker Container            │ │ │
│  │  │  Nginx écoute sur port 80    │ │ │
│  │  │  → http://51.21.196.104     │ │ │
│  │  └──────────────────────────────┘ │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │  VM Backend (EC2 Instance)      │ │
│  │  IP Publique: 13.49.44.219       │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  Docker Container            │ │ │
│  │  │  Spring Boot écoute port 8081│ │ │
│  │  │  → http://13.49.44.219:8081 │ │ │
│  │  └──────────────────────────────┘ │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │  VM Database (EC2 Instance)       │ │
│  │  IP Publique: 13.61.27.43        │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │  PostgreSQL écoute port 5432│ │ │
│  │  │  → 13.61.27.43:5432          │ │ │
│  │  └──────────────────────────────┘ │ │
│  └──────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔍 Explication Détaillée

### 1. Les VMs AWS sont Accessibles depuis Internet

Quand vous créez une VM EC2 sur AWS :
- ✅ AWS lui assigne une **IP publique** (ex: `51.21.196.104`)
- ✅ Cette IP est **routable sur Internet**
- ✅ N'importe qui peut y accéder (si les Security Groups le permettent)

### 2. Votre Application Écoute sur un Port

Sur la VM Frontend :
```bash
# Docker container écoute sur le port 80
docker ps
# → hotel-ticket-hub-frontend-staging
# → Port mapping: 0.0.0.0:80->80/tcp
```

Cela signifie :
- Le conteneur écoute sur le **port 80** (port HTTP standard)
- Il est accessible depuis **toutes les interfaces** (`0.0.0.0`)
- Donc accessible depuis Internet via l'IP publique

### 3. Le Navigateur se Connecte à la VM

Quand vous tapez `http://51.21.196.104` dans votre navigateur :

```
1. Votre navigateur → DNS lookup (si domaine) ou connexion directe à l'IP
2. Connexion TCP/IP à 51.21.196.104:80
3. AWS route la requête vers votre VM
4. Le Security Group vérifie les règles (port 80 autorisé ?)
5. La requête arrive sur la VM
6. Docker/Nginx reçoit la requête sur le port 80
7. Nginx sert les fichiers HTML/CSS/JS du frontend
8. Réponse envoyée à votre navigateur
9. Vous voyez l'application !
```

---

## 🔐 Sécurité : Security Groups AWS

Les Security Groups sont des **pare-feu** qui contrôlent qui peut accéder :

```
Security Group Frontend:
┌─────────────────────────────────────┐
│ Inbound Rules:                      │
│ - HTTP (port 80) depuis 0.0.0.0/0  │ ← Tout le monde peut accéder
│ - SSH (port 22) depuis votre IP     │ ← Seulement vous pour SSH
└─────────────────────────────────────┘

Security Group Backend:
┌─────────────────────────────────────┐
│ Inbound Rules:                      │
│ - Port 8081 depuis 0.0.0.0/0        │ ← API accessible publiquement
│ - SSH (port 22) depuis votre IP     │
└─────────────────────────────────────┘

Security Group Database:
┌─────────────────────────────────────┐
│ Inbound Rules:                      │
│ - PostgreSQL (5432) depuis          │
│   13.49.44.219/32                   │ ← Seulement le backend !
└─────────────────────────────────────┘
```

---

## 🌍 Analogie Simple

Imaginez votre VM AWS comme une **maison avec une adresse publique** :

- **IP Publique** (`51.21.196.104`) = Adresse de la maison
- **Port 80** = Numéro de la porte d'entrée (porte HTTP)
- **Docker Container** = Les habitants (votre application)
- **Security Group** = Le gardien qui vérifie qui peut entrer
- **Internet** = La route publique qui mène à votre maison

Quand quelqu'un tape `http://51.21.196.104` :
- Il va à l'adresse `51.21.196.104`
- Il frappe à la porte `80` (HTTP)
- Le gardien (Security Group) vérifie : "OK, port 80 autorisé"
- Les habitants (Nginx) ouvrent et servent l'application

---

## 📊 Flux Complet d'une Requête

### Exemple : Inscription Utilisateur

```
1. Utilisateur tape dans le navigateur :
   http://51.21.196.104/signup
   
2. Navigateur → Internet → AWS → VM Frontend (51.21.196.104:80)
   ✅ Security Group autorise HTTP depuis 0.0.0.0/0
   ✅ Nginx sert la page React
   
3. Utilisateur remplit le formulaire et clique "Créer un compte"
   
4. Frontend fait un appel API :
   POST http://13.49.44.219:8081/api/auth/register
   
5. Navigateur → Internet → AWS → VM Backend (13.49.44.219:8081)
   ✅ Security Group autorise port 8081 depuis 0.0.0.0/0
   ✅ Spring Boot reçoit la requête
   ✅ CORS vérifie l'origine (http://51.21.196.104 autorisé ?)
   ✅ Traitement de l'inscription
   
6. Backend a besoin de la base de données :
   Connexion à 13.61.27.43:5432
   
7. VM Backend → VM Database (13.61.27.43:5432)
   ✅ Security Group autorise PostgreSQL depuis 13.49.44.219/32
   ✅ PostgreSQL traite la requête
   
8. Réponse remonte : Database → Backend → Frontend → Navigateur
   
9. Utilisateur voit "Compte créé avec succès !" ✅
```

---

## 🎯 Points Clés

1. **Les VMs AWS sont des serveurs accessibles depuis Internet**
   - Elles ont des IPs publiques
   - Elles sont sur Internet, pas dans un réseau privé isolé

2. **Les applications écoutent sur des ports**
   - Port 80 = HTTP (web)
   - Port 8081 = API Backend
   - Port 5432 = PostgreSQL

3. **Les Security Groups contrôlent l'accès**
   - Qui peut accéder à quel port
   - Depuis quelles IPs

4. **Docker expose les ports**
   - `docker compose` mappe les ports du conteneur vers la VM
   - `0.0.0.0:80->80` = accessible depuis n'importe où sur le port 80

---

## ✅ Résumé

**Pourquoi un lien web fonctionne ?**

Parce que :
- ✅ Votre VM a une IP publique (`51.21.196.104`)
- ✅ Votre application écoute sur le port 80 (HTTP)
- ✅ Le Security Group autorise le trafic HTTP depuis Internet
- ✅ Docker expose le port 80 de la VM
- ✅ Nginx sert votre application React

**C'est comme avoir un serveur web classique, mais dans le cloud AWS !**

---

## 🔒 Sécurité

⚠️ **Important** : Vos VMs sont accessibles publiquement. Assurez-vous que :
- ✅ Les Security Groups sont bien configurés
- ✅ Seuls les ports nécessaires sont ouverts
- ✅ Les mots de passe sont forts
- ✅ Les clés SSH sont sécurisées

