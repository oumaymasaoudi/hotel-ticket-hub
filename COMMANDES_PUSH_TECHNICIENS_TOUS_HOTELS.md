# 🚀 Commandes Git - Fix Techniciens Tous les Hôtels

## ✅ **Fix Appliqué**

Le backend inclut maintenant les techniciens avec `hotel_id = NULL` (tous les hôtels) dans la liste des techniciens disponibles.

---

## 📋 **Commandes à Exécuter**

### **1. Backend - Commit et Push**

```bash
cd hotel-ticket-hub-backend

# Vérifier les modifications
git status

# Ajouter les fichiers modifiés
git add src/main/java/com/hotel/tickethub/controller/UserRestController.java
git add src/main/java/com/hotel/tickethub/repository/UserRepository.java

# Commit
git commit -m "fix: include technicians with NULL hotel_id in getTechniciansByHotel

- Technicians with hotel_id = NULL work for all hotels
- Modified getTechniciansByHotel to include both:
  - Technicians linked to specific hotel (hotel_id = hotelId)
  - Technicians with hotel_id = NULL (all hotels)
- Added findByHotelIdIsNull() method in UserRepository
- This allows technicians to be available for all hotels"

# Push
git push origin develop
```

### **2. Frontend - Commit et Push (si nécessaire)**

```bash
cd hotel-ticket-hub

# Vérifier les modifications
git status

# Si vous avez des modifications (fix 429, etc.)
git add .

# Commit
git commit -m "fix: remove functions from useEffect dependencies to prevent infinite loops

- Fixed 429 Too Many Requests errors caused by infinite request loops
- Removed fetch functions from useEffect dependencies
- Functions are already memoized with useCallback"

# Push
git push origin develop
```

---

## ⏱️ **Après le Push**

1. **Attendre 5-10 minutes** que les pipelines GitHub Actions terminent
2. **Vérifier** : `https://github.com/oumaymasaoudi/hotel-ticket-hub-backend/actions`
3. **Sur la VM backend** : Redémarrer le conteneur

---

## 🔄 **Redémarrer le Backend sur la VM**

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

---

## ✅ **Vérification**

1. **Rafraîchir le frontend** : `Ctrl + Shift + R`
2. **Allez dans "Techniciens"** dans le dashboard admin
3. ✅ Les techniciens avec `hotel_id = NULL` doivent apparaître
4. ✅ Les techniciens peuvent être assignés aux tickets de tous les hôtels

---

**Exécutez ces commandes pour déployer le fix !** 🚀

