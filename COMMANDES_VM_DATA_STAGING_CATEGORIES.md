# 🗄️ Créer les Catégories - VM Data Staging

## ✅ **PostgreSQL est sur la VM data-staging (13.61.27.43)**

---

## 📋 **Étape 1 : Se Connecter à la VM Data Staging**

```bash
# Depuis votre machine locale
ssh -i github-actions-key ubuntu@13.61.27.43
```

**OU** si vous êtes déjà sur la VM backend, vous pouvez vous connecter directement :

```bash
# Depuis la VM backend (13.49.44.219)
ssh -i ~/.ssh/github-actions-key ubuntu@13.61.27.43
```

---

## 📋 **Étape 2 : Se Connecter à PostgreSQL**

Une fois connecté à la VM data-staging :

```bash
sudo -u postgres psql -d hotel_ticket_hub
```

**Si ça ne fonctionne pas**, essayez :

```bash
# Se connecter d'abord à PostgreSQL
sudo -u postgres psql

# Puis se connecter à la base
\c hotel_ticket_hub
```

---

## 📋 **Étape 3 : Exécuter le Script SQL pour Créer les Catégories**

Une fois dans PostgreSQL (`hotel_ticket_hub=>`), **copiez-collez tout ce bloc** :

```sql
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
```

**Appuyez sur Entrée** après avoir collé.

---

## 📋 **Étape 4 : Vérifier les Catégories**

```sql
-- Compter les catégories
SELECT COUNT(*) as total_categories FROM categories;

-- Afficher toutes les catégories
SELECT id, name, icon, color FROM categories ORDER BY name;
```

**Résultat attendu** : `total_categories` = 12 (ou plus si certaines existaient déjà)

---

## 📋 **Étape 5 : Quitter PostgreSQL**

```sql
\q
```

---

## 🚀 **COMMANDES RAPIDES (Tout en Une)**

Si vous préférez tout faire en une seule commande :

```bash
# Se connecter à la VM data-staging et exécuter le script
ssh -i github-actions-key ubuntu@13.61.27.43 << 'EOF'
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
SELECT name FROM categories ORDER BY name;
SQL
EOF
```

---

## ⚠️ **Si ça ne fonctionne pas**

### **Erreur : "database does not exist"**

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE hotel_ticket_hub;

# Quitter
\q
```

### **Erreur : "permission denied"**

```bash
# Vérifier les permissions
sudo -u postgres psql -d hotel_ticket_hub -c "\du"

# Donner les permissions si nécessaire
sudo -u postgres psql -d hotel_ticket_hub -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
```

### **Erreur : "relation categories does not exist"**

La table n'existe pas encore. Le backend doit créer les tables au démarrage.

```bash
# Vérifier que le backend est démarré et a créé les tables
# Les tables sont créées automatiquement par Hibernate au premier démarrage
```

---

## ✅ **Après avoir créé les catégories**

1. ✅ **Rafraîchir le frontend** : Ctrl+Shift+R dans le navigateur
2. ✅ **Vérifier** : Les catégories doivent apparaître dans :
   - `/create-ticket` (étape 2)
   - `/signup` (pour les techniciens)
   - Dashboard SuperAdmin → Catégories

---

**Exécutez ces commandes maintenant !** 🚀

