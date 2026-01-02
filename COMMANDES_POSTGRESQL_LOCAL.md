# 🗄️ Commandes PostgreSQL Local - Créer les Catégories

## 🔍 **PostgreSQL est installé directement sur la VM (pas dans Docker)**

---

## 📋 **Étape 1 : Vérifier si PostgreSQL est installé**

```bash
# Vérifier si PostgreSQL est installé
which psql

# Vérifier le service PostgreSQL
sudo systemctl status postgresql
```

---

## 📋 **Étape 2 : Trouver l'utilisateur PostgreSQL**

PostgreSQL peut être configuré avec différents utilisateurs. Essayez :

### **Option A : Utilisateur ubuntu**

```bash
psql -U ubuntu -d hotel_ticket_hub
```

### **Option B : Se connecter directement**

```bash
psql -d hotel_ticket_hub
```

### **Option C : Via sudo avec l'utilisateur système**

```bash
sudo -u postgres psql -d hotel_ticket_hub
```

**Si ça ne fonctionne pas**, essayez de trouver l'utilisateur :

```bash
# Vérifier les utilisateurs PostgreSQL
sudo -u postgres psql -c "\du"
```

---

## 📋 **Étape 3 : Vérifier le nom de la base de données**

Le backend peut utiliser un nom de base différent. Vérifiez dans la configuration :

```bash
# Vérifier la configuration du backend
docker exec hotel-ticket-hub-backend-staging cat /app/application.properties | grep -i "spring.datasource.url"
```

**OU** lister toutes les bases de données :

```bash
# Si vous arrivez à vous connecter à PostgreSQL
psql -l
# ou
sudo -u postgres psql -l
```

Les noms possibles :
- `hotel_ticket_hub`
- `tickethub`
- `hotel_tickethub`
- `hoteltickethub`

---

## 📋 **Étape 4 : Se Connecter et Exécuter le Script**

Une fois que vous avez trouvé comment vous connecter, exécutez :

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

## 🚀 **COMMANDES RAPIDES - Tester Toutes les Options**

```bash
# 1. Vérifier si psql existe
which psql

# 2. Essayer de se connecter avec ubuntu
psql -U ubuntu -d hotel_ticket_hub

# 3. Si ça ne fonctionne pas, vérifier la configuration du backend
docker exec hotel-ticket-hub-backend-staging env | grep -i postgres
docker exec hotel-ticket-hub-backend-staging env | grep -i database
docker exec hotel-ticket-hub-backend-staging env | grep -i db

# 4. Vérifier les variables d'environnement dans docker-compose
cd /opt/hotel-ticket-hub-backend-staging
cat docker-compose.yml | grep -A 10 -i postgres
cat docker-compose.yml | grep -A 10 -i database
cat .env 2>/dev/null | grep -i postgres
cat .env 2>/dev/null | grep -i database
```

---

## 🔍 **Alternative : Utiliser l'API du Backend**

Si vous ne pouvez pas accéder directement à PostgreSQL, vous pouvez créer les catégories via l'API du backend (en tant que SuperAdmin) :

```bash
# 1. Se connecter en tant que SuperAdmin via l'API
# 2. Utiliser l'endpoint POST /api/categories
# 3. Créer chaque catégorie une par une
```

Mais c'est plus long que d'exécuter le script SQL directement.

---

**Commencez par vérifier la configuration du backend pour trouver les informations de connexion PostgreSQL !** 🚀

