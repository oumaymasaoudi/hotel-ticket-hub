# 🔧 SOLUTION - Catégories et Techniciens Manquants

## 🎯 **Problèmes Identifiés**

1. ❌ **Aucune catégorie disponible** dans la création de tickets et l'inscription
2. ❌ **Aucun technicien trouvé** dans la gestion des techniciens (Admin Dashboard)

---

## ✅ **SOLUTION 1 : Créer les Catégories dans la Base de Données**

### **Problème**
Les catégories n'existent pas dans la base de données PostgreSQL. Le script SQL existe mais n'a pas été exécuté.

### **Solution : Exécuter le Script SQL**

#### **Option A : Via SSH sur la VM Backend**

```bash
# 1. Se connecter à la VM backend
ssh -i ~/.ssh/github-actions-key ubuntu@13.49.44.219

# 2. Se connecter à PostgreSQL
sudo -u postgres psql -d hotel_ticket_hub

# 3. Exécuter le script
\i /chemin/vers/create-default-categories.sql

# OU copier-coller le contenu du script directement :
```

#### **Option B : Copier le Script et l'Exécuter**

```sql
-- Script pour créer les catégories par défaut
INSERT INTO categories (id, name, icon, color, is_mandatory, additional_cost, created_at)
VALUES 
    (gen_random_uuid(), 'Électricité', 'Zap', '#FFD700', false, 0.00, NOW()),
    (gen_random_uuid(), 'Plomberie', 'Droplet', '#1E90FF', false, 0.00, NOW()),
    (gen_random_uuid(), 'Climatisation / Chauffage', 'Snowflake', '#00CED1', false, 0.00, NOW()),
    (gen_random_uuid(), 'Internet / WiFi', 'Wifi', '#32CD32', false, 0.00, NOW()),
    (gen_random_uuid(), 'Serrurerie', 'Key', '#FF6347', false, 0.00, NOW()),
    (gen_random_uuid(), 'Chambre', 'BedDouble', '#9370DB', false, 0.00, NOW()),
    (gen_random_uuid(), 'Salle de bain', 'Bath', '#20B2AA', false, 0.00, NOW()),
    (gen_random_uuid(), 'Son / Audio', 'Volume2', '#FF69B4', false, 0.00, NOW()),
    (gen_random_uuid(), 'Ménage / Nettoyage', 'Sparkles', '#FFA500', false, 0.00, NOW()),
    (gen_random_uuid(), 'Sécurité', 'Shield', '#DC143C', false, 0.00, NOW()),
    (gen_random_uuid(), 'Restauration', 'UtensilsCrossed', '#FF8C00', false, 0.00, NOW()),
    (gen_random_uuid(), 'Autre', 'Package', '#6C757D', false, 0.00, NOW())
ON CONFLICT DO NOTHING;

-- Vérifier les catégories créées
SELECT id, name, icon, color FROM categories ORDER BY name;
```

#### **Option C : Via SuperAdmin Dashboard (Recommandé)**

1. Connectez-vous en tant que **SuperAdmin**
2. Allez dans **"Catégories"** → **"Créer une catégorie"**
3. Créez les catégories manuellement ou utilisez le script SQL ci-dessus

---

## ✅ **SOLUTION 2 : Vérifier et Créer des Techniciens**

### **Problème**
Il n'y a pas de techniciens associés à l'hôtel dans la base de données.

### **Causes Possibles**

1. **Aucun technicien créé** : Personne ne s'est inscrit en tant que technicien
2. **Techniciens non associés à l'hôtel** : Les techniciens existent mais ne sont pas liés à cet hôtel
3. **Erreur API** : Le backend ne répond pas correctement

### **Solutions**

#### **Option A : Créer un Technicien via Inscription**

1. Allez sur la page **"Inscription"** (`/signup`)
2. Remplissez le formulaire avec :
   - **Rôle** : `Technicien`
   - **Catégories** : Sélectionnez les spécialités (après avoir créé les catégories)
   - **Email, Mot de passe, Nom, Téléphone**
3. Cliquez sur **"S'inscrire"**

#### **Option B : Vérifier les Techniciens dans la Base de Données**

