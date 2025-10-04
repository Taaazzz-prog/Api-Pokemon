# Domain Model & Contrat API

## 1. Principes généraux
- **Identifiants** : UUID v4 pour les entités métier (users, rosters, battles, purchases). Les ids Pokémon restent numériques (`pokemon_ref`).
- **Horodatage** : champs `created_at`, `updated_at` (UTC, ISO8601) et `deleted_at` pour le soft-delete.
- **Statuts** : utiliser `status` (`active`, `archived`, `locked`) pour les ressources exposées.
- **Monnaies** : deux devises principales (PokeCredits, PokeGems) avec journalisation systématique (`transactions`).
- **Structures partagées** : exporter des types communs (TypeScript) pour éviter les divergences front/back.

## 2. Schéma base de données (MySQL 8.0+)

### `users`
- `id` CHAR(36) PK (UUID v4)
- `email` VARCHAR(255) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `display_name` VARCHAR(36) NOT NULL
- `avatar_url` TEXT
- `locale` VARCHAR(8) DEFAULT 'en'
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `deleted_at` TIMESTAMP NULL

**Index :** `idx_email`, `idx_deleted_at`

### `user_profiles`
- `user_id` CHAR(36) PK FK users(id) ON DELETE CASCADE
- `level` INT DEFAULT 1
- `xp` INT DEFAULT 0
- `credits` INT DEFAULT 0
- `gems` INT DEFAULT 0
- `best_survival_wave` INT DEFAULT 0
- `arena_rating` INT DEFAULT 1000
- `settings` JSON (options UI, audio…)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**Index :** `idx_level`, `idx_arena_rating`

### `pokemons`
- `pokemon_ref` INT PK
- `name` VARCHAR(100) NOT NULL
- `types` JSON NOT NULL
  - Format: `[{"name": "fire"}, {"name": "flying"}]`
- `stats` JSON NOT NULL
  - Format: `{"HP": 78, "attack": 84, "defense": 78, "special_attack": 109, "special_defense": 85, "speed": 100}`
- `rarity` ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL
- `generation` TINYINT NOT NULL
- `base_price` INT DEFAULT 0
- `image_url` TEXT
- `evolutions` JSON
  - Format: `[{"level": 16, "to": 5, "method": "level"}]`

**Index :** `idx_rarity`, `idx_generation`, `idx_name`

