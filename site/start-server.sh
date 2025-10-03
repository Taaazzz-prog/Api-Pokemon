#!/bin/bash
# Script de lancement pour le site Pokémon

echo "🚀 Lancement du serveur Pokémon..."

# Vérification du répertoire
if [ ! -f "index.html" ]; then
    echo "❌ Erreur: index.html non trouvé dans le répertoire courant"
    echo "📁 Répertoire courant: $(pwd)"
    echo "💡 Assurez-vous d'être dans le dossier 'site'"
    exit 1
fi

# Vérification du port
PORT=8001
while netstat -an | grep :$PORT > /dev/null 2>&1; do
    echo "⚠️  Port $PORT occupé, essai du port suivant..."
    ((PORT++))
done

echo "🌐 Démarrage du serveur sur le port $PORT"
echo "📱 Accédez au site via: http://localhost:$PORT"
echo "🛑 Utilisez Ctrl+C pour arrêter le serveur"

python -m http.server $PORT