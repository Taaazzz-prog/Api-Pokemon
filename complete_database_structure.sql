-- =========================================
-- STRUCTURE COMPLÈTE DE BASE DE DONNÉES
-- Pokemon Tactics Arena - Version Complète
-- =========================================

-- Suppression des tables existantes si elles existent
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS shop_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS arena_queue;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS survival_runs;
DROP TABLE IF EXISTS battles;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS team_presets;
DROP TABLE IF EXISTS user_roster;
DROP TABLE IF EXISTS pokemons;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- =========================================
-- 1. TABLE USERS - Données d'authentification
-- =========================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================================
-- 2. TABLE USER_PROFILES - Profils joueurs
-- =========================================
CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    poke_credits INT DEFAULT 2500,
    poke_gems INT DEFAULT 50,
    coins INT DEFAULT 1000,
    total_battles INT DEFAULT 0,
    total_victories INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_username (username),
    INDEX idx_level (level)
);

-- =========================================
-- 3. TABLE POKEMONS - Catalogue Pokémon
-- =========================================
CREATE TABLE pokemons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    national_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    types JSON NOT NULL,
    base_stats JSON NOT NULL,
    sprite_url VARCHAR(255),
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    generation INT DEFAULT 1,
    evolution_data JSON,
    abilities JSON,
    category VARCHAR(50),
    height DECIMAL(4,2),
    weight DECIMAL(6,2),
    description TEXT,
    is_starter BOOLEAN DEFAULT FALSE,
    is_legendary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_national_id (national_id),
    INDEX idx_rarity (rarity),
    INDEX idx_generation (generation),
    INDEX idx_types ((CAST(types AS CHAR(255) ARRAY)))
);

-- =========================================
-- 4. TABLE USER_ROSTER - Collection joueur
-- =========================================
CREATE TABLE user_roster (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    pokemon_id VARCHAR(36) NOT NULL,
    nickname VARCHAR(50),
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    iv_stats JSON NOT NULL,
    current_hp INT,
    max_hp INT,
    attack INT,
    defense INT,
    special_attack INT,
    special_defense INT,
    speed INT,
    is_shiny BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    caught_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_battle TIMESTAMP NULL,
    battle_count INT DEFAULT 0,
    victory_count INT DEFAULT 0,
    unlock_source ENUM('starter', 'shop', 'reward', 'event', 'wild') DEFAULT 'wild',
    pack_type ENUM('starter', 'premium', 'event') NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pokemon_id) REFERENCES pokemons(id) ON DELETE CASCADE,
    INDEX idx_user_pokemon (user_id, pokemon_id),
    INDEX idx_level (level),
    INDEX idx_unlock_source (unlock_source)
);

-- =========================================
-- 5. TABLE TEAM_PRESETS - Équipes sauvegardées
-- =========================================
CREATE TABLE team_presets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    preset_type ENUM('survival', 'tournament', 'arena', 'general') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active)
);

-- =========================================
-- 6. TABLE TEAM_MEMBERS - Membres d'équipe
-- =========================================
CREATE TABLE team_members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    team_id VARCHAR(36) NOT NULL,
    roster_pokemon_id VARCHAR(36) NOT NULL,
    position INT NOT NULL,
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team_presets(id) ON DELETE CASCADE,
    FOREIGN KEY (roster_pokemon_id) REFERENCES user_roster(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_position (team_id, position),
    INDEX idx_team_members (team_id)
);

-- =========================================
-- 7. TABLE BATTLES - Historique des combats
-- =========================================
CREATE TABLE battles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    battle_type ENUM('free', 'survival', 'tournament', 'arena') NOT NULL,
    opponent_type ENUM('ai', 'player') DEFAULT 'ai',
    opponent_id VARCHAR(36) NULL,
    player_team JSON NOT NULL,
    opponent_team JSON NOT NULL,
    result ENUM('victory', 'defeat') NOT NULL,
    duration_seconds INT,
    experience_gained INT DEFAULT 0,
    credits_earned INT DEFAULT 0,
    battle_data JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_battles (user_id, created_at),
    INDEX idx_battle_type (battle_type)
);

-- =========================================
-- 8. TABLE SURVIVAL_RUNS - Sessions survie
-- =========================================
CREATE TABLE survival_runs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    current_wave INT DEFAULT 1,
    max_wave_reached INT DEFAULT 1,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    team_snapshot JSON NOT NULL,
    rewards_earned JSON,
    total_experience INT DEFAULT 0,
    total_credits INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_runs (user_id, status),
    INDEX idx_max_wave (max_wave_reached)
);

