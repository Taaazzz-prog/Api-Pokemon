# 🎮 Pokemon Tactics Arena v2 - Guide d'Utilisation

## 🚀 Comment Lancer le Jeu

### Prérequis
- Docker et Docker Compose installés
- Node.js 18+ (pour le développement)
- Git

### 1. Lancement Complet (Production)
```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd pokemon-tactics-arena-v2

# Démarrer tous les services avec Docker
docker-compose up -d

# Attendre que tous les services soient prêts (2-3 minutes)
docker-compose logs -f
```

**Services disponibles :**
- 🎮 **Jeu** : http://localhost:3000
- 🗄️ **Base de données** : http://localhost:8081 (phpMyAdmin)
- 🔧 **API Backend** : http://localhost:3001
- 📊 **Monitoring** : http://localhost:3002 (Grafana)

### 2. Lancement Développement (Frontend uniquement)
```bash
# Naviguer vers le frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

**Accès développement :**
- 🎮 **Frontend** : http://localhost:5173 ou http://localhost:5174

---

## 🗄️ Accès à la Base de Données

### Interface Visuelle - phpMyAdmin

**URL d'accès :** http://localhost:8081

**Identifiants de connexion :**
- **Utilisateur :** `root`
- **Mot de passe :** `pokemon_root_pass_dev`
- **Base de données :** `pokemon_tactics_arena`

### Informations de Connexion Directe

**Configuration MySQL :**
- **Host :** `localhost`
- **Port :** `3307`
- **Base de données :** `pokemon_tactics_arena`
- **Utilisateur applicatif :** `pokemon_user`
- **Mot de passe applicatif :** `pokemon_pass_dev`

### Tables Principales

La base de données contient les tables suivantes :

#### 👤 Utilisateurs & Authentification
- `users` - Comptes utilisateurs
- `user_profiles` - Profils utilisateurs (niveau, expérience, monnaies)
- `sessions` - Sessions utilisateur

#### 🎯 Pokémon & Collection
- `pokemon` - Données des Pokémon (stats, types, moves)
- `user_pokemon` - Collection personnelle des utilisateurs
- `pokemon_moves` - Attaques des Pokémon
- `pokemon_types` - Types et leurs relations

#### 👥 Équipes & Combat
- `teams` - Équipes des utilisateurs
- `team_pokemon` - Composition des équipes
- `battles` - Historique des combats
- `battle_participants` - Participants aux combats

#### 🏪 Économie & Boutique
- `shop_items` - Objets de la boutique
- `user_purchases` - Historique des achats
- `user_currency_logs` - Logs des transactions de monnaie

#### 🏆 Compétition
- `tournaments` - Tournois
- `tournament_participants` - Participants aux tournois
- `arena_matches` - Matchs d'arène
- `leaderboards` - Classements

---

## 🏗️ Architecture de Stockage des Données

### ✅ Stockage en Base de Données MySQL

Toutes les données du jeu sont stockées dans la base de données MySQL :

#### 📊 Données Utilisateur
- **Profil** : niveau, expérience, crédits, gemmes
- **Collection Pokémon** : tous les Pokémon possédés avec leurs stats
- **Équipes** : compositions d'équipes sauvegardées
- **Progression** : succès, quêtes, historique

#### 🎮 Données de Jeu
- **Combats** : historique complet des combats
- **Tournois** : participation et résultats
- **Achats** : historique des transactions
- **Statistiques** : performances et analytics

#### 🔄 Persistance Garantie
- **Sauvegarde automatique** après chaque action
- **Transactions atomiques** pour la cohérence des données
- **Backup automatisé** via Docker volumes
- **Récupération** possible même après suppression du cache navigateur

### ❌ Pas de localStorage

Le jeu **N'UTILISE PAS** le localStorage du navigateur pour les données importantes :
- ✅ Seuls les tokens d'authentification temporaires sont en localStorage
- ✅ Toutes les données de progression sont en base de données
- ✅ Suppression des cookies/cache = aucune perte de données
- ✅ Connexion possible depuis n'importe quel appareil

---

## 🔧 Commandes Utiles

### Docker
```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f [service-name]

# Redémarrer un service
docker-compose restart [service-name]

# Rebuild complet
docker-compose down && docker-compose up --build -d
```

### Base de Données
```bash
# Accès direct MySQL
docker exec -it pokemon-mysql mysql -u root -p

# Backup de la base
docker exec pokemon-mysql mysqldump -u root -ppokemon_root_pass_dev pokemon_tactics_arena > backup.sql

# Restore de la base
docker exec -i pokemon-mysql mysql -u root -ppokemon_root_pass_dev pokemon_tactics_arena < backup.sql
```

### Développement
```bash
# Frontend
cd frontend
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build

# Backend
cd backend
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Démarrage production
```

---

## 🐛 Dépannage

### Problèmes Courants

#### Le jeu ne se lance pas
1. Vérifier que Docker est démarré
2. Vérifier les ports (3000, 3001, 3307, 8081)
3. Regarder les logs : `docker-compose logs -f`

#### Problème de base de données
1. Accéder à phpMyAdmin : http://localhost:8081
2. Vérifier la connectivité avec les identifiants
3. Redémarrer le service MySQL : `docker-compose restart pokemon-mysql`

#### Données perdues
- **Impossible** si vous utilisez la base de données
- Vérifier la connexion à MySQL dans les logs backend
- Vérifier que le service `pokemon-mysql` est en cours d'exécution

### Logs Importants
```bash
# Logs de l'application
docker-compose logs -f pokemon-backend

# Logs de la base de données
docker-compose logs -f pokemon-mysql

# Logs de tous les services
docker-compose logs -f
```

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs Docker
2. Vérifier l'accès à phpMyAdmin
3. Contrôler que tous les services Docker sont actifs
4. S'assurer que les ports ne sont pas utilisés par d'autres applications

**Services essentiels à vérifier :**
- ✅ `pokemon-mysql` (Base de données)
- ✅ `pokemon-backend` (API)
- ✅ `pokemon-frontend` (Interface web)
- ✅ `pokemon-phpmyadmin` (Interface DB)

---

*Dernière mise à jour : 6 octobre 2025*