### `user_roster`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id) ON DELETE CASCADE
- `pokemon_ref` INT FK pokemons(pokemon_ref)
- `rarity_override` ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NULL
- `source` ENUM('starter', 'drop', 'purchase', 'event') NOT NULL
- `acquired_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `is_locked` BOOLEAN DEFAULT FALSE

**Index :** `idx_user_pokemon` (user_id, pokemon_ref), `idx_source`, `idx_acquired_at`

### `team_presets`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id) ON DELETE CASCADE
- `name` VARCHAR(32) NOT NULL
- `context` ENUM('free', 'survival', 'arena', 'tournament') NOT NULL
- `slots` JSON NOT NULL
  - Format: `[{"position": 1, "pokemon_ref": 6, "item_ref": null}]`
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**Index :** `idx_user_context` (user_id, context)

### `battles`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id)
- `mode` ENUM('free', 'survival', 'tournament', 'arena') NOT NULL
- `payload` JSON NOT NULL
  - Format: `{"teams": {...}, "seed": 12345, "log": [...], "outcome": "player"}`
- `outcome` ENUM('player', 'opponent', 'draw') NOT NULL
- `turns` INT NOT NULL
- `reward_credits` INT DEFAULT 0
- `reward_xp` INT DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Index :** `idx_user_mode` (user_id, mode), `idx_created_at`

### `survival_runs`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id) ON DELETE CASCADE
- `current_wave` INT DEFAULT 1
- `team_snapshot` JSON NOT NULL
- `status` ENUM('ongoing', 'completed', 'aborted') DEFAULT 'ongoing'
- `rewards_claimed` JSON
  - Format: `[{"wave": 5, "rewards": [...]}]`
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**Index :** `idx_user_status` (user_id, status), `idx_current_wave`

### `tournaments`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id) ON DELETE CASCADE
- `bracket_state` JSON NOT NULL
  - Format: `{"quarter": {...}, "semi": {...}, "final": {...}}`
- `stage` ENUM('quarter', 'semi', 'final', 'completed') DEFAULT 'quarter'
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**Index :** `idx_user_stage` (user_id, stage)

### `arena_queue`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id) ON DELETE CASCADE
- `team_snapshot` JSON NOT NULL
- `rating` INT NOT NULL
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Index :** `idx_rating`, `idx_created_at`

### `transactions`
- `id` CHAR(36) PK (UUID v4)
- `user_id` CHAR(36) FK users(id)
- `type` ENUM('reward', 'purchase', 'conversion', 'refund') NOT NULL
- `currency` ENUM('credits', 'gems') NOT NULL
- `amount` INT NOT NULL
- `meta` JSON
  - Format: `{"source": "battle_win", "item_id": "...", "description": "..."}`
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Index :** `idx_user_type` (user_id, type), `idx_created_at`

### `shop_items`
- `id` CHAR(36) PK (UUID v4)
- `category` ENUM('pokemon', 'item', 'cosmetic', 'bundle') NOT NULL
- `payload` JSON NOT NULL
  - Format: `{"pokemon_ref": 25, "shiny": true, "level": 10}`
- `price_currency` ENUM('credits', 'gems') NOT NULL
- `price_amount` INT NOT NULL
- `rarity` ENUM('common', 'uncommon', 'rare', 'epic', 'legendary')
- `availability` JSON
  - Format: `{"start": "2025-01-01", "end": "2025-12-31", "stock": 100}`
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**Index :** `idx_category_rarity` (category, rarity), `idx_price`

### `events`
- `id` CHAR(36) PK (UUID v4)
- `name` VARCHAR(100) NOT NULL
- `description` TEXT
- `type` ENUM('booster', 'seasonal', 'leaderboard') NOT NULL
- `config` JSON
  - Format: `{"xp_multiplier": 2.0, "drop_rate_boost": 0.5}`
- `start_at` TIMESTAMP NOT NULL
- `end_at` TIMESTAMP NOT NULL

**Index :** `idx_type`, `idx_dates` (start_at, end_at)

### `achievements`
- `id` CHAR(36) PK (UUID v4)
- `slug` VARCHAR(100) UNIQUE NOT NULL
- `title` VARCHAR(100) NOT NULL
- `description` TEXT
- `criteria` JSON NOT NULL
  - Format: `{"type": "battles_won", "target": 100, "mode": "survival"}`
- `rewards` JSON NOT NULL
  - Format: `[{"type": "credits", "amount": 1000}, {"type": "gems", "amount": 50}]`
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Index :** `idx_slug`

### `user_achievements`
- `user_id` CHAR(36) FK users(id) ON DELETE CASCADE
- `achievement_id` CHAR(36) FK achievements(id) ON DELETE CASCADE
- `progress` JSON
  - Format: `{"current": 45, "target": 100}`
- `unlocked_at` TIMESTAMP NULL

**Clé primaire composée :** (user_id, achievement_id)
**Index :** `idx_unlocked_at`

## 3. Contrat API (REST JSON)

### Authentification
- `POST /auth/register` → `{ email, password, display_name }`
  - Réponse : `{ access_token, refresh_token, user }`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Profil & progression
- `GET /profile` → `{ user, stats, currencies, achievements }`
- `PATCH /profile` → mise à jour avatar, pseudo, settings
- `GET /leaderboards/{mode}` → classements par mode

### Roster & équipes
- `GET /roster` → liste Pokémon possédés
- `POST /roster/unlock` → acquisition (starter, drop, achat)
- `GET /teams` / `POST /teams` / `DELETE /teams/{id}`
- `POST /teams/{id}/lock` → verrouille un preset

### Modes de jeu
- `POST /modes/free/match`
- `POST /modes/survival/start` → `{ run_id, wave, team_snapshot }`
- `POST /modes/survival/next` → prochaine vague
- `POST /modes/survival/abandon`
- `POST /modes/tournament/start` / `POST /modes/tournament/next`
- `POST /modes/arena/queue` / `POST /modes/arena/result`

### Boutique & transactions
- `GET /shop/catalog?category=&rarity=`
- `POST /shop/purchase` → valide l'achat, retourne transaction + récompenses
- `GET /transactions?limit=`

### Centres spécialisés
- `POST /evolution/trigger`
- `POST /training/start`
- `POST /customization/apply`
- `GET /progression/summary`
- `GET /achievements`
- `POST /achievements/claim`

## 4. Variables partagées (TypeScript)
```ts