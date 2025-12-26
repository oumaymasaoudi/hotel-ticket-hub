# 🚀 Commandes Git pour Tester le Pipeline CI/CD et SonarQube

## 📋 Prérequis

Assurez-vous d'avoir :
- Git configuré
- Accès au repository GitHub
- Les secrets GitHub configurés (`SONAR_TOKEN`)

## 🔧 Commandes Git pour Tester le Pipeline

### 1. Vérifier l'état actuel
```bash
# Voir les fichiers modifiés
git status

# Voir la branche actuelle
git branch

# Voir les branches distantes
git branch -a
```

### 2. Préparer les changements
```bash
# Se placer dans le répertoire du projet
cd hotel-ticket-hub

# Ajouter tous les fichiers modifiés
git add .

# Voir ce qui sera commité
git status
```

### 3. Créer un commit
```bash
# Créer un commit avec un message descriptif
git commit -m "test: amélioration des tests et couverture de code"
```

### 4. Tester le pipeline sur la branche `develop` (Recommandé)

```bash
# Basculer sur develop
git checkout develop

# Récupérer les dernières modifications
git pull origin develop

# Fusionner vos changements si nécessaire
git merge main  # ou votre branche de travail

# Pousser vers GitHub (déclenche le pipeline)
git push origin develop
```

### 5. Tester le pipeline sur la branche `main`

```bash
# Basculer sur main
git checkout main

# Récupérer les dernières modifications
git pull origin main

# Fusionner develop si nécessaire
git merge develop

# Pousser vers GitHub (déclenche le pipeline)
git push origin main
```

## 🧪 Tests Locaux Avant de Pousser

### Exécuter tous les tests avec couverture
```bash
cd hotel-ticket-hub
npm test -- --coverage --watchAll=false
```

### Générer le rapport de couverture
```bash
# Les rapports sont générés dans coverage/
# - coverage/lcov.info (pour SonarQube)
# - coverage/lcov-report/index.html (rapport HTML)
npm test -- --coverage --watchAll=false

# Ouvrir le rapport HTML
# Windows:
start coverage/lcov-report/index.html
# Linux/Mac:
open coverage/lcov-report/index.html
```

### Vérifier le lint
```bash
npm run lint
```

### Vérifier TypeScript
```bash
npm run type-check
```

### Tester le build
```bash
npm run build
```

## 📊 Génération de Rapports SonarQube

### 1. Générer le rapport de couverture (requis pour SonarQube)
```bash
cd hotel-ticket-hub
npm test -- --coverage --watchAll=false
```

### 2. Vérifier que le rapport existe
```bash
# Vérifier que coverage/lcov.info existe
ls -lh coverage/lcov.info

# Windows PowerShell:
Test-Path coverage/lcov.info
```

### 3. Analyser avec SonarQube localement (optionnel)

Si vous avez SonarQube en local :
```bash
# Installer SonarScanner
# Windows: choco install sonarscanner-msbuild-net46
# Linux/Mac: brew install sonar-scanner

# Exécuter l'analyse
sonar-scanner \
  -Dsonar.projectKey=oumaymasaoudi_hotel-ticket-hub-frontend \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN
```

### 4. Vérifier la configuration SonarQube
```bash
# Vérifier le fichier de configuration
cat sonar-project.properties
```

## 🔍 Vérifier le Pipeline sur GitHub

### 1. Accéder aux Actions GitHub
```
https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
```

### 2. Vérifier les jobs du pipeline
- ✅ **Lint & Type Check** - Doit passer
- ✅ **Test & Coverage** - Doit passer avec couverture > 50%
- ✅ **Build** - Doit passer
- ✅ **SonarQube Analysis** - S'exécute uniquement sur push vers main/develop

### 3. Voir les logs détaillés
- Cliquez sur le workflow
- Cliquez sur chaque job pour voir les logs
- Vérifiez les erreurs éventuelles

## 📈 Vérifier SonarCloud

### 1. Accéder à SonarCloud
```
https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
```

### 2. Vérifier les métriques
- **Coverage** : Doit être > 50%
- **Code Smells** : Vérifier les problèmes
- **Bugs** : Vérifier les bugs détectés
- **Vulnerabilities** : Vérifier les vulnérabilités

### 3. Télécharger les rapports
- Cliquez sur "Download" pour obtenir le rapport PDF
- Exportez les métriques en CSV si nécessaire

## 🔄 Workflow Complet Recommandé

```bash
# 1. Vérifier l'état
git status
git branch

# 2. Tester localement
cd hotel-ticket-hub
npm test -- --coverage --watchAll=false
npm run lint
npm run type-check
npm run build

# 3. Si tout passe, préparer le commit
git add .
git commit -m "test: amélioration des tests - couverture 100%"

# 4. Récupérer les dernières modifications
git pull origin develop

# 5. Résoudre les conflits si nécessaire
# (éditer les fichiers en conflit)
git add .
git commit -m "merge: résolution des conflits"

# 6. Pousser vers GitHub (déclenche le pipeline)
git push origin develop

# 7. Vérifier sur GitHub Actions
# https://github.com/oumaymasaoudi/hotel-ticket-hub/actions

# 8. Vérifier sur SonarCloud
# https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
```

## 🐛 Dépannage

### Le pipeline échoue sur les tests
```bash
# Vérifier les tests localement
npm test -- --coverage --watchAll=false

# Voir les tests qui échouent
npm test -- --verbose
```

### Le pipeline échoue sur le lint
```bash
# Vérifier le lint localement
npm run lint

# Corriger automatiquement si possible
npm run lint -- --fix
```

### SonarQube ne trouve pas le rapport de couverture
```bash
# Vérifier que le fichier existe
ls -lh coverage/lcov.info

# Régénérer le rapport
npm test -- --coverage --watchAll=false

# Vérifier le contenu du fichier
head coverage/lcov.info
```

### Le pipeline ne se déclenche pas
```bash
# Vérifier que vous êtes sur la bonne branche
git branch

# Vérifier que vous avez bien poussé
git log --oneline -5

# Vérifier les workflows GitHub
# https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
```

## 📝 Commandes Utiles

### Voir l'historique des commits
```bash
git log --oneline -10
```

### Voir les différences avant de commiter
```bash
git diff
git diff --staged
```

### Annuler les modifications non commitées
```bash
git restore .
```

### Annuler le dernier commit (garder les fichiers)
```bash
git reset --soft HEAD~1
```

### Créer une branche pour tester
```bash
# Créer une nouvelle branche
git checkout -b test/pipeline-sonar

# Faire vos modifications et commits
git add .
git commit -m "test: pipeline et sonar"

# Pousser la branche
git push origin test/pipeline-sonar

# Créer une Pull Request sur GitHub
# Le pipeline se déclenchera sur la PR
```

## 🔗 Liens Utiles

- **GitHub Actions** : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
- **SonarCloud** : https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
- **Secrets GitHub** : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions
- **Rapport de couverture local** : `coverage/lcov-report/index.html`

## ⚠️ Notes Importantes

1. **SonarQube Analysis** ne s'exécute que sur push vers `main` ou `develop`
2. Le pipeline vérifie un seuil de couverture de **50%** minimum
3. Les erreurs de navigation JSDOM sont supprimées automatiquement dans les tests
4. Le rapport de couverture doit être généré dans `coverage/lcov.info` pour SonarQube

