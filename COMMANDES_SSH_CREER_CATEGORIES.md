# 🚀 Commandes SSH pour Créer les Catégories

## 📋 **Étape 1 : Se Connecter en SSH**

```bash
ssh -i ~/.ssh/github-actions-key ubuntu@13.49.44.219
```

---

## 📋 **Étape 2 : Exécuter le Script SQL**

Une fois connecté, exécutez ces commandes :

### **Option A : Exécuter le Script Directement (Recommandé)**

```bash
# 1. Se connecter à PostgreSQL
sudo -u postgres psql -d hotel_ticket_hub

# 2. Copier-coller ce script SQL :
```

```sql
-- Créer les catégories par défaut
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

-- Quitter psql
\q
```

### **Option B : Exécuter depuis un Fichier**

```bash
# 1. Créer le fichier SQL (si le fichier n'existe pas déjà)
cat > /tmp/create-categories.sql << 'EOF'
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
EOF

# 2. Exécuter le script
sudo -u postgres psql -d hotel_ticket_hub -f /tmp/create-categories.sql

# 3. Vérifier les catégories
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT name, icon, color FROM categories ORDER BY name;"
```

---

## 📋 **Étape 3 : Vérifier les Catégories**

```bash
# Compter les catégories
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT COUNT(*) as total_categories FROM categories;"

# Afficher toutes les catégories
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT id, name, icon, color FROM categories ORDER BY name;"
```

**Résultat attendu** : Au moins 12 catégories

---

## 📋 **Étape 4 : Vérifier que le Backend Peut Les Récupérer**

```bash
# Tester l'endpoint API (depuis la VM ou votre machine locale)
curl http://localhost:8081/api/categories/public

# OU depuis l'extérieur
curl http://13.49.44.219:8081/api/categories/public
```

**Résultat attendu** : JSON avec la liste des catégories

---

## ✅ **Vérification Finale**

1. ✅ **Catégories créées** : `SELECT COUNT(*) FROM categories;` retourne ≥ 12
2. ✅ **API fonctionne** : `curl http://13.49.44.219:8081/api/categories/public` retourne du JSON
3. ✅ **Frontend** : Rafraîchir la page (Ctrl+Shift+R) et vérifier que les catégories apparaissent

---

## 🔧 **Si ça ne fonctionne pas**

### **Erreur : "database does not exist"**
```bash
# Lister les bases de données
sudo -u postgres psql -l

# Vérifier le nom exact de la base
# Peut être : hotel_ticket_hub, tickethub, etc.
```

### **Erreur : "permission denied"**
```bash
# Vérifier les permissions
sudo -u postgres psql -d hotel_ticket_hub -c "\du"

# Si nécessaire, donner les permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hotel_ticket_hub TO ubuntu;"
```

### **Erreur : "relation categories does not exist"**
```bash
# Vérifier que la table existe
sudo -u postgres psql -d hotel_ticket_hub -c "\dt categories"

# Si elle n'existe pas, le backend doit créer les tables au démarrage
# Vérifier que le backend est démarré et que Hibernate crée les tables
```

---

## 🚀 **Commandes Rapides (Tout en Une)**

```bash
# Se connecter et exécuter en une commande
ssh -i ~/.ssh/github-actions-key ubuntu@13.49.44.219 << 'EOF'
sudo -u postgres psql -d hotel_ticket_hub << 'SQL'
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
SELECT COUNT(*) as total FROM categories;
SQL
EOF
```

---

**Une fois les catégories créées, elles apparaîtront automatiquement dans le frontend !** 🎉

