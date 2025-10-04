#!/bin/bash

# Pokemon Tactics Arena v2 - Script de déploiement
set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Variables
PROJECT_NAME="pokemon-tactics-arena-v2"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

# Vérifications préliminaires
log "🚀 Démarrage du déploiement de $PROJECT_NAME"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé"
fi

# Vérifier les fichiers requis
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Fichier $COMPOSE_FILE non trouvé"
fi

if [ ! -f "$ENV_FILE" ]; then
    warning "Fichier $ENV_FILE non trouvé, création d'un exemple..."
    cp .env.example .env.production 2>/dev/null || true
fi

# Arrêter les conteneurs existants
log "🛑 Arrêt des conteneurs existants..."
docker-compose down --remove-orphans || true

# Nettoyer les images orphelines
log "🧹 Nettoyage des images orphelines..."
docker image prune -f || true

# Build des images
log "🔨 Construction des images Docker..."
docker-compose build --no-cache

# Démarrer les services d'infrastructure d'abord
log "🗄️  Démarrage de la base de données..."
docker-compose up -d pokemon-mysql pokemon-redis

# Attendre que MySQL soit prêt
log "⏳ Attente de la disponibilité de MySQL..."
timeout=60
while ! docker-compose exec -T pokemon-mysql mysqladmin ping --silent; do
    timeout=$((timeout - 1))
    if [ $timeout -eq 0 ]; then
        error "Timeout: MySQL n'est pas disponible"
    fi
    sleep 1
done

success "MySQL est prêt !"

# Exécuter les migrations
log "🔄 Exécution des migrations de base de données..."
docker-compose run --rm pokemon-backend npm run prisma:migrate:deploy

# Importer les données Pokemon si nécessaire
log "📦 Import des données Pokemon..."
docker-compose run --rm pokemon-backend npm run data:import

# Démarrer tous les services
log "🚀 Démarrage de tous les services..."
docker-compose up -d

# Attendre que tous les services soient prêts
log "⏳ Vérification de la santé des services..."

services=("pokemon-backend" "pokemon-frontend")
for service in "${services[@]}"; do
    log "Vérification de $service..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if docker-compose ps "$service" | grep -q "healthy\|Up"; then
            success "$service est prêt !"
            break
        fi
        timeout=$((timeout - 1))
        if [ $timeout -eq 0 ]; then
            warning "$service n'est pas encore prêt, continuons..."
            break
        fi
        sleep 1
    done
done

# Afficher le statut
log "📊 Statut des services:"
docker-compose ps

# Afficher les URLs
log "🌐 Services disponibles:"
echo -e "  ${GREEN}Frontend:${NC} https://pokemon-tactics.faildaily.com"
echo -e "  ${GREEN}Backend API:${NC} https://api.pokemon-tactics.faildaily.com"
echo -e "  ${GREEN}Grafana:${NC} https://grafana.pokemon-tactics.faildaily.com"
echo -e "  ${GREEN}Prometheus:${NC} http://localhost:9090 (internal)"

# Afficher les logs en cas de problème
if [ "$1" = "--logs" ]; then
    log "📋 Affichage des logs..."
    docker-compose logs -f
fi

success "✅ Déploiement terminé avec succès !"

# Instructions post-déploiement
echo -e "\n${BLUE}Instructions post-déploiement:${NC}"
echo "1. Vérifiez que Traefik est configuré pour router vers ces services"
echo "2. Configurez les certificats SSL si nécessaire"
echo "3. Configurez la sauvegarde de la base de données"
echo "4. Surveillez les logs: docker-compose logs -f"
echo "5. Pour arrêter: docker-compose down"