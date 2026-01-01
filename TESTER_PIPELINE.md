# ✅ Tester le Pipeline GitHub Actions

## 🎯 Tous les secrets sont configurés !

Vous avez maintenant :
- ✅ `FRONTEND_STAGING_HOST`
- ✅ `FRONTEND_STAGING_USER`
- ✅ `FRONTEND_STAGING_SSH_PRIVATE_KEY`
- ✅ `GHCR_TOKEN`
- ✅ `VITE_API_BASE_URL`
- ✅ `SONAR_TOKEN`

---

## 🚀 Prochaines Étapes : Tester le Pipeline

### Étape 1 : Vérifier que vous êtes sur la branche `develop`

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
git branch
```

Vous devez voir `* develop` (avec une étoile)

Si vous êtes sur une autre branche :
```powershell
git checkout develop
```

---

### Étape 2 : Faire un commit (même petit)

```powershell
# Créer un fichier de test ou modifier un fichier existant
# Par exemple, ajouter un commentaire dans un fichier

# Ajouter les changements
git add .

# Faire un commit
git commit -m "test: vérification du pipeline CI/CD"

# Pousser sur GitHub
git push origin develop
```

---

### Étape 3 : Vérifier le Pipeline

1. Allez sur : https://github.com/oumaymasaoudi/hotel-ticket-hub/actions

2. Vous devriez voir un nouveau workflow en cours d'exécution (icône jaune/orange)

3. Cliquez sur le workflow pour voir les détails

4. Le pipeline doit passer ces étapes :
   - ✅ Lint & Type Check
   - ✅ Build & Test
   - ✅ SonarQube Analysis
   - ✅ Docker Build & Push
   - ✅ Deploy to staging VM

---

### Étape 4 : Vérifier le Déploiement

Si le pipeline réussit, vérifiez que l'application est déployée :

1. **Frontend** : http://51.21.196.104
   - Doit afficher l'application React

2. **Health Check** : http://51.21.196.104/health
   - Doit retourner `{"status":"ok"}`

---

## ⚠️ Si le Pipeline Échoue

### Erreur SSH
- Vérifiez que `FRONTEND_STAGING_SSH_PRIVATE_KEY` contient la clé privée complète
- Vérifiez que la clé publique correspondante est sur la VM

### Erreur GHCR
- Vérifiez que `GHCR_TOKEN` est correct
- Vérifiez que le token a les permissions `read:packages`

### Erreur de Build
- Vérifiez les logs du pipeline pour voir l'erreur exacte

---

## 📋 Checklist Finale

- [ ] Tous les secrets sont configurés ✅
- [ ] Commit et push sur `develop`
- [ ] Pipeline GitHub Actions se déclenche
- [ ] Pipeline passe toutes les étapes
- [ ] Application accessible sur http://51.21.196.104
- [ ] Health check fonctionne

---

## 🎉 Si Tout Fonctionne

Félicitations ! Votre pipeline CI/CD est opérationnel. Chaque push sur `develop` déploiera automatiquement votre application frontend sur la VM de staging.

