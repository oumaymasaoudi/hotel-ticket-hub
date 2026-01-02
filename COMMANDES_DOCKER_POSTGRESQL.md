# 🐳 Commandes Docker PostgreSQL - Créer les Catégories

## 🔍 **Problème : PostgreSQL est dans Docker**

L'utilisateur `postgres` n'existe pas car PostgreSQL est dans un conteneur Docker.

---

## 📋 **Étape 1 : Vérifier les Conteneurs Docker**

```bash
docker compose ps
```

ou

```bash
docker ps
```

**Cherchez** un conteneur avec `postgres` dans le nom.

---

## 📋 **Étape 2 : Se Connecter à PostgreSQL via Docker**

### **Option A : Si vous avez un docker-compose.yml**

```bash
# Aller dans le répertoire du backend
cd /opt/hotel-ticket-hub-backend-staging
# ou
cd ~/hotel-ticket-hub-backend

# Vérifier le nom du service PostgreSQL dans docker-compose.yml
cat docker-compose.yml | grep -A 5 postgres

# Se connecter au conteneur PostgreSQL
docker compose exec postgres psql -U postgres -d hotel_ticket_hub
```

**OU** si le service s'appelle différemment (ex: `db`, `database`, `postgresql`) :

```bash
docker compose exec db psql -U postgres -d hotel_ticket_hub
```

### **Option B : Si vous connaissez le nom du conteneur**

```bash
# Lister les conteneurs
docker ps

# Se connecter (remplacez CONTAINER_NAME par le nom réel)
docker exec -it CONTAINER_NAME psql -U postgres -d hotel_ticket_hub
```

### **Option C : Trouver le conteneur automatiquement**

```bash
# Trouver le conteneur PostgreSQL
docker ps --filter "name=postgres" --format "{{.Names}}"

# Puis se connecter (remplacez CONTAINER_NAME par le résultat)
docker exec -it CONTAINER_NAME psql -U postgres -d hotel_ticket_hub
```

---

## 📋 **Étape 3 : Exécuter le Script SQL**

Une fois connecté à PostgreSQL, **copiez-collez ce bloc** :

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

## 📋 **Étape 4 : Vérifier**

```sql
SELECT COUNT(*) as total FROM categories;
SELECT name FROM categories ORDER BY name;
```

---

## 📋 **Étape 5 : Quitter**

```sql
\q
```

---

## 🚀 **COMMANDES RAPIDES (Tout en Une)**

Si vous préférez tout faire en une seule commande :

```bash
# Trouver le conteneur
CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)

# Exécuter le script SQL
docker exec -i $CONTAINER psql -U postgres -d hotel_ticket_hub << 'EOF'
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

# Vérifier
docker exec -i $CONTAINER psql -U postgres -d hotel_ticket_hub -c "SELECT COUNT(*) as total FROM categories;"
docker exec -i $CONTAINER psql -U postgres -d hotel_ticket_hub -c "SELECT name FROM categories ORDER BY name;"
```

---

## 🔍 **Trouver le Nom de la Base de Données**

Si vous ne connaissez pas le nom exact de la base :

```bash
# Se connecter au conteneur
CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)
docker exec -it $CONTAINER psql -U postgres

# Dans psql, lister les bases
\l

# Utiliser la bonne base (probablement hotel_ticket_hub, tickethub, etc.)
\c hotel_ticket_hub
```

---

## ⚠️ **Si Docker Compose n'est pas dans le répertoire actuel**

```bash
# Trouver où est docker-compose.yml
find ~ -name "docker-compose.yml" 2>/dev/null
find /opt -name "docker-compose.yml" 2>/dev/null

# Aller dans ce répertoire
cd /chemin/trouvé

# Puis exécuter les commandes
```

---

**Exécutez d'abord `docker ps` pour voir les conteneurs !** 🚀