-- =========================================
-- 9. TABLE TOURNAMENTS - Tournois
-- =========================================
CREATE TABLE tournaments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tournament_type ENUM('elimination', 'round-robin', 'swiss') DEFAULT 'elimination',
    status ENUM('registration', 'active', 'completed', 'cancelled') DEFAULT 'registration',
    max_participants INT DEFAULT 16,
    current_participants INT DEFAULT 0,
    entry_fee INT DEFAULT 0,
    entry_currency ENUM('credits', 'gems') DEFAULT 'credits',
    prize_pool JSON,
    rules JSON,
    start_time TIMESTAMP,
    end_time TIMESTAMP NULL,
    registration_deadline TIMESTAMP,
    min_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_start (status, start_time),
    INDEX idx_registration (registration_deadline)
);

-- =========================================
-- 10. TABLE ARENA_QUEUE - File d'attente arène
-- =========================================
CREATE TABLE arena_queue (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    rank_points INT DEFAULT 1000,
    current_rank ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master') DEFAULT 'bronze',
    season_id VARCHAR(36),
    team_preset_id VARCHAR(36),
    queue_status ENUM('searching', 'matched', 'in_battle', 'completed') DEFAULT 'searching',
    matched_opponent_id VARCHAR(36) NULL,
    battle_id VARCHAR(36) NULL,
    queue_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    match_time TIMESTAMP NULL,
    estimated_wait_minutes INT,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_preset_id) REFERENCES team_presets(id) ON DELETE SET NULL,
    FOREIGN KEY (matched_opponent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE SET NULL,
    INDEX idx_queue_status (queue_status, queue_time),
    INDEX idx_rank_search (current_rank, queue_status)
);

-- =========================================
-- 11. TABLE TRANSACTIONS - Historique achats
-- =========================================
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    transaction_type ENUM('purchase', 'reward', 'refund', 'admin') NOT NULL,
    item_type ENUM('pokemon', 'pack', 'item', 'currency') NOT NULL,
    item_id VARCHAR(100),
    quantity INT DEFAULT 1,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    currency ENUM('credits', 'gems', 'coins') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('in_game', 'stripe', 'paypal') DEFAULT 'in_game',
    payment_reference VARCHAR(255),
    items_received JSON,
    metadata JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_transactions (user_id, created_at),
    INDEX idx_status_type (status, transaction_type)
);

-- =========================================
-- 12. TABLE SHOP_ITEMS - Catalogue boutique
-- =========================================
CREATE TABLE shop_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    item_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type ENUM('pokemon', 'pack', 'item', 'currency', 'cosmetic') NOT NULL,
    price INT NOT NULL,
    currency ENUM('credits', 'gems', 'coins') NOT NULL,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    stock_quantity INT NULL,
    daily_limit INT NULL,
    required_level INT DEFAULT 1,
    discount_percentage INT DEFAULT 0,
    image_url VARCHAR(255),
    category VARCHAR(50),
    tags JSON,
    contents JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_availability (is_available, is_featured),
    INDEX idx_type_price (item_type, currency, price),
    INDEX idx_category (category)
);

-- =========================================
-- 13. TABLE EVENTS - Événements temporaires
-- =========================================
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_type ENUM('tournament', 'challenge', 'bonus', 'seasonal') NOT NULL,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    rewards JSON,
    requirements JSON,
    metadata JSON,
    max_participants INT NULL,
    current_participants INT DEFAULT 0,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_time (status, start_time, end_time),
    INDEX idx_event_type (event_type)
);

-- =========================================
-- 14. TABLE ACHIEVEMENTS - Succès disponibles
-- =========================================
CREATE TABLE achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    achievement_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('battle', 'collection', 'progression', 'social', 'special') NOT NULL,
    tier ENUM('bronze', 'silver', 'gold', 'legendary') DEFAULT 'bronze',
    icon_url VARCHAR(255),
    is_secret BOOLEAN DEFAULT FALSE,
    requirements JSON NOT NULL,
    rewards JSON,
    points INT DEFAULT 10,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_tier (category, tier),
    INDEX idx_active_rarity (is_active, rarity)
);

