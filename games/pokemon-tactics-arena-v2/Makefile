# Pokemon Tactics Arena v2 - Makefile
.PHONY: help build up down restart logs shell db-migrate db-import clean prune backup restore

# Variables
PROJECT_NAME = pokemon-tactics-arena-v2
DOCKER_COMPOSE = docker-compose
ENV_FILE = .env.production

# Couleurs
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m

# Commandes par défaut
help: ## Affiche l'aide
	@echo "${BLUE}Pokemon Tactics Arena v2 - Commandes Docker${NC}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# Construction et déploiement
build: ## Construit toutes les images Docker
	@echo "${BLUE}🔨 Construction des images...${NC}"
	$(DOCKER_COMPOSE) build --no-cache

up: ## Démarre tous les services
	@echo "${BLUE}🚀 Démarrage des services...${NC}"
	$(DOCKER_COMPOSE) up -d
	@echo "${GREEN}✅ Services démarrés !${NC}"

down: ## Arrête tous les services
	@echo "${BLUE}🛑 Arrêt des services...${NC}"
	$(DOCKER_COMPOSE) down --remove-orphans

restart: down up ## Redémarre tous les services

# Déploiement complet
deploy: ## Déploiement complet avec migrations
	@echo "${BLUE}🚀 Déploiement complet...${NC}"
	@chmod +x deploy.sh
	@./deploy.sh

deploy-logs: ## Déploiement avec affichage des logs
	@echo "${BLUE}🚀 Déploiement avec logs...${NC}"
	@chmod +x deploy.sh
	@./deploy.sh --logs

# Logs et monitoring
logs: ## Affiche les logs de tous les services
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Affiche les logs du backend
	$(DOCKER_COMPOSE) logs -f pokemon-backend

logs-frontend: ## Affiche les logs du frontend
	$(DOCKER_COMPOSE) logs -f pokemon-frontend

logs-db: ## Affiche les logs de la base de données
	$(DOCKER_COMPOSE) logs -f pokemon-mysql

# Accès aux conteneurs
shell-backend: ## Accède au shell du backend
	$(DOCKER_COMPOSE) exec pokemon-backend sh

shell-frontend: ## Accède au shell du frontend
	$(DOCKER_COMPOSE) exec pokemon-frontend sh

shell-db: ## Accède au shell de la base de données
	$(DOCKER_COMPOSE) exec pokemon-mysql mysql -u root -p

# Base de données
db-migrate: ## Exécute les migrations de base de données
	@echo "${BLUE}🔄 Exécution des migrations...${NC}"
	$(DOCKER_COMPOSE) run --rm pokemon-backend npm run prisma:migrate:deploy

db-import: ## Importe les données Pokemon
	@echo "${BLUE}📦 Import des données Pokemon...${NC}"
	$(DOCKER_COMPOSE) run --rm pokemon-backend npm run data:import

db-reset: ## Remet à zéro la base de données
	@echo "${YELLOW}⚠️  Remise à zéro de la base de données...${NC}"
	$(DOCKER_COMPOSE) run --rm pokemon-backend npm run prisma:migrate:reset --force

db-studio: ## Lance Prisma Studio
	@echo "${BLUE}🎨 Lancement de Prisma Studio...${NC}"
	$(DOCKER_COMPOSE) run --rm -p 5555:5555 pokemon-backend npm run prisma:studio

# Sauvegarde et restauration
backup: ## Sauvegarde la base de données
	@echo "${BLUE}💾 Sauvegarde de la base de données...${NC}"
	@mkdir -p backups
	$(DOCKER_COMPOSE) exec pokemon-mysql mysqldump -u root -p$$MYSQL_ROOT_PASSWORD pokemon_tactics > backups/pokemon_tactics_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}✅ Sauvegarde créée dans backups/${NC}"

restore: ## Restaure la base de données (BACKUP_FILE=fichier.sql)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "${RED}❌ Spécifiez le fichier: make restore BACKUP_FILE=fichier.sql${NC}"; \
		exit 1; \
	fi
	@echo "${BLUE}📂 Restauration de $(BACKUP_FILE)...${NC}"
	$(DOCKER_COMPOSE) exec -T pokemon-mysql mysql -u root -p$$MYSQL_ROOT_PASSWORD pokemon_tactics < $(BACKUP_FILE)
	@echo "${GREEN}✅ Base de données restaurée !${NC}"

# Nettoyage
clean: ## Nettoie les conteneurs arrêtés et les réseaux inutilisés
	@echo "${BLUE}🧹 Nettoyage...${NC}"
	docker container prune -f
	docker network prune -f
	docker volume prune -f

prune: ## Nettoie tout (images, conteneurs, volumes, réseaux)
	@echo "${YELLOW}⚠️  Nettoyage complet...${NC}"
	docker system prune -af --volumes

# Tests
test-backend: ## Exécute les tests du backend
	$(DOCKER_COMPOSE) run --rm pokemon-backend npm test

test-frontend: ## Exécute les tests du frontend
	$(DOCKER_COMPOSE) run --rm pokemon-frontend npm test

# Statut et monitoring
status: ## Affiche le statut des services
	@echo "${BLUE}📊 Statut des services:${NC}"
	$(DOCKER_COMPOSE) ps

health: ## Vérifie la santé des services
	@echo "${BLUE}🏥 Vérification de la santé...${NC}"
	@echo "Backend: $(shell curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health || echo 'Inaccessible')"
	@echo "Frontend: $(shell curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || echo 'Inaccessible')"

# Développement
dev-backend: ## Lance le backend en mode développement
	$(DOCKER_COMPOSE) run --rm -p 3001:3001 pokemon-backend npm run dev

dev-frontend: ## Lance le frontend en mode développement
	$(DOCKER_COMPOSE) run --rm -p 3000:3000 pokemon-frontend npm run dev

# Mise à jour
update: ## Met à jour et redémarre les services
	@echo "${BLUE}🔄 Mise à jour...${NC}"
	git pull
	$(MAKE) build
	$(MAKE) deploy

# Installation
install: ## Installation initiale complète
	@echo "${BLUE}🏗️  Installation initiale...${NC}"
	@if [ ! -f "$(ENV_FILE)" ]; then \
		cp .env.example $(ENV_FILE); \
		echo "${YELLOW}⚠️  Configurez $(ENV_FILE) avant de continuer${NC}"; \
	fi
	$(MAKE) build
	$(MAKE) deploy