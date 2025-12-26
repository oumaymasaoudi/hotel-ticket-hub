# 📧 Configuration des Notifications SonarCloud par Email

## Comment recevoir les rapports SonarCloud par email

### Étape 1 : Configurer les notifications sur SonarCloud

1. **Allez sur SonarCloud** : https://sonarcloud.io
2. **Connectez-vous** avec votre compte GitHub
3. **Allez dans votre profil** :
   - Cliquez sur votre avatar (en haut à droite)
   - Sélectionnez **"My Account"**
4. **Onglet Notifications** :
   - Cliquez sur l'onglet **"Notifications"** dans le menu de gauche
5. **Configurez les notifications** :
   - Cochez **"Email"** pour activer les notifications par email
   - Sélectionnez les événements que vous souhaitez recevoir :
     - ✅ **New Issues** : Recevoir un email quand de nouveaux problèmes sont détectés
     - ✅ **Quality Gate Changes** : Recevoir un email quand le Quality Gate change (Pass/Fail)
     - ✅ **New Security Hotspots** : Recevoir un email pour les nouveaux security hotspots
     - ✅ **Analysis Reports** : Recevoir un email avec le rapport d'analyse complet

### Étape 2 : Configurer les notifications au niveau du projet

1. **Allez sur votre projet** :
   - https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
2. **Allez dans Administration** :
   - Cliquez sur **"Administration"** dans le menu de gauche
3. **Onglet Notifications** :
   - Cliquez sur **"Notifications"**
4. **Configurez les notifications du projet** :
   - Ajoutez des destinataires (emails)
   - Configurez les événements spécifiques au projet

### Étape 3 : Configurer les notifications pour les Pull Requests

1. **Dans l'onglet Notifications du projet**
2. **Section "Pull Requests"** :
   - Activez les notifications pour les PRs
   - Configurez quand recevoir les emails :
     - À chaque analyse
     - Seulement si le Quality Gate échoue
     - Seulement si de nouveaux problèmes sont détectés

### Étape 4 : Vérifier votre email

1. **Vérifiez votre boîte de réception** :
   - Les emails SonarCloud peuvent aller dans les spams
   - Vérifiez le dossier "Spam" ou "Indésirables"
2. **Ajoutez à vos contacts** :
   - Email : `noreply@sonarsource.com`
   - Cela évitera que les emails soient marqués comme spam

## 📊 Types de notifications disponibles

### Quality Gate Notifications
- **Quand** : À chaque analyse sur `main` ou `develop`
- **Contenu** : Statut du Quality Gate (Pass/Fail), métriques principales

### New Issues Notifications
- **Quand** : Quand de nouveaux problèmes sont détectés
- **Contenu** : Liste des nouveaux bugs, code smells, vulnerabilities

### Security Hotspots Notifications
- **Quand** : Quand de nouveaux security hotspots sont détectés
- **Contenu** : Détails des security hotspots à revoir

### Analysis Reports
- **Quand** : Après chaque analyse complète
- **Contenu** : Rapport détaillé avec toutes les métriques

## 🔔 Configuration recommandée

Pour un suivi optimal, configurez :

1. **Notifications personnelles** :
   - ✅ Quality Gate Changes
   - ✅ New Issues (seulement sur main/develop)
   - ✅ New Security Hotspots

2. **Notifications du projet** :
   - ✅ Quality Gate Changes
   - ✅ Analysis Reports (hebdomadaire)

3. **Notifications Pull Requests** :
   - ✅ Quality Gate Status
   - ✅ New Issues

## 📝 Note

Les notifications sont envoyées uniquement pour les analyses sur les branches `main` et `develop` (comme configuré dans le workflow GitHub Actions).

## 🔗 Liens utiles

- **SonarCloud Notifications** : https://sonarcloud.io/account/notifications
- **Projet Frontend** : https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
- **Documentation SonarCloud** : https://docs.sonarcloud.io/