-- =========================================
-- 15. TABLE USER_ACHIEVEMENTS - Succès joueurs
-- =========================================
CREATE TABLE user_achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(36) NOT NULL,
    status ENUM('locked', 'in_progress', 'completed', 'claimed') DEFAULT 'locked',
    progress JSON,
    current_value INT DEFAULT 0,
    target_value INT NOT NULL,
    completed_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    rewards_received JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_completion (completed_at)
);

-- =========================================
-- DONNÉES D'EXEMPLE ET CONFIGURATION INITIALE
-- =========================================

-- Insertion de quelques Pokémon de base
INSERT INTO pokemons (national_id, name, types, base_stats, sprite_url, rarity, generation, is_starter) VALUES
(1, 'Bulbasaur', '["Grass", "Poison"]', '{"hp": 45, "attack": 49, "defense": 49, "special_attack": 65, "special_defense": 65, "speed": 45}', '/images/pokemon/1.png', 'common', 1, TRUE),
(4, 'Charmander', '["Fire"]', '{"hp": 39, "attack": 52, "defense": 43, "special_attack": 60, "special_defense": 50, "speed": 65}', '/images/pokemon/4.png', 'common', 1, TRUE),
(7, 'Squirtle', '["Water"]', '{"hp": 44, "attack": 48, "defense": 65, "special_attack": 50, "special_defense": 64, "speed": 43}', '/images/pokemon/7.png', 'common', 1, TRUE),
(25, 'Pikachu', '["Electric"]', '{"hp": 35, "attack": 55, "defense": 40, "special_attack": 50, "special_defense": 50, "speed": 90}', '/images/pokemon/25.png', 'uncommon', 1, FALSE),
(150, 'Mewtwo', '["Psychic"]', '{"hp": 106, "attack": 110, "defense": 90, "special_attack": 154, "special_defense": 90, "speed": 130}', '/images/pokemon/150.png', 'legendary', 1, FALSE);

-- Insertion d'articles de boutique de base
INSERT INTO shop_items (item_id, name, description, item_type, price, currency, rarity, category, contents) VALUES
('starter-pack', 'Pack Starter', '3 Pokémon aléatoires garantis', 'pack', 1500, 'credits', 'common', 'packs', '["3 Pokemon Cards", "Guaranteed Common+"]'),
('rare-pack', 'Pack Rare', '5 Pokémon avec 1 rare garanti', 'pack', 15, 'gems', 'rare', 'packs', '["5 Pokemon Cards", "Guaranteed Rare+", "Bonus Items"]'),
('legendary-pack', 'Pack Légendaire', '1 légendaire garanti + 2 rares', 'pack', 50, 'gems', 'legendary', 'packs', '["1 Legendary", "2 Rare Pokemon", "Exclusive Items"]'),
('pokeball', 'Pokéball', 'Pokéball standard pour captures', 'item', 200, 'credits', 'common', 'items', NULL),
('great-ball', 'Super Ball', 'Pokéball améliorée', 'item', 600, 'credits', 'uncommon', 'items', NULL),
('ultra-ball', 'Hyper Ball', 'Pokéball très efficace', 'item', 1200, 'credits', 'rare', 'items', NULL),
('master-ball', 'Master Ball', 'Capture garantie', 'item', 5, 'gems', 'legendary', 'items', NULL),
('potion', 'Potion', 'Restaure 20 HP', 'item', 300, 'credits', 'common', 'items', NULL),
('super-potion', 'Super Potion', 'Restaure 60 HP', 'item', 700, 'credits', 'uncommon', 'items', NULL),
('hyper-potion', 'Hyper Potion', 'Restaure 120 HP', 'item', 1500, 'credits', 'rare', 'items', NULL);

-- Insertion de succès de base
INSERT INTO achievements (achievement_id, name, description, category, tier, requirements, rewards, points) VALUES
('first-victory', 'Première Victoire', 'Remportez votre premier combat', 'battle', 'bronze', '{"battles_won": 1}', '{"poke_credits": 200, "poke_gems": 2}', 10),
('10-victories', 'Vétéran', 'Remportez 10 combats', 'battle', 'silver', '{"battles_won": 10}', '{"poke_credits": 500, "poke_gems": 5}', 25),
('first-pokemon', 'Dresseur Novice', 'Capturez votre premier Pokémon', 'collection', 'bronze', '{"pokemon_caught": 1}', '{"poke_credits": 100}', 5),
('10-pokemon', 'Collectionneur', 'Possédez 10 Pokémon différents', 'collection', 'silver', '{"pokemon_caught": 10}', '{"poke_credits": 1000, "poke_gems": 10}', 50),
('level-10', 'Dresseur Expérimenté', 'Atteignez le niveau 10', 'progression', 'silver', '{"level": 10}', '{"poke_credits": 1500, "poke_gems": 15}', 75),
('tournament-winner', 'Champion de Tournoi', 'Remportez un tournoi', 'battle', 'gold', '{"tournaments_won": 1}', '{"poke_credits": 5000, "poke_gems": 50}', 200),
('survival-wave-20', 'Survivant Ultime', 'Atteignez la vague 20 en mode Survie', 'battle', 'gold', '{"max_survival_wave": 20}', '{"poke_credits": 3000, "poke_gems": 30}', 150);

