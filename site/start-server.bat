@echo off
REM Script de lancement pour le site Pokémon (Windows)

echo 🚀 Lancement du serveur Pokémon...

REM Vérification du répertoire
if not exist "index.html" (
    echo ❌ Erreur: index.html non trouvé dans le répertoire courant
    echo 📁 Répertoire courant: %CD%
    echo 💡 Assurez-vous d'être dans le dossier 'site'
    pause
    exit /b 1
)

REM Démarrage du serveur
set PORT=8001
echo 🌐 Démarrage du serveur sur le port %PORT%
echo 📱 Accédez au site via: http://localhost:%PORT%
echo 🛑 Utilisez Ctrl+C pour arrêter le serveur
echo.

python -m http.server %PORT%