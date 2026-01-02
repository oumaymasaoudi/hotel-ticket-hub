# 🔧 Fix - Techniciens Travaillent pour Tous les Hôtels

## 🎯 **Problème Identifié**

Les techniciens peuvent travailler pour **tous les hôtels** (hotel_id = NULL), mais le backend ne les retournait pas dans l'endpoint `/api/users/hotel/{hotelId}/technicians`.

**Cause** : La méthode `getTechniciansByHotel` ne récupérait que les techniciens avec un `hotel_id` spécifique, excluant ceux avec `hotel_id = NULL`.

---

## ✅ **Solution Appliquée**

### **1. Modification du Controller** (`UserRestController.java`)

La méthode `getTechniciansByHotel` a été modifiée pour :
- ✅ Récupérer les techniciens liés à l'hôtel spécifique (`hotel_id = hotelId`)
- ✅ Récupérer les techniciens avec `hotel_id = NULL` (tous les hôtels)
- ✅ Combiner les deux listes et retourner tous les techniciens disponibles

### **2. Ajout dans le Repository** (`UserRepository.java`)

Ajout de la méthode `findByHotelIdIsNull()` pour récupérer les utilisateurs sans hôtel.

---

## 📋 **Changements Techniques**

### **Avant**
```java
// Ne retournait que les techniciens avec hotel_id = hotelId
List<User> usersInHotel = userRepository.findByHotelId(hotelId);
```

### **Après**
```java
// Retourne les techniciens avec hotel_id = hotelId
List<User> usersInHotel = userRepository.findByHotelId(hotelId);

// ET les techniciens avec hotel_id = NULL (tous les hôtels)
List<User> techniciansForAllHotels = userRepository.findByHotelIdIsNull();

// Combine les deux listes
List<User> allUsers = new ArrayList<>(usersInHotel);
allUsers.addAll(techniciansForAllHotels);
```

---

## 🚀 **Actions Requises**

### **1. Rebuild et Déployer le Backend**

```bash
# Sur votre machine locale
cd hotel-ticket-hub-backend

# Commit les changements
git add .
git commit -m "fix: include technicians with NULL hotel_id in getTechniciansByHotel

- Technicians with hotel_id = NULL work for all hotels
- Modified getTechniciansByHotel to include both:
  - Technicians linked to specific hotel
  - Technicians with hotel_id = NULL (all hotels)
- Added findByHotelIdIsNull() method in UserRepository"

git push origin develop
```

### **2. Attendre le Pipeline**

Attendez que le pipeline GitHub Actions termine :
- Build du backend
- Push de l'image Docker vers GHCR
- Déploiement sur la VM staging

### **3. Redémarrer le Backend sur la VM**

```bash
# Se connecter à la VM backend
ssh -i github-actions-key ubuntu@13.49.44.219

# Aller dans le répertoire
cd /opt/hotel-ticket-hub-backend-staging

# Pull la nouvelle image
docker compose pull

# Redémarrer
docker compose up -d

# Vérifier les logs
docker compose logs backend --tail=50
```

### **4. Tester**

1. **Rafraîchissez le frontend** : `Ctrl + Shift + R`
2. **Allez dans "Techniciens"** dans le dashboard admin
3. ✅ Les techniciens avec `hotel_id = NULL` doivent maintenant apparaître

---

## 🔍 **Vérifications**

### **1. Vérifier dans la Base de Données**

```bash
# Se connecter à la VM data-staging
ssh -i github-actions-key ubuntu@13.61.27.43

# Se connecter à PostgreSQL
sudo -u postgres psql -d hotel_ticket_hub

# Vérifier les techniciens avec hotel_id = NULL
SELECT id, email, full_name, role, hotel_id 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'TECHNICIAN' 
  AND u.hotel_id IS NULL;

# Quitter
\q
```

### **2. Tester l'API**

```bash
# Tester l'endpoint (nécessite un token d'authentification)
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  http://13.49.44.219:8081/api/users/hotel/bfaab0ae-dd49-4bbe-8490-8363d5ed6459/technicians
```

**Résultat attendu** : JSON avec tous les techniciens (ceux liés à l'hôtel + ceux avec hotel_id = NULL)

---

## ✅ **Résultat Attendu**

- ✅ Les techniciens avec `hotel_id = NULL` apparaissent dans la liste
- ✅ Les techniciens liés à un hôtel spécifique apparaissent aussi
- ✅ Tous les techniciens sont disponibles pour l'assignation de tickets

---

**Le fix a été appliqué. Vous devez maintenant rebuild et déployer le backend !** 🚀

