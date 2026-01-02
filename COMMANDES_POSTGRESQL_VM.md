# 🗄️ Commandes PostgreSQL sur la VM - Créer les Catégories

## ✅ **PostgreSQL est installé directement sur la VM (pas dans Docker)**

Le backend se connecte à `localhost:5432` avec la base `hotel_ticket_hub`.

---

## 📋 **Étape 1 : Vérifier PostgreSQL**

```bash
# Vérifier si PostgreSQL est installé
which psql
psql --version

# Vérifier si le service tourne
sudo systemctl status postgresql
```

---

## 📋 **Étape 2 : Trouver Comment Se Connecter**

### **Option A : Essayer avec l'utilisateur ubuntu**

```bash
psql -U ubuntu -d hotel_ticket_hub
```

### **Option B : Essayer directement (si ubuntu a les permissions)**

```bash
psql -d hotel_ticket_hub
```

### **Option C : Vérifier les variables d'environnement du backend**

```bash
# Vérifier les variables d'environnement du conteneur backend
docker exec hotel-ticket-hub-backend-staging env | grep -i DATASOURCE
docker exec hotel-ticket-hub-backend-staging env | grep -i POSTGRES
```

### **Option D : Vérifier le fichier .env du backend**

```bash
# Aller dans le répertoire du backend
cd /opt/hotel-ticket-hub-backend-staging
# ou
cd ~/hotel-ticket-hub-backend

# Voir le fichier .env (si il existe)
cat .env | grep -i DATASOURCE
cat .env | grep -i POSTGRES
```

---

## 📋 **Étape 3 : Se Connecter avec les Bonnes Informations**

Une fois que vous avez trouvé les informations (username, password, database), connectez-vous :

```bash
# Exemple avec les valeurs par défaut du application.properties
psql -h localhost -U postgres -d hotel_ticket_hub
# Mot de passe : postgres (ou celui dans .env)
```

**OU** si vous avez besoin de spécifier le mot de passe :

```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d hotel_ticket_hub
```

---

## 📋 **Étape 4 : Exécuter le Script SQL**

Une fois connecté, **copiez-collez ce bloc** :

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

---

## 📋 **Étape 5 : Vérifier**

```sql
SELECT COUNT(*) as total FROM categories;
SELECT name FROM categories ORDER BY name;
```

---

## 🚀 **COMMANDES RAPIDES - Tout Tester**

```bash
# 1. Vérifier PostgreSQL
psql --version

# 2. Vérifier les variables d'environnement du backend
docker exec hotel-ticket-hub-backend-staging env | grep DATASOURCE

# 3. Essayer de se connecter (remplacez les valeurs par celles trouvées)
PGPASSWORD=postgres psql -h localhost -U postgres -d hotel_ticket_hub -c "SELECT COUNT(*) FROM categories;"

# 4. Si ça fonctionne, exécuter le script
PGPASSWORD=postgres psql -h localhost -U postgres -d hotel_ticket_hub << 'EOF'
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

# 5. Vérifier
PGPASSWORD=postgres psql -h localhost -U postgres -d hotel_ticket_hub -c "SELECT name FROM categories ORDER BY name;"
```

---

## 🔍 **Trouver les Informations de Connexion**

```bash
# Vérifier le fichier .env du backend
cd /opt/hotel-ticket-hub-backend-staging
cat .env | grep -i DATASOURCE

# OU vérifier les variables d'environnement du conteneur
docker exec hotel-ticket-hub-backend-staging printenv | grep -i DATASOURCE
```

---

**Commencez par vérifier les variables d'environnement du backend pour trouver le username et password !** 🚀

