# 📋 Méthodes pour Copier la Clé SSH

## 🔍 Étape 1 : Vérifier que le fichier a du contenu

```powershell
# Vérifier la taille du fichier
(Get-Item github-actions-key).Length

# Voir les premières lignes
Get-Content github-actions-key -Head 5

# Voir les dernières lignes
Get-Content github-actions-key -Tail 5
```

## 📋 Étape 2 : Méthodes pour Copier

### Méthode 1 : Set-Clipboard (si ça ne fonctionne pas, essayez les autres)

```powershell
# Méthode standard
Get-Content github-actions-key -Raw | Set-Clipboard

# Vérifier que c'est copié
Get-Clipboard | Select-Object -First 3
```

### Méthode 2 : Créer un fichier temporaire

```powershell
# Copier vers un fichier temporaire
Copy-Item github-actions-key $env:TEMP\github-actions-key-temp.txt

# Ouvrir le fichier pour copier manuellement
notepad $env:TEMP\github-actions-key-temp.txt
```

### Méthode 3 : Afficher et copier manuellement

```powershell
# Afficher tout le contenu
Get-Content github-actions-key

# Puis sélectionnez tout (Ctrl+A) et copiez (Ctrl+C) dans le terminal
```

### Méthode 4 : Utiliser Out-File puis ouvrir

```powershell
# Créer un fichier texte
Get-Content github-actions-key | Out-File -FilePath key-to-copy.txt -Encoding utf8

# Ouvrir le fichier
notepad key-to-copy.txt

# Puis copiez tout (Ctrl+A, Ctrl+C) et collez dans GitHub
```

## ✅ Étape 3 : Vérifier le Format

La clé doit :
- Commencer par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----`
- Se terminer par `-----END OPENSSH PRIVATE KEY-----` ou `-----END RSA PRIVATE KEY-----`
- Contenir toutes les lignes entre les deux

## 🎯 Action : Essayez la Méthode 4 (la plus fiable)

```powershell
# Créer un fichier texte avec la clé
Get-Content github-actions-key | Out-File -FilePath key-to-copy.txt -Encoding utf8

# Ouvrir le fichier
notepad key-to-copy.txt
```

Puis dans Notepad :
1. Sélectionnez tout (Ctrl+A)
2. Copiez (Ctrl+C)
3. Allez sur GitHub et collez dans le secret

