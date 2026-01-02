# 🗄️ Commandes PostgreSQL - Créer les Catégories

## ✅ **Vous êtes connecté en SSH !**

Maintenant, exécutez ces commandes **une par une** :

---

## 📋 **Étape 1 : Se Connecter à PostgreSQL**

```bash
sudo -u postgres psql -d hotel_ticket_hub
```

**Si ça ne fonctionne pas**, essayez de trouver le nom exact de la base :

```bash
# Lister les bases de données
sudo -u postgres psql -l
```

Le nom peut être : `hotel_ticket_hub`, `tickethub`, `hotel_tickethub`, etc.

---

## 📋 **Étape 2 : Exécuter le Script SQL**

Une fois dans `psql`, **copiez-collez tout ce bloc** :

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

## 📋 **Étape 3 : Vérifier les Catégories**

```sql
SELECT COUNT(*) as total_categories FROM categories;
```

**Résultat attendu** : `total_categories` = 12 (ou plus si certaines existaient déjà)

```sql
SELECT name, icon, color FROM categories ORDER BY name;
```

**Résultat attendu** : Liste de toutes les catégories avec leurs couleurs

---

## 📋 **Étape 4 : Quitter PostgreSQL**

```sql
\q
```

---

## 🚀 **COMMANDES RAPIDES (Tout en Une)**

Si vous préférez tout faire en une seule commande :

```bash
sudo -u postgres psql -d hotel_ticket_hub -c "INSERT INTO categories (id, name, icon, color, is_mandatory, additional_cost, created_at) VALUES (gen_random_uuid(), 'Électricité', 'Zap', '#FFD700', false, 0.00, NOW()), (gen_random_uuid(), 'Plomberie', 'Droplet', '#1E90FF', false, 0.00, NOW()), (gen_random_uuid(), 'Climatisation / Chauffage', 'Snowflake', '#00CED1', false, 0.00, NOW()), (gen_random_uuid(), 'Internet / WiFi', 'Wifi', '#32CD32', false, 0.00, NOW()), (gen_random_uuid(), 'Serrurerie', 'Key', '#FF6347', false, 0.00, NOW()), (gen_random_uuid(), 'Chambre', 'BedDouble', '#9370DB', false, 0.00, NOW()), (gen_random_uuid(), 'Salle de bain', 'Bath', '#20B2AA', false, 0.00, NOW()), (gen_random_uuid(), 'Son / Audio', 'Volume2', '#FF69B4', false, 0.00, NOW()), (gen_random_uuid(), 'Ménage / Nettoyage', 'Sparkles', '#FFA500', false, 0.00, NOW()), (gen_random_uuid(), 'Sécurité', 'Shield', '#DC143C', false, 0.00, NOW()), (gen_random_uuid(), 'Restauration', 'UtensilsCrossed', '#FF8C00', false, 0.00, NOW()), (gen_random_uuid(), 'Autre', 'Package', '#6C757D', false, 0.00, NOW()) ON CONFLICT DO NOTHING;"
```

Puis vérifier :

```bash
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT COUNT(*) as total FROM categories;"
sudo -u postgres psql -d hotel_ticket_hub -c "SELECT name FROM categories ORDER BY name;"
```

---

## ⚠️ **Si ça ne fonctionne pas**

### **Erreur : "database does not exist"**

```bash
# Lister les bases de données
sudo -u postgres psql -l

# Utiliser le bon nom de base
sudo -u postgres psql -d NOM_DE_LA_BASE
```

### **Erreur : "relation categories does not exist"**

La table n'existe pas encore. Le backend doit créer les tables au démarrage.

```bash
# Vérifier que le backend est démarré
docker compose ps

# Vérifier les logs
docker compose logs backend --tail=50
```

### **Erreur : "permission denied"**

```bash
# Vérifier les permissions
sudo -u postgres psql -c "\du"
```

---

## ✅ **Après avoir créé les catégories**

1. ✅ **Rafraîchir le frontend** : Ctrl+Shift+R dans le navigateur
2. ✅ **Vérifier** : Les catégories doivent apparaître dans :
   - `/create-ticket` (étape 2)
   - `/signup` (pour les techniciens)
   - Dashboard SuperAdmin → Catégories

---

**Exécutez ces commandes maintenant que vous êtes connecté en SSH !** 🚀

