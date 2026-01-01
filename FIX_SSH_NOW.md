# 🔧 Solution SSH Immédiate

## ⚠️ Problème Actuel

Vous essayez de vous connecter avec la clé AWS mais ça échoue :
```
ubuntu@51.21.196.104: Permission denied (publickey).
```

## ✅ Solution en 2 étapes

### Étape 1 : Vérifier quelle clé fonctionne

Vous avez déjà généré la clé publique :
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC6c0+novFZCVpT6T7HojYeJ05nHqD2BHMbW7XLxyHWcM9fxnQvsys/6/68XMQUFkB2FRGdMsisgcMnSCnqQglVIGJCnzHctRHbdyryiQkZyAFfLu4tSG1jtkVonsu8M8bXJi6OwvqsrYN7GnxY5j9g8OojS7y1bGKy8CqJfETLDyDxe16Yj6pZ4yU/A1YiNn0AkTfEZQSP+Dk5vzxYhC+zwkyQ3ItM8KfMSt4lOjGYDyDb2L12zAUes8itE9HLMQKDfwo8mcTA+NXYGfTGqnDI5SLmtpQTfo1Yiv11sEaF7a86PbF7YRPhKhW0nBnvwvjQCfKO/3YsLp+/X0TFZJTZVwS6YD7MuLr3foXL3TQ++Vejoj6fCGWW0vh/s9u+e/DmK74WCLivsvcG7z9+ts3tWoKTxWEDxHvPKdSPeGG4hrFs7iaHIAiZw7YHm18Bk5V9OR54JxPGlv6TXtFfafIfx2GUNNxSY60gDciVPA2McVb5zpUTqKSU0/xRqazGFnjSYfuEkPC1A8VEhEzDLFfCTrqC5swCzPVctcJTKwNxbi0l8zsE9j0uuSHT80dldv+c1W7FGXf1u5SRtt8bi61+s18KNkIpTfAO4pKyeXHFmuijpffM9O5zcacH/AZVGU0ABNLu9AKlMkUTWhVstibSLOrAgxNOIFojaSH/EfPP6w== github-actions-backend
```

### Étape 2 : Copier cette clé sur la VM

**Option A : Si vous avez accès à la console AWS ou une autre méthode**

Connectez-vous à la VM par la console AWS ou une autre méthode, puis :

```bash
# Sur la VM frontend
mkdir -p ~/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC6c0+novFZCVpT6T7HojYeJ05nHqD2BHMbW7XLxyHWcM9fxnQvsys/6/68XMQUFkB2FRGdMsisgcMnSCnqQglVIGJCnzHctRHbdyryiQkZyAFfLu4tSG1jtkVonsu8M8bXJi6OwvqsrYN7GnxY5j9g8OojS7y1bGKy8CqJfETLDyDxe16Yj6pZ4yU/A1YiNn0AkTfEZQSP+Dk5vzxYhC+zwkyQ3ItM8KfMSt4lOjGYDyDb2L12zAUes8itE9HLMQKDfwo8mcTA+NXYGfTGqnDI5SLmtpQTfo1Yiv11sEaF7a86PbF7YRPhKhW0nBnvwvjQCfKO/3YsLp+/X0TFZJTZVwS6YD7MuLr3foXL3TQ++Vejoj6fCGWW0vh/s9u+e/DmK74WCLivsvcG7z9+ts3tWoKTxWEDxHvPKdSPeGG4hrFs7iaHIAiZw7YHm18Bk5V9OR54JxPGlv6TXtFfafIfx2GUNNxSY60gDciVPA2McVb5zpUTqKSU0/xRqazGFnjSYfuEkPC1A8VEhEzDLFfCTrqC5swCzPVctcJTKwNxbi0l8zsE9j0uuSHT80dldv+c1W7FGXf1u5SRtt8bi61+s18KNkIpTfAO4pKyeXHFmuijpffM9O5zcacH/AZVGU0ABNLu9AKlMkUTWhVstibSLOrAgxNOIFojaSH/EfPP6w== github-actions-backend" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Option B : Utiliser le script copy-ssh-key.ps1 avec la bonne clé AWS**

Vérifiez d'abord quel fichier de clé AWS vous avez :

```powershell
# Lister les clés dans Downloads
Get-ChildItem "$HOME\Downloads\*.pem"
```

Puis utilisez le bon fichier :

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub

# Utiliser le script avec la bonne clé AWS
.\copy-ssh-key.ps1 -HostIP "51.21.196.104" -AWSKey "<CHEMIN_VERS_VOTRE_CLE_AWS>.pem" -User "ubuntu"
```

### Étape 3 : Tester

```powershell
cd C:\Users\oumay\projet\hotel-ticket-hub
ssh -i github-actions-key ubuntu@51.21.196.104 "echo 'OK' && hostname"
```

Si ça fonctionne → Le problème est résolu ! 🎉

