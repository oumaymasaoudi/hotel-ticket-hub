# Guide CI/CD Frontend

## 🚀 Pipeline GitHub Actions

Le pipeline CI/CD est configuré dans `.github/workflows/frontend-ci.yml` à la racine du repository.

### Jobs du Pipeline

1. **Lint & Type Check** - Vérifie ESLint et TypeScript
2. **Unit Tests & Coverage** - Exécute les tests avec couverture de code
3. **Build** - Compile l'application en mode production
4. **SonarQube Analysis** - Analyse la qualité du code (uniquement sur push vers main/develop)

### Déclenchement

Le pipeline se déclenche automatiquement sur :
- Push vers `main` ou `develop`
- Pull Request vers `main` ou `develop`
- Modifications dans `hotel-ticket-hub/**`

### Secrets GitHub Requis

Pour que le pipeline fonctionne complètement, configurez ces secrets dans GitHub :

- `SONAR_TOKEN` - Token SonarQube
- `SONAR_HOST_URL` - URL du serveur SonarQube (ex: https://sonarcloud.io)
- `VITE_API_BASE_URL` - URL de l'API backend (optionnel, défaut: http://localhost:8080/api)
- `CODECOV_TOKEN` - Token Codecov (optionnel, pour l'upload de coverage)

### Tests Locaux

```bash
# Installer les dépendances
cd hotel-ticket-hub
npm install

# Lancer les tests
npm test

# Tests avec couverture
npm test -- --coverage

# Linter
npm run lint

# Type check
npm run type-check

# Build
npm run build
```

### Configuration SonarQube

Le fichier `sonar-project.properties` est configuré pour :
- Exclure `node_modules`, `dist`, et les fichiers de définition TypeScript
- Inclure les fichiers de test (`*.test.ts`, `*.test.tsx`)
- Utiliser le rapport de couverture `coverage/lcov.info`

### Seuil de Couverture

Le seuil minimum de couverture est fixé à **50%** pour :
- Branches
- Functions
- Lines
- Statements

Ce seuil est défini dans `jest.config.js` et vérifié dans le pipeline CI/CD.

