# 🔧 Commandes Git pour Tester le Pipeline CI/CD

## 📋 Commandes de Base

### 1. Vérifier l'état actuel
```bash
git status
```

### 2. Voir sur quelle branche vous êtes
```bash
git branch
```

### 3. Voir les branches distantes
```bash
git branch -a
```

## 🚀 Tester le Pipeline CI/CD

### Option 1 : Pousser sur `develop` (Recommandé)

```bash
# 1. S'assurer d'être sur la branche develop
git checkout develop

# 2. Récupérer les dernières modifications du remote
git pull origin develop

# 3. Ajouter tous les fichiers modifiés
git add .

# 4. Créer un commit
git commit -m "test: pipeline CI/CD avec SonarCloud et couverture"

# 5. Pousser vers GitHub (déclenche le pipeline)
git push origin develop
```

### Option 2 : Pousser sur `main`

```bash
# 1. Basculer sur main
git checkout main

# 2. Récupérer les dernières modifications
git pull origin main

# 3. Fusionner develop dans main (si nécessaire)
git merge develop

# 4. Ajouter les fichiers
git add .

# 5. Créer un commit
git commit -m "test: pipeline CI/CD avec SonarCloud et couverture"

# 6. Pousser vers GitHub
git push origin main
```

## 🔄 Si vous avez des conflits

### Récupérer les changements distants
```bash
# Récupérer sans fusionner
git fetch origin

# Voir les différences
git diff develop origin/develop

# Fusionner les changements distants
git pull origin develop --no-edit
```

### Résoudre les conflits
```bash
# Après git pull, si conflits :
# 1. Résoudre les conflits dans les fichiers
# 2. Ajouter les fichiers résolus
git add .

# 3. Finaliser la fusion
git commit -m "merge: résolution des conflits"

# 4. Pousser
git push origin develop
```

## 📊 Vérifier le Pipeline

### Après avoir poussé

1. **GitHub Actions** :
   - Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
   - Cliquez sur le dernier workflow
   - Vérifiez les jobs :
     - ✅ Lint & Type Check
     - ✅ Test & Coverage
     - ✅ Build
     - ✅ Frontend - SonarQube Analysis

2. **SonarCloud** :
   - Allez sur : https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
   - Vérifiez l'analyse complète

## 🧪 Tester Localement Avant de Pousser

### Tester les tests unitaires
```bash
cd hotel-ticket-hub
npm test
```

### Tester avec couverture
```bash
cd hotel-ticket-hub
npm test -- --coverage --watchAll=false
```

### Tester le lint
```bash
cd hotel-ticket-hub
npm run lint
```

### Tester le build
```bash
cd hotel-ticket-hub
npm run build
```

### Tester TypeScript
```bash
cd hotel-ticket-hub
npm run type-check
```

## 📝 Commandes Utiles

### Voir l'historique des commits
```bash
git log --oneline -10
```

### Voir les différences avant de commiter
```bash
git diff
```

### Annuler les modifications non commitées
```bash
git restore .
```

### Annuler le dernier commit (garder les fichiers)
```bash
git reset --soft HEAD~1
```

### Voir les fichiers modifiés
```bash
git status --short
```

## ⚠️ Commandes à Éviter

❌ **NE PAS utiliser** :
- `git push --force` (sauf si vraiment nécessaire)
- `git push origin develop --force` (peut écraser le travail d'autres personnes)

✅ **Utiliser à la place** :
- `git pull` puis résoudre les conflits
- `git merge` pour fusionner proprement

## 🎯 Workflow Recommandé

```bash
# 1. Vérifier l'état
git status

# 2. Récupérer les dernières modifications
git pull origin develop

# 3. Tester localement
cd hotel-ticket-hub
npm test
npm run lint
npm run build

# 4. Si tout passe, ajouter et commiter
git add .
git commit -m "feat: description des changements"

# 5. Pousser (déclenche le pipeline)
git push origin develop

# 6. Vérifier sur GitHub Actions
# https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
```

## 🔗 Liens Utiles

- **GitHub Actions** : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions
- **SonarCloud** : https://sonarcloud.io/project/overview?id=oumaymasaoudi_hotel-ticket-hub-frontend
- **Secrets GitHub** : https://github.com/oumaymasaoudi/hotel-ticket-hub/settings/secrets/actions