-- =========================================
-- INDEX ADDITIONNELS POUR PERFORMANCE
-- =========================================

-- Index pour les requêtes fréquentes
CREATE INDEX idx_user_roster_active ON user_roster(user_id, is_favorite, level DESC);
CREATE INDEX idx_battles_recent ON battles(user_id, created_at DESC);
CREATE INDEX idx_transactions_recent ON transactions(user_id, created_at DESC, status);
CREATE INDEX idx_achievements_progress ON user_achievements(user_id, status, current_value);
CREATE INDEX idx_shop_featured ON shop_items(is_available, is_featured, category);

-- =========================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =========================================

DELIMITER //

-- Trigger pour mettre à jour les statistiques du profil après un combat
CREATE TRIGGER update_profile_after_battle
    AFTER INSERT ON battles
    FOR EACH ROW
BEGIN
    UPDATE user_profiles 
    SET 
        total_battles = total_battles + 1,
        total_victories = total_victories + (CASE WHEN NEW.result = 'victory' THEN 1 ELSE 0 END),
        win_rate = (total_victories * 100.0) / total_battles,
        current_streak = CASE 
            WHEN NEW.result = 'victory' THEN current_streak + 1 
            ELSE 0 
        END,
        best_streak = GREATEST(best_streak, current_streak),
        experience = experience + NEW.experience_gained,
        poke_credits = poke_credits + NEW.credits_earned
    WHERE user_id = NEW.user_id;
END//

-- Trigger pour calculer le niveau basé sur l'expérience
CREATE TRIGGER update_level_from_experience
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
BEGIN
    -- Calcul du niveau basé sur l'expérience (300 XP par niveau)
    SET NEW.level = FLOOR(NEW.experience / 300) + 1;
END//

DELIMITER ;

-- =========================================
-- VUES POUR REQUÊTES COMPLEXES
-- =========================================

-- Vue pour le leaderboard global
CREATE VIEW leaderboard_global AS
SELECT 
    up.user_id,
    up.username,
    up.level,
    up.total_victories,
    up.win_rate,
    up.best_streak,
    up.avatar_url,
    ROW_NUMBER() OVER (ORDER BY up.level DESC, up.total_victories DESC, up.win_rate DESC) as rank_position
FROM user_profiles up
WHERE up.level > 1
ORDER BY rank_position;

-- Vue pour les statistiques de collection par utilisateur
CREATE VIEW user_collection_stats AS
SELECT 
    ur.user_id,
    COUNT(*) as total_pokemon,
    COUNT(CASE WHEN p.rarity = 'legendary' THEN 1 END) as legendary_count,
    COUNT(CASE WHEN p.rarity = 'epic' THEN 1 END) as epic_count,
    COUNT(CASE WHEN p.rarity = 'rare' THEN 1 END) as rare_count,
    COUNT(CASE WHEN ur.is_shiny = TRUE THEN 1 END) as shiny_count,
    AVG(ur.level) as avg_pokemon_level,
    MAX(ur.level) as max_pokemon_level
FROM user_roster ur
JOIN pokemons p ON ur.pokemon_id = p.id
GROUP BY ur.user_id;

-- =========================================
-- FIN DU SCRIPT
-- =========================================

-- Affichage d'un résumé de la structure créée
SELECT 'BASE DE DONNÉES COMPLÈTE CRÉÉE AVEC SUCCÈS!' as status;
SELECT 
    'Tables créées:' as info,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = DATABASE() 
     AND table_name IN (
         'users', 'user_profiles', 'pokemons', 'user_roster', 
         'team_presets', 'team_members', 'battles', 'survival_runs',
         'tournaments', 'arena_queue', 'transactions', 'shop_items',
         'events', 'achievements', 'user_achievements'
     )) as table_count;