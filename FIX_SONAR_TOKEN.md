# 🔧 Correction du problème SONAR_TOKEN

## Problème actuel

Le workflow SonarCloud échoue avec l'erreur :
```
Running this GitHub Action without SONAR_TOKEN is not recommended
Process completed with exit code 3.
```

## Solution : Configurer le secret SONAR_TOKEN

### Étape 1 : Générer un token SonarCloud

1. Allez sur [SonarCloud](https://sonarcloud.io)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur votre avatar (en haut à droite) → **"My Account"**
4. Allez dans l'onglet **"Security"**
5. Dans la section **"Generate Tokens"**, entrez un nom (ex: `github-actions-frontend`)
6. Cliquez sur **"Generate"**
7. **Copiez le token** (vous ne pourrez plus le voir après)

### Étape 2 : Ajouter le secret sur GitHub

1. Allez sur votre repository GitHub :
   ```
   https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
   ```

2. Cliquez sur **"New repository secret"**

3. Configurez :
   - **Name**: `SONAR_TOKEN`
   - **Secret**: Collez le token que vous avez copié à l'étape 1

4. Cliquez sur **"Add secret"**

### Étape 3 : Vérifier que le projet existe sur SonarCloud

Assurez-vous que le projet `oumaymasaoudi_hotel-ticket-hub-frontend` existe sur SonarCloud :

1. Allez sur [SonarCloud](https://sonarcloud.io)
2. Vérifiez que le projet `oumaymasaoudi_hotel-ticket-hub-frontend` apparaît dans vos projets
3. Si le projet n'existe pas, créez-le :
   - Cliquez sur **"+"** → **"Analyze new project"**
   - Sélectionnez l'organisation : `oumaymasaoudi`
   - Sélectionnez le repository : `hotel-ticket-hub`
   - Choisissez **"Create project manually"**
   - **Project Key**: `oumaymasaoudi_hotel-ticket-hub-frontend`
   - **Display Name**: `Hotel Ticket Hub Frontend`

### Étape 4 : Tester

1. Poussez un commit sur `develop` ou `main`
2. Le workflow SonarCloud devrait maintenant fonctionner
3. Vérifiez les résultats sur :
   ```
   https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
   ```

## ✅ Corrections apportées

1. **Security Hotspot corrigé** : Utilisation de `@2.1.1` au lieu de `@master`
2. **Vérification ajoutée** : Le workflow vérifie maintenant si `SONAR_TOKEN` est configuré avant d'exécuter l'analyse

## 📝 Note

Le workflow est configuré avec `continue-on-error: true`, donc même si SonarCloud échoue, le pipeline continuera. Cependant, pour que SonarCloud fonctionne correctement, vous devez configurer le secret `SONAR_TOKEN`.