```sql
-- Se connecter à PostgreSQL
sudo -u postgres psql -d hotel_ticket_hub

-- Vérifier tous les techniciens
SELECT u.id, u.email, u.full_name, u.role, u.hotel_id, h.name as hotel_name
FROM users u
LEFT JOIN hotels h ON u.hotel_id = h.id
WHERE u.role = 'TECHNICIAN'
ORDER BY u.created_at DESC;

-- Vérifier les techniciens pour un hôtel spécifique
SELECT u.id, u.email, u.full_name, u.role
FROM users u
WHERE u.role = 'TECHNICIAN' 
  AND (u.hotel_id = 'bfaab0ae-dd49-4bbe-8490-8363d5ed6459' OR u.hotel_id IS NULL);
```

**Note** : Les techniciens peuvent avoir `hotel_id = NULL` car ils travaillent pour **tous les hôtels**.

#### **Option C : Vérifier l'Endpoint API**

Testez l'endpoint directement :

```bash
# Sur la VM backend ou en local
curl -X GET "http://13.49.44.219:8081/api/users/hotel/bfaab0ae-dd49-4bbe-8490-8363d5ed6459/technicians" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 🔍 **VÉRIFICATIONS**

### **1. Vérifier que les Catégories sont Créées**

```sql
SELECT COUNT(*) FROM categories;
-- Doit retourner au moins 12 catégories
```

### **2. Vérifier que le Backend Répond**

```bash
# Tester l'endpoint des catégories (public, pas besoin d'auth)
curl http://13.49.44.219:8081/api/categories/public

# Doit retourner un JSON avec les catégories
```

### **3. Vérifier les Logs du Backend**

```bash
# Sur la VM backend
docker compose logs backend --tail=50

# Chercher les erreurs liées aux catégories ou techniciens
```

### **4. Vérifier les Logs du Frontend (Console Browser)**

Ouvrez la console du navigateur (F12) et vérifiez :
- ❌ Erreurs `ERR_CONNECTION_REFUSED` → Backend non démarré
- ❌ Erreurs `401 Unauthorized` → Problème d'authentification
- ❌ Erreurs `404 Not Found` → Endpoint incorrect
- ❌ Erreurs `500 Internal Server Error` → Erreur serveur

---

## 📋 **CHECKLIST DE RÉSOLUTION**

- [ ] **Catégories créées** : Exécuter `create-default-categories.sql` ou créer via SuperAdmin
- [ ] **Backend démarré** : Vérifier que le backend tourne sur le port 8081
- [ ] **Base de données accessible** : Vérifier la connexion PostgreSQL
- [ ] **Techniciens créés** : Au moins un technicien inscrit pour l'hôtel
- [ ] **API fonctionnelle** : Tester `/api/categories/public` et `/api/users/hotel/{id}/technicians`
- [ ] **Cache navigateur vidé** : Faire un hard refresh (Ctrl+Shift+R)

---

## 🚀 **COMMANDES RAPIDES**

### **Créer les Catégories (SSH sur VM Backend)**

```bash
# 1. Se connecter
ssh -i ~/.ssh/github-actions-key ubuntu@13.49.44.219

# 2. Exécuter le script SQL
sudo -u postgres psql -d hotel_ticket_hub -f /chemin/vers/create-default-categories.sql

# OU copier-coller le contenu SQL directement dans psql
sudo -u postgres psql -d hotel_ticket_hub
# Puis coller le script SQL
```

### **Vérifier les Catégories**

```bash
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT name, icon, color FROM categories ORDER BY name;"
```

### **Vérifier les Techniciens**

```bash
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT email, full_name, role FROM users WHERE role = 'TECHNICIAN';"
```

---

## ⚠️ **IMPORTANT**

1. **Les catégories doivent être créées AVANT** de pouvoir créer des tickets ou s'inscrire comme technicien
2. **Les techniciens peuvent travailler pour TOUS les hôtels** (hotel_id peut être NULL)
3. **Le backend doit être démarré** pour que les API fonctionnent
4. **Vider le cache du navigateur** après avoir créé les catégories

---

**Une fois les catégories créées, elles apparaîtront automatiquement dans :**
- ✅ Page de création de ticket (`/create-ticket`)
- ✅ Page d'inscription technicien (`/signup` avec rôle technicien)
- ✅ Dashboard SuperAdmin (gestion des catégories)

