-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : pokemon-mysql:3306
-- Généré le : mar. 07 oct. 2025 à 07:35
-- Version du serveur : 8.0.43
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pokemon_tactics_arena`
--

-- --------------------------------------------------------

--
-- Structure de la table `achievements`
--

CREATE TABLE `achievements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('BATTLE','COLLECTION','PROGRESSION','SPECIAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('COUNTER','MILESTONE','UNLOCK') COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirements` json NOT NULL,
  `rewards` json NOT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `arena_queue`
--

CREATE TABLE `arena_queue` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team` json NOT NULL,
  `elo_rating` int NOT NULL DEFAULT '1200',
  `rank` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bronze',
  `queued_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `matched_at` datetime(3) DEFAULT NULL,
  `status` enum('WAITING','MATCHED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WAITING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `battles`
--

CREATE TABLE `battles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_mode` enum('FREE','SURVIVAL','TOURNAMENT','ARENA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `opponent_type` enum('AI','PLAYER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `opponent_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_team` json NOT NULL,
  `opponent_team` json NOT NULL,
  `result` enum('WIN','LOSS','DRAW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_score` int NOT NULL DEFAULT '0',
  `opponent_score` int NOT NULL DEFAULT '0',
  `duration` int NOT NULL DEFAULT '0',
  `payload` json NOT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

CREATE TABLE `events` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('SEASONAL','DAILY','WEEKLY','SPECIAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `rewards` json NOT NULL,
  `requirements` json NOT NULL,
  `metadata` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `pokemons`
--

CREATE TABLE `pokemons` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pokemon_id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `types` json NOT NULL,
  `stats` json NOT NULL,
  `rarity` enum('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `generation` int NOT NULL,
  `image_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evolutions` json NOT NULL,
  `moves` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `shop_items`
--

CREATE TABLE `shop_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('POKEMON','ITEMS','COSMETICS','BUNDLES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rarity` enum('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_currency` enum('POKE_CREDITS','POKE_GEMS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_amount` int NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `stock_limit` int DEFAULT NULL,
  `metadata` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `survival_runs`
--

CREATE TABLE `survival_runs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initial_team` json NOT NULL,
  `current_wave` int NOT NULL DEFAULT '1',
  `max_wave` int NOT NULL DEFAULT '1',
  `score` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','COMPLETED','ABANDONED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `rewards` json NOT NULL,
  `payload` json NOT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `team_members`
--

CREATE TABLE `team_members` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_preset_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_roster_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pokemon_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `team_presets`
--

CREATE TABLE `team_presets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `game_mode` enum('FREE','SURVIVAL','TOURNAMENT','ARENA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tournaments`
--

CREATE TABLE `tournaments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` enum('SINGLE_ELIMINATION','DOUBLE_ELIMINATION','ROUND_ROBIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACTIVE','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `current_round` int NOT NULL DEFAULT '1',
  `max_rounds` int NOT NULL,
  `participants` json NOT NULL,
  `brackets` json NOT NULL,
  `rewards` json NOT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('CREDIT','DEBIT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` enum('POKE_CREDITS','POKE_GEMS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int NOT NULL,
  `balance_before` int NOT NULL,
  `balance_after` int NOT NULL,
  `source` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_achievements`
--

CREATE TABLE `user_achievements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `achievement_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `progress` json NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `is_claimed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime(3) DEFAULT NULL,
  `claimed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int NOT NULL DEFAULT '1',
  `experience` int NOT NULL DEFAULT '0',
  `total_battles` int NOT NULL DEFAULT '0',
  `total_wins` int NOT NULL DEFAULT '0',
  `win_rate` double NOT NULL DEFAULT '0',
  `poke_credits` int NOT NULL DEFAULT '0',
  `poke_gems` int NOT NULL DEFAULT '0',
  `settings` json NOT NULL,
  `stats` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_roster`
--

CREATE TABLE `user_roster` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pokemon_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int NOT NULL DEFAULT '1',
  `experience` int NOT NULL DEFAULT '0',
  `custom_stats` json DEFAULT NULL,
  `obtained_from` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `obtained_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `arena_queue`
--
ALTER TABLE `arena_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `arena_queue_user_id_fkey` (`user_id`);

--
-- Index pour la table `battles`
--
ALTER TABLE `battles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `battles_user_id_fkey` (`user_id`);

--
-- Index pour la table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `pokemons`
--
ALTER TABLE `pokemons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pokemons_pokemon_id_key` (`pokemon_id`);

--
-- Index pour la table `shop_items`
--
ALTER TABLE `shop_items`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `survival_runs`
--
ALTER TABLE `survival_runs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survival_runs_user_id_fkey` (`user_id`);

--
-- Index pour la table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `team_members_team_preset_id_position_key` (`team_preset_id`,`position`),
  ADD KEY `team_members_user_roster_id_fkey` (`user_roster_id`),
  ADD KEY `team_members_pokemon_id_fkey` (`pokemon_id`);

--
-- Index pour la table `team_presets`
--
ALTER TABLE `team_presets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_presets_user_id_fkey` (`user_id`);

--
-- Index pour la table `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournaments_user_id_fkey` (`user_id`);

--
-- Index pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_user_id_fkey` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Index pour la table `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_achievements_user_id_achievement_id_key` (`user_id`,`achievement_id`),
  ADD KEY `user_achievements_achievement_id_fkey` (`achievement_id`);

--
-- Index pour la table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_profiles_user_id_key` (`user_id`),
  ADD UNIQUE KEY `user_profiles_username_key` (`username`);

--
-- Index pour la table `user_roster`
--
ALTER TABLE `user_roster`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roster_user_id_pokemon_id_key` (`user_id`,`pokemon_id`),
  ADD KEY `user_roster_pokemon_id_fkey` (`pokemon_id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `arena_queue`
--
ALTER TABLE `arena_queue`
  ADD CONSTRAINT `arena_queue_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Contraintes pour la table `battles`
--
ALTER TABLE `battles`
  ADD CONSTRAINT `battles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Contraintes pour la table `survival_runs`
--
ALTER TABLE `survival_runs`
  ADD CONSTRAINT `survival_runs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Contraintes pour la table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `team_members_pokemon_id_fkey` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemons` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `team_members_team_preset_id_fkey` FOREIGN KEY (`team_preset_id`) REFERENCES `team_presets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `team_members_user_roster_id_fkey` FOREIGN KEY (`user_roster_id`) REFERENCES `user_roster` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Contraintes pour la table `team_presets`
--
ALTER TABLE `team_presets`
  ADD CONSTRAINT `team_presets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `tournaments`
--
ALTER TABLE `tournaments`
  ADD CONSTRAINT `tournaments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Contraintes pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `user_achievements_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `user_achievements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_roster`
--
ALTER TABLE `user_roster`
  ADD CONSTRAINT `user_roster_pokemon_id_fkey` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemons` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roster_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
