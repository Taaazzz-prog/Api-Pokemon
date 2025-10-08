-- Gameplay tables for arena, tournaments, survival enhancements

CREATE TABLE `arena_matches` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `opponent_type` ENUM('AI','PLAYER') NOT NULL DEFAULT 'AI',
  `opponent_name` VARCHAR(191) NOT NULL,
  `result` ENUM('WIN','LOSS','DRAW') NOT NULL DEFAULT 'WIN',
  `reward_credits` INTEGER NOT NULL DEFAULT 0,
  `reward_gems` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tournament_participants` (
  `id` VARCHAR(191) NOT NULL,
  `tournament_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `tournament_participants_tournament_id_user_id_key`(`tournament_id`, `user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tournament_matches` (
  `id` VARCHAR(191) NOT NULL,
  `tournament_id` VARCHAR(191) NOT NULL,
  `round` INTEGER NOT NULL DEFAULT 1,
  `player1_id` VARCHAR(191) NULL,
  `player2_id` VARCHAR(191) NULL,
  `winner_id` VARCHAR(191) NULL,
  `status` ENUM('PENDING','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `scheduled_at` DATETIME(3) NULL,
  `completed_at` DATETIME(3) NULL,
  `score` JSON NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `arena_matches`
  ADD CONSTRAINT `arena_matches_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tournament_participants`
  ADD CONSTRAINT `tournament_participants_tournament_id_fkey`
    FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_participants_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tournament_matches`
  ADD CONSTRAINT `tournament_matches_tournament_id_fkey`
    FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_matches_player1_id_fkey`
    FOREIGN KEY (`player1_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_matches_player2_id_fkey`
    FOREIGN KEY (`player2_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tournament_matches_winner_id_fkey`
    FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
