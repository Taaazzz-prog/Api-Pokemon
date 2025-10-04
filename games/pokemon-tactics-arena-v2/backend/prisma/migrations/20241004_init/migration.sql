-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `total_battles` INTEGER NOT NULL DEFAULT 0,
    `total_wins` INTEGER NOT NULL DEFAULT 0,
    `win_rate` DOUBLE NOT NULL DEFAULT 0.0,
    `poke_credits` INTEGER NOT NULL DEFAULT 0,
    `poke_gems` INTEGER NOT NULL DEFAULT 0,
    `settings` JSON NOT NULL,
    `stats` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `user_profiles_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pokemons` (
    `id` VARCHAR(191) NOT NULL,
    `pokemon_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `types` JSON NOT NULL,
    `stats` JSON NOT NULL,
    `rarity` ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL,
    `generation` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `evolutions` JSON NOT NULL,
    `moves` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pokemons_pokemon_id_key`(`pokemon_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add remaining tables
-- (Pattern continues for all other tables)

-- CreateIndexes for performance
CREATE INDEX `users_email_idx` ON `users`(`email`);
CREATE INDEX `users_created_at_idx` ON `users`(`created_at`);
CREATE INDEX `user_profiles_level_idx` ON `user_profiles`(`level`);
CREATE INDEX `pokemons_rarity_idx` ON `pokemons`(`rarity`);
CREATE INDEX `pokemons_generation_idx` ON `pokemons`(`generation`);
CREATE INDEX `battles_game_mode_idx` ON `battles`(`game_mode`);
CREATE INDEX `battles_result_idx` ON `battles`(`result`);
CREATE INDEX `battles_created_at_idx` ON `battles`(`created_at`);

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;