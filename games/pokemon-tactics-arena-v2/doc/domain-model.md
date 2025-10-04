# Domain Model & Contrat API

## 1. Principes généraux
- **Identifiants** : UUID v4 pour les entités métier (users, rosters, battles, purchases). Les ids Pokémon restent numériques (`pokemon_ref`).
- **Horodatage** : champs `created_at`, `updated_at` (UTC, ISO8601) et `deleted_at` pour le soft-delete.
- **Statuts** : utiliser `status` (`active`, `archived`, `locked`) pour les ressources exposées.
- **Monnaies** : deux devises principales (PokeCredits, PokeGems) avec journalisation systématique (`transactions`).
- **Structures partagées** : exporter des types communs (TypeScript) pour éviter les divergences front/back.

## 2. Schéma base de données (PostgreSQL)

### `users`
- `id` uuid PK
- `email` text unique
- `password_hash` text
- `display_name` varchar(36)
- `avatar_url` text
- `locale` varchar(8)
- `created_at`, `updated_at`, `deleted_at`

### `user_profiles`
- `user_id` FK users
- `level` int
- `xp` int
- `credits` int
- `gems` int
- `best_survival_wave` int
- `arena_rating` int
- `settings` jsonb (options UI, audio…)
- `created_at`, `updated_at`

### `pokemons`
- `pokemon_ref` int PK
- `name` text
- `types` jsonb [{ name }]
- `stats` jsonb `{ HP, attack, defense, special_attack, special_defense, speed }`
- `rarity` enum (`common`, `uncommon`, `rare`, `epic`, `legendary`)
- `generation` int
- `base_price` int
- `image_url` text
- `evolutions` jsonb (liste evolutions)

### `user_roster`
- `id` uuid PK
- `user_id` FK users
- `pokemon_ref` FK pokemons
- `rarity_override` enum nullable
- `source` enum (`starter`, `drop`, `purchase`, `event`)
- `acquired_at` timestamp
- `is_locked` bool (true si Pokémon protégé)

### `team_presets`
- `id` uuid PK
- `user_id`
- `name` varchar(32)
- `context` enum (`free`, `survival`, `arena`, `tournament`)
- `slots` jsonb (liste { position, pokemon_ref, item_ref })
- `created_at`, `updated_at`

### `battles`
- `id` uuid
- `user_id`
- `mode` enum (`free`, `survival`, `tournament`, `arena`)
- `payload` jsonb (équipes, seed, log, outcome)
- `outcome` enum (`player`, `opponent`, `draw`)
- `turns` int
- `reward_credits` int
- `reward_xp` int
- `created_at`

### `survival_runs`
- `id` uuid
- `user_id`
- `current_wave` int
- `team_snapshot` jsonb
- `status` enum (`ongoing`, `completed`, `aborted`)
- `rewards_claimed` jsonb
- `created_at`, `updated_at`

### `tournaments`
- `id` uuid
- `user_id`
- `bracket_state` jsonb
- `stage` enum (`quarter`, `semi`, `final`, `completed`)
- `created_at`, `updated_at`

### `arena_queue`
- `id` uuid
- `user_id`
- `team_snapshot` jsonb
- `rating` int
- `created_at`

### `transactions`
- `id` uuid
- `user_id`
- `type` enum (`reward`, `purchase`, `conversion`, `refund`)
- `currency` enum (`credits`, `gems`)
- `amount` int
- `meta` jsonb (source, item, description)
- `created_at`

### `shop_items`
- `id` uuid
- `category` enum (`pokemon`, `item`, `cosmetic`, `bundle`)
- `payload` jsonb (détails)
- `price_currency` enum
- `price_amount` int
- `rarity` enum
- `availability` jsonb (dates, stock)
- `created_at`, `updated_at`

### `events`
- `id` uuid
- `name` text
- `description` text
- `type` enum (`booster`, `seasonal`, `leaderboard`)
- `config` jsonb (modificateurs, bonus)
- `start_at`, `end_at`

### `achievements`
- `id` uuid
- `slug` text unique
- `title`, `description`
- `criteria` jsonb
- `rewards` jsonb
- `created_at`

### `user_achievements`
- `user_id`
- `achievement_id`
- `progress` jsonb `{ current, target }`
- `unlocked_at`

## 3. Contrat API (REST JSON)

### Authentification
- `POST /auth/register` → `{ email, password, display_name }`
  - Réponse : `{ access_token, refresh_token, user }`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Profil & progression
- `GET /profile` → `{ user, stats, currencies, achievements }`
- `PATCH /profile` → mise à jour avatar, pseudo, settings.
- `GET /leaderboards/{mode}`

### Roster & équipes
- `GET /roster` → liste Pokémon possédés.
- `POST /roster/unlock` → acquisition (starter, drop, achat).
- `GET /teams` / `POST /teams` / `DELETE /teams/{id}`
- `POST /teams/{id}/lock` → verrouille un preset.

### Modes de jeu
- `POST /modes/free/match`
- `POST /modes/survival/start` → `{ run_id, wave, team_snapshot }`
- `POST /modes/survival/next` → prochaine vague.
- `POST /modes/survival/abandon`
- `POST /modes/tournament/start` / `POST /modes/tournament/next`
- `POST /modes/arena/queue` / `POST /modes/arena/result`

### Boutique & transactions
- `GET /shop/catalog?category=&rarity=`
- `POST /shop/purchase` → valide l achat, retourne transaction + récompenses.
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
type Currency = 'credits' | 'gems';
type Mode = 'free' | 'survival' | 'tournament' | 'arena';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface UserSummary {
  id: string;
  displayName: string;
  level: number;
  xp: number;
  credits: number;
  gems: number;
}

interface RosterEntry {
  id: string;
  pokemonRef: number;
  rarity: Rarity;
  stats: PokemonStats;
  types: string[];
  acquiredAt: string;
}

interface TeamPreset {
  id: string;
  name: string;
  context: Mode;
  slots: TeamSlot[];
}

interface BattleResult {
  battleId: string;
  outcome: 'player' | 'opponent' | 'draw';
  turns: number;
  rewards: Reward[];
  log: BattleLogEntry[];
}

interface Reward {
  type: 'xp' | 'credits' | 'gems' | 'pokemon' | 'item';
  amount: number;
  payload?: unknown;
}

interface ShopItem {
  id: string;
  category: 'pokemon' | 'item' | 'cosmetic' | 'bundle';
  label: string;
  rarity: Rarity;
  priceCurrency: Currency;
  priceAmount: number;
  payload: unknown;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: { current: number; target: number; status: 'locked' | 'in_progress' | 'completed'; };
  rewards: Reward[];
}
```

Ces types doivent être regroupés dans un package partagé (`packages/contracts`) pour être importés côté frontend (validation via Zod/TypeScript) et backend (DTOs).

## 5. Gestion des variables globales
- `window.__ptaGetProgressState` : renvoi du `UserProfile` courant pour la page Survie/onboarding.
- `window.__ptaSelectedRoster` : tableau d ids Pokémon sélectionnés pour le run Survie.
- `window.__ptaSurvivalTeamSource` : `'roster' | 'balanced' | 'evolution'`.
- Limiter le nombre de globales : migrer vers un store central (Redux) ou contexte SPA dès que la refonte front sera lancée.
