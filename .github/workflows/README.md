# 🔄 Frontend CI/CD Workflow

Ce fichier contient le workflow CI/CD pour le projet frontend.

## 📍 Emplacement

Le fichier est dans : `hotel-ticket-hub/.github/workflows/ci.yml`

## ⚠️ Important pour GitHub Actions

**GitHub Actions ne détecte automatiquement que les workflows dans `.github/workflows/` à la racine du repository.**

Pour que ce workflow fonctionne, vous devez :

### Option 1 : Copier à la racine (Recommandé)
Copier ce fichier vers `.github/workflows/frontend-ci.yml` à la racine du projet.

### Option 2 : Utiliser un workflow à la racine
Le fichier `.github/workflows/frontend-ci.yml` à la racine utilise déjà ce workflow.

## 🚀 Utilisation Locale

Vous pouvez aussi utiliser ce fichier comme référence pour :
- Configuration CI/CD locale
- Documentation du pipeline
- Migration vers d'autres systèmes CI/CD

## 📋 Contenu du Workflow

1. **Lint** - ESLint + TypeScript type check
2. **Tests** - Jest avec couverture
3. **Build** - Build Vite de production
4. **SonarQube** - Analyse qualité du code

