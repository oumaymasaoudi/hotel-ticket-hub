# Configuration SonarCloud pour le Frontend

## Problème actuel

Le projet `oumaymasaoudi_hotel-ticket-hub-frontend` n'existe pas encore sur SonarCloud.

## Solution 1 : Créer le projet manuellement (Recommandé)

1. Allez sur [SonarCloud](https://sonarcloud.io)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"+"** → **"Analyze new project"**
4. Sélectionnez votre organisation : `oumaymasaoudi`
5. Sélectionnez le repository : `hotel-ticket-hub`
6. Choisissez **"Create project manually"**
7. Configurez :
   - **Project Key**: `oumaymasaoudi_hotel-ticket-hub-frontend`
   - **Display Name**: `Hotel Ticket Hub Frontend`
   - **Main Branch**: `develop` ou `main`

## Solution 2 : Vérifier les secrets GitHub

Assurez-vous que les secrets suivants sont configurés sur GitHub :

1. Allez sur : `https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions`

2. Vérifiez que ces secrets existent :
   - `SONAR_TOKEN` : Token généré sur SonarCloud
     - Allez sur SonarCloud → My Account → Security → Generate Token
     - Copiez le token et ajoutez-le comme secret GitHub

## Vérification

Après avoir créé le projet et configuré les secrets :

1. Poussez un commit sur `develop` ou `main`
2. Le workflow SonarCloud devrait maintenant fonctionner
3. Vérifiez les résultats sur : `https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend`

## Configuration actuelle

- **Project Key**: `oumaymasaoudi_hotel-ticket-hub-frontend`
- **Organization**: `oumaymasaoudi`
- **Host URL**: `https://sonarcloud.io`
- **Fichier de config**: `hotel-ticket-hub/sonar-project.properties`

