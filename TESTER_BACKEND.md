# 🧪 Comment Tester le Backend

## ✅ Le Backend Fonctionne !

Le code 405 "Method Not Allowed" est **normal** : `/api/auth/login` est un endpoint **POST**, pas GET.

## 🧪 Tests Corrects

### Test 1 : Vérifier que le serveur répond (GET)
```bash
# Tester la racine de l'API
curl http://localhost:8081/api

# Ou tester avec une requête POST vide (pour voir l'erreur de validation)
curl -X POST http://localhost:8081/api/auth/login
```

### Test 2 : Tester l'endpoint login avec POST (correct)
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Résultat attendu** : Erreur de validation ou "Email or password incorrect" (pas 405)

### Test 3 : Tester depuis le frontend
Le vrai test est depuis le navigateur :
- Ouvrez : http://51.21.196.104/signup
- Remplissez le formulaire
- Cliquez sur "Créer mon compte"

Si ça fonctionne, le backend répond correctement ! ✅

---

## 📊 Codes HTTP Signification

| Code | Signification | Exemple |
|------|---------------|---------|
| **200** | OK - Succès | Requête réussie |
| **400** | Bad Request | Données invalides |
| **404** | Not Found | Endpoint n'existe pas |
| **405** | Method Not Allowed | **Mauvaise méthode HTTP** (GET au lieu de POST) |
| **500** | Internal Server Error | Erreur serveur |

---

## ✅ Vérification Rapide

Le backend fonctionne si :
- ✅ Le conteneur est en cours d'exécution
- ✅ Les logs montrent "Started TicketHubApplication"
- ✅ Pas d'erreurs dans les logs
- ✅ Le frontend peut se connecter (test depuis le navigateur)

Le 405 que vous avez vu est **normal** - c'est juste que vous avez utilisé GET au lieu de POST.

