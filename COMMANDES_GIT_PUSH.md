# 📤 Commandes Git pour Push des Améliorations

## 🎯 **Résumé des Changements**

### **Backend** (hotel-ticket-hub-backend)
- ✅ Gestion d'erreurs améliorée
- ✅ Configuration email pour production
- ✅ Rate limiting
- ✅ Pagination
- ✅ Documentation API (Swagger)
- ✅ Validation renforcée des fichiers
- ✅ Suppression d'images

### **Frontend** (hotel-ticket-hub)
- ✅ Header et footer toujours visibles
- ✅ Suppression d'images
- ✅ Corrections SonarQube (0 warnings)
- ✅ Dockerfile avec utilisateur non-root

---

## 🚀 **COMMANDES GIT - BACKEND**

```bash
# Se placer dans le répertoire backend
cd hotel-ticket-hub-backend

# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add .

# Ou ajouter fichier par fichier (optionnel)
git add src/main/java/com/hotel/tickethub/service/EmailService.java
git add src/main/java/com/hotel/tickethub/service/TicketService.java
git add src/main/java/com/hotel/tickethub/controller/GlobalExceptionHandler.java
git add src/main/java/com/hotel/tickethub/controller/TicketController.java
git add src/main/java/com/hotel/tickethub/repository/TicketRepository.java
git add src/main/java/com/hotel/tickethub/config/SecurityConfig.java
git add src/main/java/com/hotel/tickethub/config/OpenApiConfig.java
git add src/main/java/com/hotel/tickethub/config/RateLimitConfig.java
git add src/main/java/com/hotel/tickethub/filter/RateLimitFilter.java
git add src/main/java/com/hotel/tickethub/dto/PageResponse.java
git add src/main/resources/application.properties
git add pom.xml
git add optimize-database.sql

# Commit avec message descriptif
git commit -m "feat: complete all improvements - email, security, performance, documentation

- Add email service with Spring Mail support
- Add rate limiting (100 req/min per IP)
- Add server-side pagination support
- Add Swagger/OpenAPI documentation
- Improve error handling with specific HTTP codes
- Add image deletion functionality
- Add file validation (MIME, size, extension)
- Add database optimization script with indexes"

# Pousser vers la branche develop
git push origin develop

# Ou si vous êtes sur main
git push origin main
```

---

## 🚀 **COMMANDES GIT - FRONTEND**

```bash
# Se placer dans le répertoire frontend
cd hotel-ticket-hub

# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add .

# Ou ajouter fichier par fichier (optionnel)
git add src/components/layout/AppFooter.tsx
git add src/components/layout/DashboardLayout.tsx
git add src/components/layout/PublicHeader.tsx
git add src/components/tickets/TicketImageUpload.tsx
git add src/services/apiService.ts
git add src/pages/*.tsx
git add Dockerfile
git add nginx.conf
git add docker-compose.yml
git add sonar-project.properties

# Commit avec message descriptif
git commit -m "feat: add header/footer always visible, image deletion, fix SonarQube warnings

- Add AppFooter component (always visible)
- Make header sticky/fixed on all pages
- Add image deletion functionality
- Fix SonarQube warnings (0 issues):
  - Use non-root nginx user (port 8080)
  - Ignore npm dependency SHA warnings
  - Ignore GitHub Actions SHA warnings
- Update Docker configuration for security"

# Pousser vers la branche develop
git push origin develop

# Ou si vous êtes sur main
git push origin main
```

---

## 📋 **COMMANDES COMPLÈTES (Copier-Coller)**

### **Option 1 : Push Rapide (Tous les fichiers)**

#### Backend
```bash
cd hotel-ticket-hub-backend
git add .
git commit -m "feat: complete all improvements - email, security, performance, documentation"
git push origin develop
```

#### Frontend
```bash
cd hotel-ticket-hub
git add .
git commit -m "feat: add header/footer always visible, image deletion, fix SonarQube warnings"
git push origin develop
```

---

### **Option 2 : Push avec Vérification**

#### Backend
```bash
cd hotel-ticket-hub-backend
git status
git add .
git status
git commit -m "feat: complete all improvements - email, security, performance, documentation"
git log --oneline -1
git push origin develop
```

#### Frontend
```bash
cd hotel-ticket-hub
git status
git add .
git status
git commit -m "feat: add header/footer always visible, image deletion, fix SonarQube warnings"
git log --oneline -1
git push origin develop
```

---

## 🔍 **VÉRIFICATIONS AVANT PUSH**

### **Vérifier les fichiers à committer**
```bash
git status
```

### **Voir les différences**
```bash
git diff --staged
```

### **Voir l'historique récent**
```bash
git log --oneline -5
```

### **Vérifier la branche actuelle**
```bash
git branch
```

---

## ⚠️ **EN CAS D'ERREUR**

### **Si le push est rejeté (conflits)**
```bash
# Récupérer les dernières modifications
git pull origin develop

# Résoudre les conflits si nécessaire
# Puis recommiter
git add .
git commit -m "merge: resolve conflicts"
git push origin develop
```

### **Annuler le dernier commit (si erreur)**
```bash
# Annuler le commit mais garder les changements
git reset --soft HEAD~1

# Ou annuler complètement
git reset --hard HEAD~1
```

### **Voir les remotes**
```bash
git remote -v
```

---

## ✅ **APRÈS LE PUSH**

### **Vérifier que le push a réussi**
```bash
git log --oneline -1
git status
```

### **Vérifier sur GitHub**
- Allez sur votre repository GitHub
- Vérifiez que les commits apparaissent
- Vérifiez que les pipelines CI/CD se déclenchent

---

## 📝 **RÉSUMÉ DES COMMITS**

### **Backend**
```
feat: complete all improvements - email, security, performance, documentation
```

### **Frontend**
```
feat: add header/footer always visible, image deletion, fix SonarQube warnings
```

---

## 🎯 **COMMANDES RAPIDES (Copier-Coller)**

### **Backend**
```bash
cd hotel-ticket-hub-backend && git add . && git commit -m "feat: complete all improvements - email, security, performance, documentation" && git push origin develop
```

### **Frontend**
```bash
cd hotel-ticket-hub && git add . && git commit -m "feat: add header/footer always visible, image deletion, fix SonarQube warnings" && git push origin develop
```

---

**✅ Prêt à pousser !** 🚀

